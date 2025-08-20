import React, { useEffect, useRef, useState } from 'react'
import { IconUpload } from '@tabler/icons-react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'motion/react'

import { getTranslations } from '@/lib/i18n/dictionary'
import { Locale } from '@/lib/i18n/config'
import { cn } from '@/lib/utils'

const mainVariant = {
	initial: {
		y: 0,
		x: 0,
	},
	animate: {
		y: -20,
		x: 20,
		opacity: 0.9,
	},
}

const secondaryVariant = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
	},
}

import organizerCreateTranslations from '@/app/[locale]/admin/organizer/create/locales.json'

export const FileUpload = ({ onChange, locale }: { locale: Locale; onChange?: (files: File[]) => void }) => {
	const translations = getTranslations(locale, organizerCreateTranslations)

	const [files, setFiles] = useState<File[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)

	const t = translations.organizers.create.form.logoUpload

	const handleFileChange = (newFiles: File[]) => {
		// Single file mode: replace any existing file with the new one
		const next = newFiles.slice(0, 1)
		setFiles(next)
	}

	const handleRemove = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index))
	}

	// Notify parent when local files state changes (post-render, safe)
	useEffect(() => {
		onChange?.(files)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files])

	const handleClick = () => {
		fileInputRef.current?.click()
	}

	const { isDragActive, getRootProps } = useDropzone({
		onDropRejected: error => {
			console.error('File upload rejected:', error)
		},
		onDrop: handleFileChange,
		noClick: true,
		multiple: false,
	})

	return (
		<div className="w-full" {...getRootProps()}>
			<motion.div
				className="group/file relative block w-full cursor-pointer overflow-hidden rounded-lg p-10"
				onClick={handleClick}
				whileHover="animate"
			>
				<input
					className="hidden"
					id="file-upload-handle"
					onChange={e => {
						const list = Array.from(e.target.files ?? [])
						handleFileChange(list)
						// Allow selecting the same file again
						e.currentTarget.value = ''
					}}
					ref={fileInputRef}
					type="file"
					accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
				/>
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
					<GridPattern />
				</div>
				<div className="flex flex-col items-center justify-center">
					<p className="text-foreground relative z-20 font-sans text-base font-bold">{t.uploadText}</p>
					<p className="text-muted-foreground relative z-20 mt-2 font-sans text-base font-normal">{t.uploadSubtext}</p>
					<div className="relative mx-auto mt-10 w-full max-w-xl">
						{files.length > 0 &&
							files.map((file, idx) => (
								<motion.div
									className={cn(
										'bg-card/80 dark:border-border/50 relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md border border-black/50 p-4 backdrop-blur-md md:h-24',
										'shadow-sm'
									)}
									key={'file' + idx}
									layoutId={idx === 0 ? 'file-upload' : 'file-upload-' + idx}
								>
									<button
										className="hover:text-foreground absolute top-2 right-2 rounded px-2 py-1 text-xs text-red-600"
										onClick={e => {
											e.stopPropagation()
											handleRemove(idx)
										}}
										type="button"
									>
										x
									</button>
									<div className="flex w-full items-center justify-between gap-4">
										<motion.p
											animate={{ opacity: 1 }}
											className="text-foreground max-w-xs truncate text-base"
											initial={{ opacity: 0 }}
											layout
										>
											{file.name}
										</motion.p>
										<motion.p
											animate={{ opacity: 1 }}
											className="text-muted-foreground bg-muted/50 w-fit shrink-0 rounded-lg px-2 py-1 text-sm shadow-xs"
											initial={{ opacity: 0 }}
											layout
										>
											{(file.size / (1024 * 1024)).toFixed(2)} {t.fileSizeUnit}
										</motion.p>
									</div>

									<div className="text-muted-foreground mt-2 flex w-full flex-col items-start justify-between text-sm md:flex-row md:items-center">
										<motion.p
											animate={{ opacity: 1 }}
											className="bg-muted/30 rounded-md px-1 py-0.5"
											initial={{ opacity: 0 }}
											layout
										>
											{file.type}
										</motion.p>

										<motion.p animate={{ opacity: 1 }} initial={{ opacity: 0 }} layout>
											{t.fileModified} {new Date(file.lastModified).toLocaleDateString()}
										</motion.p>
									</div>
								</motion.div>
							))}
						{!files.length && (
							<motion.div
								className={cn(
									'bg-card/80 dark:border-border/50 relative z-40 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-black/50 backdrop-blur-md group-hover/file:shadow-2xl',
									'shadow-[0px_10px_50px_rgba(0,0,0,0.1)]'
								)}
								layoutId="file-upload"
								transition={{
									type: 'spring',
									stiffness: 300,
									damping: 20,
								}}
								variants={mainVariant}
							>
								{isDragActive ? (
									<motion.p
										animate={{ opacity: 1 }}
										className="text-muted-foreground flex flex-col items-center"
										initial={{ opacity: 0 }}
									>
										{t.dropText}
										<IconUpload className="text-muted-foreground h-4 w-4" />
									</motion.p>
								) : (
									<IconUpload className="text-muted-foreground h-4 w-4" />
								)}
							</motion.div>
						)}

						{!files.length && (
							<motion.div
								className="border-primary/40 absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed bg-transparent opacity-0"
								variants={secondaryVariant}
							></motion.div>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	)
}

export function GridPattern() {
	const columns = 41
	const rows = 11
	return (
		<div className="bg-muted/20 flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col
					return (
						<div
							className={`flex h-10 w-10 shrink-0 rounded-[2px] ${
								index % 2 === 0
									? 'bg-muted/10'
									: 'bg-muted/10 shadow-[0px_0px_1px_3px_rgba(255,255,255,0.1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,0.1)_inset]'
							}`}
							key={`${col}-${row}`}
						/>
					)
				})
			)}
		</div>
	)
}
