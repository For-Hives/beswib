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
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Underline,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline cursor-pointer hover:text-primary/80',
				},
			}),
			Image.configure({
				HTMLAttributes: {
					class: 'rounded-lg max-w-full h-auto my-4',
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML())
		},
		editorProps: {
			attributes: {
				class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
			},
		},
	})

	// Update editor content when prop changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content)
		}
	}, [content, editor])

	if (!editor) {
		return null
	}

	const addLink = () => {
		const url = window.prompt('Enter URL:')
		if (url) {
			editor.chain().focus().setLink({ href: url }).run()
		}
	}

	const addImage = () => {
		const url = window.prompt('Enter image URL:')
		if (url) {
			editor.chain().focus().setImage({ src: url }).run()
		}
	}

	return (
		<div className={cn('border border-border rounded-xl overflow-hidden bg-card shadow-sm', className)}>
			{/* Toolbar */}
			<div className="border-b border-border bg-muted/30 p-3 flex flex-wrap gap-1 sticky top-0 z-10">
				{/* Text Formatting */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleBold().run()}
						disabled={!editor.can().chain().focus().toggleBold().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('bold') && 'bg-accent text-accent-foreground')}
						aria-label="Bold"
					>
						<Bold className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						disabled={!editor.can().chain().focus().toggleItalic().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('italic') && 'bg-accent text-accent-foreground')}
						aria-label="Italic"
					>
						<Italic className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						disabled={!editor.can().chain().focus().toggleUnderline().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('underline') && 'bg-accent text-accent-foreground')}
						aria-label="Underline"
					>
						<UnderlineIcon className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						disabled={!editor.can().chain().focus().toggleStrike().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('strike') && 'bg-accent text-accent-foreground')}
						aria-label="Strikethrough"
					>
						<Strikethrough className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleCode().run()}
						disabled={!editor.can().chain().focus().toggleCode().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('code') && 'bg-accent text-accent-foreground')}
						aria-label="Code"
					>
						<Code className="size-4" />
					</Button>
				</div>

				<div className="w-px h-9 bg-border mx-1" />

				{/* Headings */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						className={cn(
							'size-9 hover:bg-accent',
							editor.isActive('heading', { level: 1 }) && 'bg-accent text-accent-foreground'
						)}
						aria-label="Heading 1"
					>
						<Heading1 className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						className={cn(
							'size-9 hover:bg-accent',
							editor.isActive('heading', { level: 2 }) && 'bg-accent text-accent-foreground'
						)}
						aria-label="Heading 2"
					>
						<Heading2 className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						className={cn(
							'size-9 hover:bg-accent',
							editor.isActive('heading', { level: 3 }) && 'bg-accent text-accent-foreground'
						)}
						aria-label="Heading 3"
					>
						<Heading3 className="size-4" />
					</Button>
				</div>

				<div className="w-px h-9 bg-border mx-1" />

				{/* Lists */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('bulletList') && 'bg-accent text-accent-foreground')}
						aria-label="Bullet List"
					>
						<List className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('orderedList') && 'bg-accent text-accent-foreground')}
						aria-label="Ordered List"
					>
						<ListOrdered className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={cn('size-9 hover:bg-accent', editor.isActive('blockquote') && 'bg-accent text-accent-foreground')}
						aria-label="Quote"
					>
						<Quote className="size-4" />
					</Button>
				</div>

				<div className="w-px h-9 bg-border mx-1" />

				{/* Alignment */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().setTextAlign('left').run()}
						className={cn('size-9 hover:bg-accent', editor.isActive({ textAlign: 'left' }) && 'bg-accent text-accent-foreground')}
						aria-label="Align Left"
					>
						<AlignLeft className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().setTextAlign('center').run()}
						className={cn(
							'size-9 hover:bg-accent',
							editor.isActive({ textAlign: 'center' }) && 'bg-accent text-accent-foreground'
						)}
						aria-label="Align Center"
					>
						<AlignCenter className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().setTextAlign('right').run()}
						className={cn('size-9 hover:bg-accent', editor.isActive({ textAlign: 'right' }) && 'bg-accent text-accent-foreground')}
						aria-label="Align Right"
					>
						<AlignRight className="size-4" />
					</Button>
				</div>

				<div className="w-px h-9 bg-border mx-1" />

				{/* Media */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={addLink}
						className={cn('size-9 hover:bg-accent', editor.isActive('link') && 'bg-accent text-accent-foreground')}
						aria-label="Add Link"
					>
						<Link2 className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={addImage}
						aria-label="Add Image"
						className="size-9 hover:bg-accent"
					>
						<ImageIcon className="size-4" />
					</Button>
				</div>

				<div className="w-px h-9 bg-border mx-1" />

				{/* History */}
				<div className="flex gap-1">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().chain().focus().undo().run()}
						aria-label="Undo"
						className="size-9 hover:bg-accent"
					>
						<Undo className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().chain().focus().redo().run()}
						aria-label="Redo"
						className="size-9 hover:bg-accent"
					>
						<Redo className="size-4" />
					</Button>
				</div>
			</div>

			{/* Editor Content */}
			<div className="bg-background">
				<EditorContent editor={editor} className="tiptap-editor" />
			</div>

			{/* Custom Styles for Editor */}
			<style jsx global>{`
				.tiptap-editor .ProseMirror {
					outline: none;
				}

				.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
					color: hsl(var(--muted-foreground));
					content: attr(data-placeholder);
					float: left;
					height: 0;
					pointer-events: none;
				}

				.tiptap-editor .ProseMirror h1 {
					font-size: 2em;
					font-weight: 700;
					line-height: 1.2;
					margin-top: 1.5em;
					margin-bottom: 0.5em;
				}

				.tiptap-editor .ProseMirror h2 {
					font-size: 1.5em;
					font-weight: 600;
					line-height: 1.3;
					margin-top: 1.5em;
					margin-bottom: 0.5em;
				}

				.tiptap-editor .ProseMirror h3 {
					font-size: 1.25em;
					font-weight: 600;
					line-height: 1.4;
					margin-top: 1.5em;
					margin-bottom: 0.5em;
				}

				.tiptap-editor .ProseMirror p {
					margin-top: 0.75em;
					margin-bottom: 0.75em;
					line-height: 1.75;
				}

				.tiptap-editor .ProseMirror ul,
				.tiptap-editor .ProseMirror ol {
					padding-left: 1.5em;
					margin-top: 0.75em;
					margin-bottom: 0.75em;
				}

				.tiptap-editor .ProseMirror ul {
					list-style-type: disc;
				}

				.tiptap-editor .ProseMirror ol {
					list-style-type: decimal;
				}

				.tiptap-editor .ProseMirror li {
					margin-top: 0.25em;
					margin-bottom: 0.25em;
				}

				.tiptap-editor .ProseMirror blockquote {
					border-left: 3px solid hsl(var(--border));
					padding-left: 1em;
					margin-left: 0;
					margin-top: 1em;
					margin-bottom: 1em;
					font-style: italic;
					color: hsl(var(--muted-foreground));
				}

				.tiptap-editor .ProseMirror code {
					background-color: hsl(var(--muted));
					padding: 0.2em 0.4em;
					border-radius: 0.25rem;
					font-size: 0.875em;
					font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
				}

				.tiptap-editor .ProseMirror pre {
					background-color: hsl(var(--muted));
					padding: 1em;
					border-radius: 0.5rem;
					overflow-x: auto;
					margin-top: 1em;
					margin-bottom: 1em;
				}

				.tiptap-editor .ProseMirror pre code {
					background-color: transparent;
					padding: 0;
					font-size: 0.875em;
				}

				.tiptap-editor .ProseMirror a {
					color: hsl(var(--primary));
					text-decoration: underline;
					cursor: pointer;
				}

				.tiptap-editor .ProseMirror a:hover {
					opacity: 0.8;
				}

				.tiptap-editor .ProseMirror img {
					max-width: 100%;
					height: auto;
					border-radius: 0.5rem;
					margin: 1em 0;
				}

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

				.tiptap-editor .ProseMirror hr {
					border: none;
					border-top: 1px solid hsl(var(--border));
					margin: 2em 0;
				}
			`}</style>
		</div>
	)
}
