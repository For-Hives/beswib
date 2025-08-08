'use client'

import {
	ColumnDef,
	ColumnFiltersState,
	FilterFn,
	flexRender,
	getCoreRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	Row,
	SortingState,
	useReactTable,
	VisibilityState,
} from '@tanstack/react-table'
import {
	Building,
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
	Mail,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
	Users,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
import { SelectAnimated, type SelectOption } from '@/components/ui/select-animated'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { getAllOrganizersAction } from '@/app/[locale]/admin/actions'
import { Organizer } from '@/models/organizer.model'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/models/user.model'
import { cn } from '@/lib/utils'

interface AdminOrganizersPageClientProps {
	currentUser: null | User
	locale: Locale
}

interface OrganizersStats {
	partneredOrganizers: number
	totalOrganizers: number
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Organizer & { eventsCount: number }> = (row, _columnId, filterValue) => {
	const searchableRowContent = `${row.original.name ?? ''} ${row.original.email ?? ''}`.toLowerCase()
	const searchTerm = String(filterValue ?? '').toLowerCase()
	return searchableRowContent.includes(searchTerm)
}
import organizerTranslations from '@/app/[locale]/admin/organizer/locales.json'
import { getTranslations } from '@/lib/getDictionary'
import { Locale } from '@/lib/i18n-config'

export default function AdminOrganizersPageClient({ locale, currentUser }: Readonly<AdminOrganizersPageClientProps>) {
	const t = getTranslations(locale, organizerTranslations)

	const router = useRouter()
	const id = useId()
	const inputRef = useRef<HTMLInputElement>(null)

	const [organizers, setOrganizers] = useState<(Organizer & { eventsCount: number })[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [stats, setStats] = useState<null | OrganizersStats>(null)

	// Table state
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [pagination, setPagination] = useState<PaginationState>({
		pageSize: 10,
		pageIndex: 0,
	})
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'name',
			desc: false,
		},
	])

	// Define columns
	const columns: ColumnDef<Organizer & { eventsCount: number }>[] = [
		{
			size: 28,
			id: 'select',
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						aria-label={t.organizers.table.controls.selectAll}
						checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
						onCheckedChange={value => table.toggleAllPageRowsSelected(value === true)}
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						aria-label={t.organizers.table.controls.selectRow}
						checked={row.getIsSelected()}
						onCheckedChange={value => row.toggleSelected(value === true)}
					/>
				</div>
			),
		},
		{
			size: 200,
			header: t.organizers.table.columns.name,
			filterFn: multiColumnFilterFn,
			enableHiding: false,
			cell: ({ row }) => <div className="font-medium">{row.getValue('name') ?? 'N/A'}</div>,
			accessorKey: 'name',
		},
		{
			size: 180,
			header: t.organizers.table.columns.email,
			cell: ({ row }) => {
				const email = row.getValue('email')
				return (
					<div className="flex items-center gap-2">
						<Mail className="text-muted-foreground h-4 w-4" />
						<span className="text-sm">{String(email) || 'N/A'}</span>
					</div>
				)
			},
			accessorKey: 'email',
		},
		{
			size: 100,
			header: t.organizers.table.columns.eventsCount,
			cell: ({ row }) => {
				const eventsCount = row.getValue('eventsCount')
				return (
					<div className="flex items-center justify-center">
						<Badge variant="outline">{typeof eventsCount === 'number' ? eventsCount : 0}</Badge>
					</div>
				)
			},
			accessorKey: 'eventsCount',
		},
		{
			size: 120,
			header: t.organizers.table.columns.partnership,
			cell: ({ row }: { row: Row<Organizer> }) => (
				<Badge variant={row.getValue('isPartnered') === true ? 'default' : 'secondary'}>
					{row.getValue('isPartnered') === true
						? t.organizers.table.columns.status.partner
						: t.organizers.table.columns.status.standard}
				</Badge>
			),
			accessorKey: 'isPartnered',
		},
		{
			size: 120,
			header: t.organizers.table.columns.created,
			cell: ({ row }) => {
				const date = row.getValue('created')
				return (
					<div>
						{date !== null && date !== undefined && date !== '' ? new Date(date as string).toLocaleDateString() : 'N/A'}
					</div>
				)
			},
			accessorKey: 'created',
		},
		{
			size: 60,
			id: 'actions',
			header: () => <span className="sr-only">Actions</span>,
			enableSorting: false,
			enableHiding: false,
			cell: ({ row }) => <RowActions row={row} />,
		},
	]

	useEffect(() => {
		const fetchOrganizers = async () => {
			try {
				setIsLoading(true)
				const result = await getAllOrganizersAction()

				if (result.success && result.data) {
					const organizersData = result.data
					setOrganizers(organizersData)

					// Calculate stats
					const statsData: OrganizersStats = {
						totalOrganizers: organizersData.length,
						partneredOrganizers: organizersData.filter((organizer: Organizer) => organizer.isPartnered).length,
					}
					setStats(statsData)
				} else {
					console.error('Error fetching organizers:', result.error)
					setOrganizers([])
					setStats({
						totalOrganizers: 0,
						partneredOrganizers: 0,
					})
				}
			} catch (error) {
				console.error('Error fetching organizers:', error)
				setOrganizers([])
				setStats({
					totalOrganizers: 0,
					partneredOrganizers: 0,
				})
			} finally {
				setIsLoading(false)
			}
		}

		void fetchOrganizers()
	}, [])

	const handleDeleteRows = () => {
		const selectedRows = table.getSelectedRowModel().rows
		const updatedData = organizers.filter(item => !selectedRows.some(row => row.original.id === item.id))
		setOrganizers(updatedData)
		table.resetRowSelection()
	}

	const table = useReactTable({
		state: {
			sorting,
			pagination,
			columnVisibility,
			columnFilters,
		},
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: setColumnFilters,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getCoreRowModel: getCoreRowModel(),
		enableSortingRemoval: false,
		data: organizers,
		columns,
	})

	// Safety check - if currentUser is null, show error
	if (currentUser === null || currentUser === undefined) {
		return (
			<div className="from-background via-destructive/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative flex min-h-screen items-center justify-center">
					<div className="border-border/50 bg-card/80 w-full max-w-md rounded-3xl border p-8 text-center shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--destructive)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--destructive)/0.2)] backdrop-blur-md">
						<div className="mb-6 text-6xl text-red-600 dark:text-red-400">⚠</div>
						<h1 className="text-foreground mb-4 text-3xl font-bold">{t.organizers.ui.accessError}</h1>
						<p className="text-muted-foreground mb-6 text-lg">{t.organizers.ui.accessErrorDescription}</p>
						<button
							className="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white"
							onClick={() => router.push('/sign-in')}
						>
							{t.organizers.ui.signIn}
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
				<div className="relative pt-32 pb-12">
					<div className="container mx-auto max-w-7xl p-6">
						<div className="space-y-8">
							<div className="space-y-2 text-center">
								<div className="mx-auto h-12 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
								<div className="mx-auto h-6 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
								{Array.from({ length: 2 }).map((_, i) => (
									<div
										className="h-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
										key={`skeleton-${i}`}
									></div>
								))}
							</div>
							<div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

			{/* Admin header with user info */}
			<div className="bg-card/25 border-border/30 absolute top-0 right-0 left-0 z-20 mx-4 mt-12 mb-6 rounded-2xl border p-4 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-muted-foreground text-sm">{t.organizers.ui.connectedAs}</p>
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
							<h1 className="text-foreground text-4xl font-bold">{t.organizers.title}</h1>
							<p className="text-muted-foreground text-lg">{t.organizers.subtitle}</p>
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.organizers.stats.totalOrganizers}</CardTitle>
									<Building className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.totalOrganizers ?? 0}</div>
								</CardContent>
							</Card>

							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">{t.organizers.stats.partneredOrganizers}</CardTitle>
									<Users className="text-muted-foreground h-4 w-4" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{stats?.partneredOrganizers ?? 0}</div>
								</CardContent>
							</Card>
						</div>

						{/* Quick Actions Section */}
						<div className="mb-8">
							<div className="mb-6">
								<h2 className="text-foreground mb-2 text-2xl font-bold">{t.organizers.sections.actions.title}</h2>
								<p className="text-muted-foreground">{t.organizers.sections.actions.description}</p>
							</div>

							<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
								{/* Create Organizer Card */}
								<Link href="/admin/organizer/create">
									<Card className="border-border/50 bg-card/80 hover:bg-card/90 group cursor-pointer backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.15),inset_0_0_60px_hsl(var(--accent)/0.1),0_0_50px_hsl(var(--primary)/0.25)]">
										<CardHeader>
											<div className="flex items-center gap-3">
												<div className="bg-primary/10 text-primary rounded-lg p-2">
													<Plus className="h-5 w-5" />
												</div>
												<div>
													<CardTitle className="text-foreground group-hover:text-primary transition-colors">
														{t.organizers.actions.createOrganizer}
													</CardTitle>
													<CardDescription className="text-muted-foreground">
														{t.organizers.actions.createOrganizerDescription}
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
									{/* Filter by name or email */}
									<div className="relative">
										<Input
											aria-label={t.organizers.table.search}
											className={cn(
												'peer min-w-60 ps-9',
												table.getColumn('name')?.getFilterValue() !== undefined &&
													table.getColumn('name')?.getFilterValue() !== '' &&
													'pe-9'
											)}
											id={`${id}-input`}
											onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
											placeholder={t.organizers.table.search}
											ref={inputRef}
											type="text"
											value={(table.getColumn('name')?.getFilterValue() ?? '') as string}
										/>
										<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
											<Search aria-hidden="true" size={16} />
										</div>
										{table.getColumn('name')?.getFilterValue() !== undefined &&
											table.getColumn('name')?.getFilterValue() !== '' && (
												<button
													aria-label={t.organizers.table.controls.clearFilter}
													className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
													onClick={() => {
														table.getColumn('name')?.setFilterValue('')
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
												{t.organizers.table.controls.toggleColumns}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>{t.organizers.table.controls.toggleColumns}</DropdownMenuLabel>
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
													{t.organizers.table.controls.deleteSelected}
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
														<AlertDialogTitle>{t.organizers.table.controls.confirmDelete}</AlertDialogTitle>
														<AlertDialogDescription>
															{t.organizers.table.controls.deleteDescription} {table.getSelectedRowModel().rows.length}{' '}
															selected {table.getSelectedRowModel().rows.length === 1 ? 'organizer' : 'organizers'}.
														</AlertDialogDescription>
													</AlertDialogHeader>
												</div>
												<AlertDialogFooter>
													<AlertDialogCancel>{t.organizers.table.controls.cancel}</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={handleDeleteRows}
													>
														{t.organizers.table.controls.deleteSelected}
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							</div>

							{/* Table */}
							<div className="bg-card/80 border-border/50 overflow-hidden rounded-2xl border shadow-[0_0_0_1px_hsl(var(--border)),inset_0_0_30px_hsl(var(--primary)/0.1),inset_0_0_60px_hsl(var(--accent)/0.05),0_0_50px_hsl(var(--primary)/0.2)] backdrop-blur-md">
								<Table className="table-fixed">
									<TableHeader>
										{table.getHeaderGroups().map(headerGroup => (
											<TableRow className="hover:bg-transparent" key={headerGroup.id}>
												{headerGroup.headers.map(header => {
													return (
														<TableHead className="h-11" key={header.id} style={{ width: `${header.getSize()}px` }}>
															{header.isPlaceholder ? null : header.column.getCanSort() ? (
																<div
																	className={cn(
																		header.column.getCanSort() &&
																			'flex h-full cursor-pointer items-center justify-between gap-2 select-none'
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
																		desc: <ChevronDown aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
																		asc: <ChevronUp aria-hidden="true" className="shrink-0 opacity-60" size={16} />,
																	}[header.column.getIsSorted() as string] ?? null}
																</div>
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
														<h3 className="text-foreground text-lg font-semibold">{t.organizers.table.empty.title}</h3>
														<p className="text-muted-foreground mb-4">{t.organizers.table.empty.description}</p>
														<Link href="/admin/organizer/create">
															<Button>{t.organizers.table.empty.createButton}</Button>
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
										{t.organizers.table.controls.rowsPerPage}
									</Label>
                                {(() => {
                                    const pageSizeOptions: SelectOption[] = [5, 10, 25, 50].map(n => ({
                                        value: n.toString(),
                                        label: n.toString(),
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

function RowActions({ row }: { row: Row<Organizer> }) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const handleDelete = () => {
		// TODO: Implement delete functionality
		console.warn('Delete organizer:', row.original.id)
		setShowDeleteDialog(false)
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
						<DropdownMenuItem className="cursor-not-allowed opacity-50" disabled>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem className="cursor-not-allowed opacity-50" disabled>
							<Eye className="mr-2 h-4 w-4" />
							View
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => setShowDeleteDialog(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete
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
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the organizer "
								{row.original.name || 'Unknown Organizer'}".
							</AlertDialogDescription>
						</AlertDialogHeader>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleDelete}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
