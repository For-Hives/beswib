'use client'

import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from '@tanstack/react-table'
import {
	Calendar,
	ChevronDown,
	ChevronFirst,
	ChevronLast,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	CircleAlert,
	CircleX,
	Columns3,
	Edit,
	Eye,
	FileText,
	Globe,
	Languages,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { deleteArticleAction, getAllArticlesAction } from '@/app/[locale]/admin/article/actions'
import translations from '@/app/[locale]/admin/article/locales.json'
import ArticleTranslationIndicator from '@/components/admin/article/ArticleTranslationIndicator'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/inputAlt'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Locale } from '@/lib/i18n/config'
import { localeFlags } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/dictionary'
import { cn } from '@/lib/utils'
import { formatDateObjectForDisplay } from '@/lib/utils/date'
import type { Article } from '@/models/article.model'
import type { User } from '@/models/user.model'

interface AdminArticlesPageClientProps {
	currentUser: null | User
	locale: Locale
}

interface ArticlesStats {
	draftArticles: number
	publishedArticles: number
	totalArticles: number
}

interface ArticlesTranslations {
	articles: {
		actions: {
			createArticle: string
			createArticleDescription: string
		}
		filters: {
			search: string
			showAllLanguages: string
			showFrenchOnly: string
		}
		sections: {
			actions: {
				description: string
				title: string
			}
			overview: {
				description: string
				title: string
			}
		}
		stats: {
			draftArticles: string
			publishedArticles: string
			totalArticles: string
		}
		subtitle: string
		table: {
			actions: {
				delete: string
				edit: string
				view: string
			}
			columns: {
				actions: string
				created: string
				slug: string
				title: string
				updated: string
			}
			controls: {
				cancel: string
				clearFilter: string
				confirmDelete: string
				deleteDescription: string
				deleteSelected: string
				no: string
				rowsPerPage: string
				selectAll: string
				selectRow: string
				toggleColumns: string
				yes: string
			}
			empty: {
				createButton: string
				description: string
				title: string
			}
		}
		title: string
		ui: {
			accessError: string
			accessErrorDescription: string
			connectedAs: string
			loading: string
			refreshing: string
			signIn: string
		}
	}
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Article & { translationCount?: number; publishedCount?: number }> = (
	row,
	_columnId,
	filterValue
) => {
	const searchableRowContent =
		`${row.original.title ?? ''} ${row.original.slug ?? ''} ${row.original.description ?? ''}`.toLowerCase()
	const searchTerm = String(filterValue ?? '').toLowerCase()
	return searchableRowContent.includes(searchTerm)
}

export default function AdminArticlesPageClient({ locale, currentUser }: AdminArticlesPageClientProps) {
	const t = getTranslations(locale, translations)

	const router = useRouter()
	const id = useId()
	const inputRef = useRef<HTMLInputElement>(null)

	const [articles, setArticles] = useState<Array<Article & { translationCount?: number; publishedCount?: number }>>([])
	const [stats, setStats] = useState<ArticlesStats | null>(null)
	const [showAllLanguages, setShowAllLanguages] = useState(false)

	// Table state
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	})
	const [sorting, setSorting] = useState<SortingState>([
		{
			desc: true,
			id: 'created',
		},
	])

	// Define columns with extended Article type including translation stats
	const columns: ColumnDef<Article & { translationCount?: number; publishedCount?: number }>[] = useMemo(
		() => [
			{
				id: 'select',
				size: 28,
				enableHiding: false,
				enableSorting: false,
				header: ({ table }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							aria-label={t.articles.table.controls.selectAll}
							checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
							onCheckedChange={value => table.toggleAllPageRowsSelected(value === true)}
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							aria-label={t.articles.table.controls.selectRow}
							checked={row.getIsSelected()}
							onCheckedChange={value => row.toggleSelected(value === true)}
						/>
					</div>
				),
			},
			{
				size: 300,
				accessorKey: 'title',
				enableHiding: false,
				filterFn: multiColumnFilterFn,
				header: t.articles.table.columns.title,
				cell: ({ row }) => <div className="font-medium">{row.getValue('title') ?? 'N/A'}</div>,
			},
			{
				size: 180,
				accessorKey: 'slug',
				header: t.articles.table.columns.slug,
				cell: ({ row }) => {
					const slug = row.getValue('slug') as string
					const displaySlug = slug?.length > 30 ? `${slug.substring(0, 30)}...` : slug
					return (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Badge className="max-w-full cursor-help truncate font-mono text-xs" variant="outline">
										{displaySlug || 'N/A'}
									</Badge>
								</TooltipTrigger>
								{slug && slug.length > 30 && (
									<TooltipContent>
										<p className="max-w-md break-all">{slug}</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					)
				},
			},
			{
				size: 100,
				accessorKey: 'isDraft',
				header: t.articles.table.columns.status,
				cell: ({ row }) => {
					const isDraft = row.getValue('isDraft')
					return (
						<Badge
							variant={isDraft ? 'secondary' : 'default'}
							className={
								isDraft
									? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
									: 'bg-green-500/20 text-green-700 dark:text-green-400'
							}
						>
							{isDraft ? t.articles.table.status.draft : t.articles.table.status.published}
						</Badge>
					)
				},
			},
			{
				size: 120,
				accessorKey: 'created',
				header: t.articles.table.columns.created,
				cell: ({ row }) => {
					const date = row.getValue('created')
					return (
						<div>
							{date != null && date !== undefined && date !== ''
								? formatDateObjectForDisplay(new Date(date as string), locale)
								: 'N/A'}
						</div>
					)
				},
			},
			{
				size: 120,
				accessorKey: 'updated',
				header: t.articles.table.columns.updated,
				cell: ({ row }) => {
					const date = row.getValue('updated')
					return (
						<div>
							{date != null && date !== undefined && date !== ''
								? formatDateObjectForDisplay(new Date(date as string), locale)
								: 'N/A'}
						</div>
					)
				},
			},
			{
				id: 'translations',
				size: 120,
				accessorKey: 'locale',
				header: 'Languages',
				cell: ({ row }) => {
					const article = row.original
					const currentLocale = article.locale as Locale
					const translationCount = article.translationCount || 1
					const publishedCount = article.publishedCount || (article.isDraft ? 0 : 1)
					const totalLanguages = 9

					return (
						<div className="flex flex-col items-center gap-1.5 py-1">
							{/* Ligne 1: Drapeau */}
							<div className="text-2xl" title={currentLocale?.toUpperCase()}>
								{currentLocale && localeFlags[currentLocale] ? localeFlags[currentLocale] : '🏳️'}
							</div>

							{/* Ligne 2: Nombre de langues complétées */}
							<Badge
								variant={
									translationCount === totalLanguages ? 'default' : translationCount > 1 ? 'secondary' : 'outline'
								}
								className="flex h-5 items-center gap-1 px-2 text-xs font-medium"
							>
								<Languages className="h-3 w-3" />
								<span>
									{translationCount}/{totalLanguages}
								</span>
							</Badge>

							{/* Ligne 3: Statut Draft/Published */}
							<Badge
								variant={publishedCount === translationCount ? 'default' : publishedCount > 0 ? 'secondary' : 'outline'}
								className={`flex h-5 items-center gap-1 px-2 text-xs font-medium ${
									publishedCount === translationCount
										? 'bg-green-500/20 text-green-700 dark:text-green-400'
										: publishedCount > 0
											? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
											: ''
								}`}
							>
								<FileText className="h-3 w-3" />
								<span>
									{publishedCount}/{translationCount}
								</span>
							</Badge>
						</div>
					)
				},
			},
			{
				id: 'actions',
				size: 60,
				enableHiding: false,
				enableSorting: false,
				header: () => <span className="sr-only">{t.articles.table.columns.actions}</span>,
				cell: ({ row }) => <RowActions row={row} t={t} />,
			},
		],
		[t, locale]
	)

	useEffect(() => {
		const fetchArticles = async () => {
			try {
				const result = await getAllArticlesAction(showAllLanguages)

				if (result.success && result.data) {
					const articlesData = result.data
					setArticles(articlesData)

					// Calculate stats based on isDraft field
					const statsData: ArticlesStats = {
						totalArticles: articlesData.length,
						publishedArticles: articlesData.filter(article => !article.isDraft).length,
						draftArticles: articlesData.filter(article => article.isDraft).length,
					}
					setStats(statsData)
				} else {
					console.error('Error fetching articles:', result.error)
					setArticles([])
					setStats({
						draftArticles: 0,
						publishedArticles: 0,
						totalArticles: 0,
					})
				}
			} catch (error) {
				console.error('Error fetching articles:', error)
				setArticles([])
				setStats({
					draftArticles: 0,
					publishedArticles: 0,
					totalArticles: 0,
				})
			}
		}

		void fetchArticles()
	}, [showAllLanguages])

	// Listen to deletion events from RowActions to update local state
	useEffect(() => {
		const onDeleted: EventListener = e => {
			const id = (e as unknown as CustomEvent<{ id: string }>).detail?.id
			if (id) {
				setArticles(prev => prev.filter(article => article.id !== id))
			}
		}
		document.addEventListener('admin-articles:deleted', onDeleted)
		return () => {
			document.removeEventListener('admin-articles:deleted', onDeleted)
		}
	}, [])

	// Keep stats in sync when articles change
	useEffect(() => {
		setStats({
			totalArticles: articles.length,
			publishedArticles: articles.filter(article => !article.isDraft).length,
			draftArticles: articles.filter(article => article.isDraft).length,
		})
	}, [articles])

	const handleDeleteRows = () => {
		const selectedRows = table.getSelectedRowModel().rows
		const updatedData = articles.filter(item => !selectedRows.some(row => row.original.id === item.id))
		setArticles(updatedData)
		table.resetRowSelection()
	}

	const table = useReactTable({
		columns,
		data: articles,
		enableSortingRemoval: false,
		getCoreRowModel: getCoreRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		state: {
			columnFilters,
			columnVisibility,
			pagination,
			sorting,
		},
	})

	// Safety check - if currentUser is null, show error
	if (!currentUser) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-linear-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="dark:border-border/50 bg-card/80 w-full max-w-md rounded-3xl border border-black/50 p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.articles.ui.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{t.articles.ui.accessErrorDescription}</p>
						<button
							type="button"
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/auth/sign-in')}
						>
							{t.articles.ui.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-linear-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.articles.ui.connectedAs}</p>
						<p className="text-foreground font-medium">
							{currentUser.firstName ?? 'Anonymous'} {currentUser.lastName ?? ''} ({currentUser.email})
						</p>
					</div>
					<div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
						{currentUser.role.toUpperCase()}
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-7xl p-6">
					<div className="space-y-8">
						{/* Header */}
						<div className="space-y-2 text-center">
							<h1 className="text-foreground text-4xl font-bold">{t.articles.title}</h1>
							<p className="text-muted-foreground text-lg">{t.articles.subtitle}</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.articles.stats.totalArticles}</CardTitle>
									<Calendar className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalArticles ?? 0}</div>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.articles.stats.publishedArticles}</CardTitle>
									<Calendar className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.publishedArticles ?? 0}</div>
								</CardContent>
							</Card>

							<Card className="dark:border-border/50 bg-card/80 border-black/50 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.articles.stats.draftArticles}</CardTitle>
									<Calendar className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.draftArticles ?? 0}</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions Section */}
						<div className="mb-8">
							<div className="mb-6">
								<h2 className="text-foreground mb-2 text-2xl font-bold">{t.articles.sections.actions.title}</h2>
								<p className="text-muted-foreground">{t.articles.sections.actions.description}</p>
							</div>

							<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
								{/* Create Article Card */}
								<Link href="/admin/article/create">
									<Card className="dark:border-border/50 bg-card/80 hover:bg-card/90 group cursor-pointer border-black/50 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.15),inset_0_0_60px_hsl(var(--accent)/0.1),0_0_50px_hsl(var(--primary)/0.25)]">
										<CardHeader>
											<div className="flex items-center gap-3">
												<div className="bg-primary/10 text-primary rounded-lg p-2">
													<Plus className="h-5 w-5" />
												</div>
												<div>
													<CardTitle className="text-foreground group-hover:text-primary transition-colors">
														{t.articles.actions.createArticle}
													</CardTitle>
													<CardDescription className="text-muted-foreground">
														{t.articles.actions.createArticleDescription}
													</CardDescription>
												</div>
											</div>
										</CardHeader>
									</Card>
								</Link>
							</div>
						</div>

						{/* Advanced Table Section */}
						<div className="space-y-4">
							{/* Filters */}
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									{/* Language filter toggle */}
									<Button
										variant={showAllLanguages ? 'default' : 'outline'}
										onClick={() => setShowAllLanguages(!showAllLanguages)}
										className="flex items-center gap-2"
									>
										<Globe aria-hidden="true" size={16} />
										{showAllLanguages ? t.articles.filters.showFrenchOnly : t.articles.filters.showAllLanguages}
									</Button>

									{/* Filter by title, slug, or description */}
									<div className="relative">
										<Input
											aria-label={t.articles.filters.search}
											className={cn(
												'peer min-w-60 ps-9',
												table.getColumn('title')?.getFilterValue() !== undefined &&
													table.getColumn('title')?.getFilterValue() !== '' &&
													'pe-9'
											)}
											id={`${id}-input`}
											onChange={e => table.getColumn('title')?.setFilterValue(e.target.value)}
											placeholder={t.articles.filters.search}
											ref={inputRef}
											type="text"
											value={(table.getColumn('title')?.getFilterValue() ?? '') as string}
										/>
										<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
											<Search aria-hidden="true" size={16} />
										</div>
										{table.getColumn('title')?.getFilterValue() !== undefined &&
											table.getColumn('title')?.getFilterValue() !== '' && (
												<button
													type="button"
													aria-label={t.articles.table.controls.clearFilter}
													className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
													onClick={() => {
														table.getColumn('title')?.setFilterValue('')
														if (inputRef.current) {
															inputRef.current.focus()
														}
													}}
												>
													<CircleX aria-hidden="true" size={16} />
												</button>
											)}
									</div>

									{/* Toggle columns visibility */}
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline">
												<Columns3 aria-hidden="true" className="-ms-1 opacity-60" size={16} />
												{t.articles.table.controls.toggleColumns}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>{t.articles.table.controls.toggleColumns}</DropdownMenuLabel>
											{table
												.getAllColumns()
												.filter(column => column.getCanHide())
												.map(column => {
													return (
														<DropdownMenuCheckboxItem
															checked={column.getIsVisible()}
															className="capitalize"
															key={`column-${column.id}`}
															onCheckedChange={(value: boolean) => column.toggleVisibility(!!value)}
															onSelect={event => event.preventDefault()}
														>
															{column.id}
														</DropdownMenuCheckboxItem>
													)
												})}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className="flex items-center gap-3">
									{/* Delete button */}
									{table.getSelectedRowModel().rows.length > 0 && (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button className="ml-auto" variant="outline">
													<Trash2 aria-hidden="true" className="-ms-1 opacity-60" size={16} />
													{t.articles.table.controls.deleteSelected}
													<span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
														{table.getSelectedRowModel().rows.length}
													</span>
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
													<div
														aria-hidden="true"
														className="flex size-9 shrink-0 items-center justify-center rounded-full border"
													>
														<CircleAlert className="opacity-80" size={16} />
													</div>
													<AlertDialogHeader>
														<AlertDialogTitle>{t.articles.table.controls.confirmDelete}</AlertDialogTitle>
														<AlertDialogDescription>
															{t.articles.table.controls.deleteDescription} {table.getSelectedRowModel().rows.length}{' '}
															selected {table.getSelectedRowModel().rows.length === 1 ? 'article' : 'articles'}.
														</AlertDialogDescription>
													</AlertDialogHeader>
												</div>
												<AlertDialogFooter>
													<AlertDialogCancel>{t.articles.table.controls.cancel}</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={handleDeleteRows}
													>
														{t.articles.table.controls.deleteSelected}
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							</div>

							{/* Table */}
							<div className="bg-card/80 dark:border-border/50 overflow-hidden rounded-2xl border border-black/50 shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
								<Table className="table-fixed">
									<TableHeader>
										{table.getHeaderGroups().map(headerGroup => (
											<TableRow className="hover:bg-transparent" key={headerGroup.id}>
												{headerGroup.headers.map(header => {
													return (
														<TableHead className="h-11" key={header.id} style={{ width: `${header.getSize()}px` }}>
															{header.isPlaceholder ? null : header.column.getCanSort() ? (
																<button
																	type="button"
																	className={cn(
																		header.column.getCanSort() &&
																			'flex h-full w-full cursor-pointer items-center justify-between gap-2 select-none border-0 bg-transparent p-0 text-left'
																	)}
																	onClick={header.column.getToggleSortingHandler()}
																	onKeyDown={e => {
																		if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
																			e.preventDefault()
																			header.column.getToggleSortingHandler()?.(e)
																		}
																	}}
																	tabIndex={header.column.getCanSort() ? 0 : undefined}
																>
																	{flexRender(header.column.columnDef.header, header.getContext())}
																	{{
																		asc: <ChevronUp aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
																		desc: <ChevronDown aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
																	}[header.column.getIsSorted() as string] ?? null}
																</button>
															) : (
																flexRender(header.column.columnDef.header, header.getContext())
															)}
														</TableHead>
													)
												})}
											</TableRow>
										))}
									</TableHeader>
									<TableBody>
										{table.getRowModel().rows?.length ? (
											table.getRowModel().rows.map(row => (
												<TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
													{row.getVisibleCells().map(cell => (
														<TableCell className="last:py-0" key={cell.id}>
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</TableCell>
													))}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell className="h-24 text-center" colSpan={columns.length}>
													<div className="text-center">
														<h3 className="text-foreground text-lg font-semibold">{t.articles.table.empty.title}</h3>
														<p className="text-muted-foreground mb-4">{t.articles.table.empty.description}</p>
														<Link href="/admin/article/create">
															<Button>{t.articles.table.empty.createButton}</Button>
														</Link>
													</div>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>

							{/* Pagination */}
							<div className="flex items-center justify-between gap-8">
								{/* Results per page */}
								<div className="flex items-center gap-3">
									<Label className="max-sm:sr-only" htmlFor={id}>
										{t.articles.table.controls.rowsPerPage}
									</Label>
									{(() => {
										const pageSizeOptions: SelectOption[] = [5, 10, 25, 50].map(n => ({
											label: n.toString(),
											value: n.toString(),
										}))
										return (
											<SelectAnimated
												onValueChange={(value: string) => {
													table.setPageSize(Number(value))
												}}
												options={pageSizeOptions}
												placeholder="Select number of results"
												value={table.getState().pagination.pageSize.toString()}
											/>
										)
									})()}
								</div>

								{/* Page number information */}
								<div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
									<p aria-live="polite" className="text-muted-foreground text-sm whitespace-nowrap">
										<span className="text-foreground">
											{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
											{Math.min(
												Math.max(
													table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
														table.getState().pagination.pageSize,
													0
												),
												table.getRowCount()
											)}
										</span>{' '}
										of <span className="text-foreground">{table.getRowCount().toString()}</span>
									</p>
								</div>

								{/* Pagination buttons */}
								<div>
									<Pagination>
										<PaginationContent>
											{/* First page button */}
											<PaginationItem>
												<Button
													aria-label="Go to first page"
													className="disabled:pointer-events-none disabled:opacity-50"
													disabled={!table.getCanPreviousPage()}
													onClick={() => table.firstPage()}
													size="icon"
													variant="outline"
												>
													<ChevronFirst aria-hidden="true" size={16} />
												</Button>
											</PaginationItem>
											{/* Previous page button */}
											<PaginationItem>
												<Button
													aria-label="Go to previous page"
													className="disabled:pointer-events-none disabled:opacity-50"
													disabled={!table.getCanPreviousPage()}
													onClick={() => table.previousPage()}
													size="icon"
													variant="outline"
												>
													<ChevronLeft aria-hidden="true" size={16} />
												</Button>
											</PaginationItem>
											{/* Next page button */}
											<PaginationItem>
												<Button
													aria-label="Go to next page"
													className="disabled:pointer-events-none disabled:opacity-50"
													disabled={!table.getCanNextPage()}
													onClick={() => table.nextPage()}
													size="icon"
													variant="outline"
												>
													<ChevronRight aria-hidden="true" size={16} />
												</Button>
											</PaginationItem>
											{/* Last page button */}
											<PaginationItem>
												<Button
													aria-label="Go to last page"
													className="disabled:pointer-events-none disabled:opacity-50"
													disabled={!table.getCanNextPage()}
													onClick={() => table.lastPage()}
													size="icon"
													variant="outline"
												>
													<ChevronLast aria-hidden="true" size={16} />
												</Button>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function RowActions({ t, row }: { row: Row<Article>; t: ArticlesTranslations }) {
	const router = useRouter()
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [deleting, setDeleting] = useState(false)

	const handleDelete = async () => {
		try {
			setDeleting(true)
			const id = row.original.id
			const result = await deleteArticleAction(id)
			if (result.success) {
				// Optimistically remove the row from the table data via a custom event
				document.dispatchEvent(new CustomEvent('admin-articles:deleted', { detail: { id } }))
				toast.success('Article deleted successfully')
			} else {
				console.error('Failed to delete article:', result.error)
				toast.error('Failed to delete article')
			}
		} catch (e) {
			console.error('Error deleting article:', e)
		} finally {
			setDeleting(false)
			setShowDeleteDialog(false)
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="h-8 w-8 p-0" variant="ghost">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => {
								router.push(`/admin/article/edit/${row.original.id}`)
							}}
						>
							<Edit className="mr-2 h-4 w-4" />
							{t.articles.table.actions.edit}
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-not-allowed opacity-50" disabled>
							<Eye className="mr-2 h-4 w-4" />
							{t.articles.table.actions.view}
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						{t.articles.table.actions.delete}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
				<AlertDialogContent>
					<div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
						<div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border">
							<CircleAlert className="opacity-80" size={16} />
						</div>
						<AlertDialogHeader>
							<AlertDialogTitle>{t.articles.table.controls.confirmDelete}</AlertDialogTitle>
							<AlertDialogDescription>
								{t.articles.table.controls.deleteDescription} &quot;{row.original.title || 'Unknown Article'}&quot;.
							</AlertDialogDescription>
						</AlertDialogHeader>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>{t.articles.table.controls.cancel}</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleting}
							onClick={() => void handleDelete()}
						>
							{deleting ? t.articles.ui.refreshing : t.articles.table.actions.delete}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
