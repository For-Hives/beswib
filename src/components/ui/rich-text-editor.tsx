'use client'

import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Code,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	Italic,
	Link2,
	List,
	ListOrdered,
	Quote,
	Redo,
	Strikethrough,
	Underline as UnderlineIcon,
	Undo,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
	content: string
	onChange: (html: string) => void
	placeholder?: string
	className?: string
}

export function RichTextEditor({
	content,
	onChange,
	placeholder = 'Start writing...',
	className,
}: RichTextEditorProps) {
	const editor = useEditor(
		{
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3],
					},
					bulletList: {
						keepMarks: true,
						keepAttributes: false,
					},
					orderedList: {
						keepMarks: true,
						keepAttributes: false,
					},
				}),
				Underline,
				TextAlign.configure({
					types: ['heading', 'paragraph'],
				}),
				Link.configure({
					openOnClick: false,
					autolink: true,
					defaultProtocol: 'https',
					protocols: ['http', 'https'],
					HTMLAttributes: {
						class: 'text-primary underline cursor-pointer hover:text-primary/80 transition-colors',
					},
				}),
				Image.configure({
					inline: false,
					allowBase64: true,
					HTMLAttributes: {
						class: 'rounded-lg max-w-full h-auto my-4 shadow-sm',
					},
				}),
				Placeholder.configure({
					placeholder,
					emptyEditorClass: 'is-editor-empty',
				}),
			],
			content,
			onUpdate: ({ editor }) => {
				const html = editor.getHTML()
				onChange(html)
			},
			editorProps: {
				attributes: {
					class:
						'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4 text-foreground',
				},
			},
		},
		[]
	)

	// Sync content changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			const { from, to } = editor.state.selection
			editor.commands.setContent(content, { emitUpdate: false })
			editor.commands.setTextSelection({ from, to })
		}
	}, [content, editor])

	if (!editor) {
		return null
	}

	const addLink = () => {
		const { from, to } = editor.state.selection
		const selectedText = editor.state.doc.textBetween(from, to, '')

		// Check if we're editing an existing link
		const previousUrl = editor.getAttributes('link').href

		if (selectedText) {
			// Text is selected - just ask for URL
			const url = window.prompt('Enter URL:', previousUrl || '')

			if (url === null) {
				return
			}

			if (url === '') {
				editor.chain().focus().extendMarkRange('link').unsetLink().run()
				return
			}

			editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
		} else {
			// No text selected - ask for both text and URL
			const text = window.prompt('Enter link text:')
			if (!text) return

			const url = window.prompt('Enter URL:')
			if (!url) return

			editor
				.chain()
				.focus()
				.insertContent({
					type: 'text',
					text: text,
					marks: [
						{
							type: 'link',
							attrs: {
								href: url,
							},
						},
					],
				})
				.run()
		}
	}

	const addImage = () => {
		// Create a file input element
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'image/*'

		input.onchange = (e: Event) => {
			const target = e.target as HTMLInputElement
			const file = target.files?.[0]

			if (file) {
				// Check file size (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					alert('Image size should be less than 5MB')
					return
				}

				// Convert to base64
				const reader = new FileReader()
				reader.onload = readerEvent => {
					const base64 = readerEvent.target?.result as string
					if (base64) {
						editor.chain().focus().setImage({ src: base64 }).run()
					}
				}
				reader.readAsDataURL(file)
			}
		}

		// Trigger file picker
		input.click()
	}

	return (
		<div className={cn('border border-border rounded-xl overflow-hidden bg-card shadow-sm', className)}>
			{/* Toolbar */}
			<div className="border-b border-border bg-muted/30 p-3 flex flex-wrap gap-2 sticky top-0 z-10">
				{/* Text Formatting */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-accent text-accent-foreground')}
						title="Bold (Ctrl+B)"
					>
						<Bold className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-accent text-accent-foreground')}
						title="Italic (Ctrl+I)"
					>
						<Italic className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						disabled={!editor.can().chain().focus().toggleUnderline().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-accent text-accent-foreground')}
						title="Underline (Ctrl+U)"
					>
						<UnderlineIcon className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						disabled={!editor.can().chain().focus().toggleStrike().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-accent text-accent-foreground')}
						title="Strikethrough"
					>
						<Strikethrough className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleCode().run()}
						disabled={!editor.can().chain().focus().toggleCode().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-accent text-accent-foreground')}
						title="Code"
					>
						<Code className="h-4 w-4" />
					</Button>
				</div>

				<div className="w-px h-8 bg-border" />

				{/* Headings */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						className={cn(
							'h-8 w-8 p-0',
							editor.isActive('heading', { level: 1 }) && 'bg-accent text-accent-foreground'
						)}
						title="Heading 1"
					>
						<Heading1 className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						className={cn(
							'h-8 w-8 p-0',
							editor.isActive('heading', { level: 2 }) && 'bg-accent text-accent-foreground'
						)}
						title="Heading 2"
					>
						<Heading2 className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						className={cn(
							'h-8 w-8 p-0',
							editor.isActive('heading', { level: 3 }) && 'bg-accent text-accent-foreground'
						)}
						title="Heading 3"
					>
						<Heading3 className="h-4 w-4" />
					</Button>
				</div>

				<div className="w-px h-8 bg-border" />

				{/* Lists */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-accent text-accent-foreground')}
						title="Bullet List"
					>
						<List className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-accent text-accent-foreground')}
						title="Ordered List"
					>
						<ListOrdered className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={cn('h-8 w-8 p-0', editor.isActive('blockquote') && 'bg-accent text-accent-foreground')}
						title="Blockquote"
					>
						<Quote className="h-4 w-4" />
					</Button>
				</div>

				<div className="w-px h-8 bg-border" />

				{/* Alignment */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign('left').run()}
						className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'left' }) && 'bg-accent text-accent-foreground')}
						title="Align Left"
					>
						<AlignLeft className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign('center').run()}
						className={cn(
							'h-8 w-8 p-0',
							editor.isActive({ textAlign: 'center' }) && 'bg-accent text-accent-foreground'
						)}
						title="Align Center"
					>
						<AlignCenter className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().setTextAlign('right').run()}
						className={cn('h-8 w-8 p-0', editor.isActive({ textAlign: 'right' }) && 'bg-accent text-accent-foreground')}
						title="Align Right"
					>
						<AlignRight className="h-4 w-4" />
					</Button>
				</div>

				<div className="w-px h-8 bg-border" />

				{/* Media */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={addLink}
						className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-accent text-accent-foreground')}
						title="Add Link"
					>
						<Link2 className="h-4 w-4" />
					</Button>
					<Button type="button" variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0" title="Add Image">
						<ImageIcon className="h-4 w-4" />
					</Button>
				</div>

				<div className="w-px h-8 bg-border" />

				{/* History */}
				<div className="flex gap-1 items-center">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().chain().focus().undo().run()}
						className="h-8 w-8 p-0"
						title="Undo (Ctrl+Z)"
					>
						<Undo className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().chain().focus().redo().run()}
						className="h-8 w-8 p-0"
						title="Redo (Ctrl+Y)"
					>
						<Redo className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Editor Content */}
			<div className="bg-background relative">
				<EditorContent editor={editor} className="tiptap-editor" />
			</div>

			{/* Global Styles for Tiptap */}
			<style jsx global>{`
				/* Editor Styles */
				.tiptap-editor .ProseMirror {
					outline: none;
				}

				/* Placeholder */
				.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
					color: hsl(var(--muted-foreground) / 0.5);
					content: attr(data-placeholder);
					float: left;
					height: 0;
					pointer-events: none;
				}

				/* Typography */
				.tiptap-editor .ProseMirror h1 {
					font-size: 2.25em;
					font-weight: 700;
					line-height: 1.2;
					margin-top: 1.5em;
					margin-bottom: 0.75em;
					color: hsl(var(--foreground));
				}

				.tiptap-editor .ProseMirror h2 {
					font-size: 1.875em;
					font-weight: 600;
					line-height: 1.3;
					margin-top: 1.5em;
					margin-bottom: 0.75em;
					color: hsl(var(--foreground));
				}

				.tiptap-editor .ProseMirror h3 {
					font-size: 1.5em;
					font-weight: 600;
					line-height: 1.4;
					margin-top: 1.5em;
					margin-bottom: 0.75em;
					color: hsl(var(--foreground));
				}

				.tiptap-editor .ProseMirror p {
					margin-top: 0.75em;
					margin-bottom: 0.75em;
					line-height: 1.75;
				}

				.tiptap-editor .ProseMirror p:first-child {
					margin-top: 0;
				}

				.tiptap-editor .ProseMirror p:last-child {
					margin-bottom: 0;
				}

				/* Lists */
				.tiptap-editor .ProseMirror ul,
				.tiptap-editor .ProseMirror ol {
					padding-left: 2em;
					margin-top: 1em;
					margin-bottom: 1em;
				}

				.tiptap-editor .ProseMirror ul {
					list-style-type: disc;
				}

				.tiptap-editor .ProseMirror ol {
					list-style-type: decimal;
				}

				.tiptap-editor .ProseMirror ul ul,
				.tiptap-editor .ProseMirror ol ul {
					list-style-type: circle;
				}

				.tiptap-editor .ProseMirror ol ol,
				.tiptap-editor .ProseMirror ul ol {
					list-style-type: lower-latin;
				}

				.tiptap-editor .ProseMirror li {
					margin-top: 0.5em;
					margin-bottom: 0.5em;
				}

				.tiptap-editor .ProseMirror li p {
					margin-top: 0.25em;
					margin-bottom: 0.25em;
				}

				/* Blockquote */
				.tiptap-editor .ProseMirror blockquote {
					border-left: 4px solid hsl(var(--primary) / 0.3);
					padding-left: 1.5em;
					padding-top: 0.5em;
					padding-bottom: 0.5em;
					margin-left: 0;
					margin-top: 1.5em;
					margin-bottom: 1.5em;
					font-style: italic;
					color: hsl(var(--muted-foreground));
					background: hsl(var(--muted) / 0.3);
					border-radius: 0.375rem;
				}

				/* Code */
				.tiptap-editor .ProseMirror code {
					background-color: hsl(var(--muted));
					color: hsl(var(--foreground));
					padding: 0.2em 0.4em;
					border-radius: 0.25rem;
					font-size: 0.875em;
					font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono',
						'Courier New', monospace;
					font-weight: 500;
				}

				.tiptap-editor .ProseMirror pre {
					background-color: hsl(var(--muted));
					color: hsl(var(--foreground));
					padding: 1em;
					border-radius: 0.5rem;
					overflow-x: auto;
					margin-top: 1.5em;
					margin-bottom: 1.5em;
					border: 1px solid hsl(var(--border));
				}

				.tiptap-editor .ProseMirror pre code {
					background-color: transparent;
					padding: 0;
					font-size: 0.875em;
				}

				/* Links */
				.tiptap-editor .ProseMirror a {
					color: hsl(var(--primary));
					text-decoration: underline;
					cursor: pointer;
					transition: opacity 0.2s;
				}

				.tiptap-editor .ProseMirror a:hover {
					opacity: 0.8;
				}

				/* Images */
				.tiptap-editor .ProseMirror img {
					max-width: 100%;
					height: auto;
					border-radius: 0.5rem;
					margin: 1.5em 0;
					display: block;
				}

				.tiptap-editor .ProseMirror img.ProseMirror-selectednode {
					outline: 3px solid hsl(var(--primary));
					outline-offset: 2px;
				}

				/* Text Formatting */
				.tiptap-editor .ProseMirror strong {
					font-weight: 700;
				}

				.tiptap-editor .ProseMirror em {
					font-style: italic;
				}

				.tiptap-editor .ProseMirror u {
					text-decoration: underline;
				}

				.tiptap-editor .ProseMirror s {
					text-decoration: line-through;
				}

				/* Horizontal Rule */
				.tiptap-editor .ProseMirror hr {
					border: none;
					border-top: 2px solid hsl(var(--border));
					margin: 2em 0;
				}

				/* Text Alignment */
				.tiptap-editor .ProseMirror [style*='text-align: center'] {
					text-align: center;
				}

				.tiptap-editor .ProseMirror [style*='text-align: right'] {
					text-align: right;
				}

				.tiptap-editor .ProseMirror [style*='text-align: left'] {
					text-align: left;
				}
			`}</style>
		</div>
	)
}
