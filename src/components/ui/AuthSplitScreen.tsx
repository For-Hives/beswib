'use client'

import { ReactNode } from 'react'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import { authTranslations } from '@/lib/translations/auth'
import { Locale } from '@/lib/i18n-config'

import MountainShader from './MountainShader'

interface AuthSplitScreenProps {
	children: ReactNode
}

export default function AuthSplitScreen({ children }: Readonly<AuthSplitScreenProps>) {
	const params = useParams()
	const locale = (params?.locale as Locale) || 'en'
	const t = authTranslations[locale]
	return (
		<div className="flex min-h-screen items-center justify-center overflow-hidden p-4">
			<div className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-xl">
				{/* Grid Layout */}
				<div className="grid min-h-[600px] md:grid-cols-12">
					{/* Left Side - Visual Panel (Shader integrated into image) */}
					<div className="relative overflow-hidden md:col-span-6">
						{/* Base image (behind) */}
						<div className="absolute inset-0 z-0">
							<Image
								src="/mountain.png"
								alt="Mountain"
								fill
								sizes="(min-width: 768px) 50vw, 100vw"
								priority
								className="object-cover"
							/>
						</div>

						{/* Mountain Shader Animation */}
						{/* <div className="pointer-events-none absolute inset-0 z-10 w-full">
							<MountainShader className="absolute top-0 left-0 h-full w-full opacity-90" />
						</div> */}

						{/* Subtle light overlay to keep things soft */}
						<div className="absolute inset-0 z-20 bg-white/20" />
					</div>

					{/* Right Side - Form Panel */}
					<div className="bg-background/95 flex flex-col justify-center p-8 backdrop-blur-sm md:col-span-6 md:p-12">
						<div className="mx-auto w-full max-w-md">
							{/* Clerk Form Container */}
							<div className="space-y-6">{children}</div>

							{/* Additional Info */}
							<div className="mt-8 text-center">
								<p className="text-muted-foreground text-xs">
									{t.legal.termsText}{' '}
									<Link href={`/${locale}/legals/terms`} className="text-primary hover:underline">
										{t.legal.termsOfService}
									</Link>{' '}
									{t.legal.and}{' '}
									<Link href={`/${locale}/legals/privacy-policy`} className="text-primary hover:underline">
										{t.legal.privacyPolicy}
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
