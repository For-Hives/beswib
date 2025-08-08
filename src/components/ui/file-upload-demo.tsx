'use client'
import React, { useState } from 'react'

import { FileUpload } from './file-upload'

export default function FileUploadDemo() {
	const [, setFiles] = useState<File[]>([])
	const handleFileUpload = (files: File[]) => {
		setFiles(files)
		// Handle file upload logic here 📤
	}

	return (
		<div className="bg-card/80 dark:border-border/50 mx-auto w-full max-w-4xl rounded-lg border border-black/50 backdrop-blur-md">
			<FileUpload locale="en" onChange={handleFileUpload} />
			{/*  TODO: if the Demo component is still used, make the locales dynamic 🌐 (Translated from French) */}
		</div>
	)
}
