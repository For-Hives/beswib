'use client'

import type { User as ClerkUser } from '@clerk/nextjs/server'

import { useForm } from 'react-hook-form'

import { isoDate, minLength, object, type Output, string } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { User } from '@/models/user.model'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UserHeader from '@/components/dashboard/user-header'
import { getTranslations } from '@/lib/getDictionary'
import { updateUser } from '@/services/user.services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Locale } from '@/lib/i18n-config'

import profileTranslations from './locales.json'

interface ProfileClientProps {
	clerkUser: ClerkUser | null
	locale: Locale
	user: null | User
}

const runnerSchema = object({
	postalCode: string([minLength(1, 'Postal code is required')]),
	phoneNumber: string([minLength(1, 'Phone number is required')]),
	lastName: string([minLength(1, 'Last name is required')]),
	firstName: string([minLength(1, 'First name is required')]),
	emergencyContactPhone: string([minLength(1, 'Emergency contact phone is required')]),
	emergencyContactName: string([minLength(1, 'Emergency contact name is required')]),
	country: string([minLength(1, 'Country is required')]),
	city: string([minLength(1, 'City is required')]),
	birthDate: string([isoDate('Birth date must be a valid ISO date.')]),
	address: string([minLength(1, 'Address is required')]),
})

type RunnerForm = Output<typeof runnerSchema>

export default function ProfileClient({ user, locale, clerkUser }: ProfileClientProps) {
	const t = getTranslations(locale, profileTranslations)

	const form = useForm<RunnerForm>({
		resolver: valibotResolver(runnerSchema),
		defaultValues: {
			postalCode: user?.postalCode ?? '',
			phoneNumber: user?.phoneNumber ?? '',
			lastName: user?.lastName ?? '',
			firstName: user?.firstName ?? '',
			emergencyContactPhone: user?.emergencyContactPhone ?? '',
			emergencyContactName: user?.emergencyContactName ?? '',
			country: user?.country ?? '',
			city: user?.city ?? '',
			birthDate: user?.birthDate ?? '',
			address: user?.address ?? '',
		},
	})

	async function onSubmit(values: RunnerForm) {
		if (!user) return
		try {
			await updateUser(user.id, values)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div className="from-background via-primary/5 to-background relative min-h-screen bg-gradient-to-br">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
			<UserHeader clerkUser={clerkUser} user={user} />

			<div className="relative pt-32 pb-12">
				<div className="container mx-auto max-w-6xl p-6">
					<div className="mb-12 space-y-2 text-center">
						<h1 className="text-foreground text-4xl font-bold tracking-tight">{t.profile.title}</h1>
						<p className="text-muted-foreground text-lg">{t.profile.description}</p>
					</div>

					<div className="grid gap-8 lg:grid-cols-3">
						<div className="lg:col-span-2">
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>{t.profile.runnerInfo.title}</CardTitle>
									<CardDescription>{t.profile.runnerInfo.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...form}>
										<form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
												<FormField
													control={form.control}
													name="firstName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.firstName}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="lastName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.lastName}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="birthDate"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.profile.runnerInfo.birthDate}</FormLabel>
														<FormControl>
															<Input type="date" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="phoneNumber"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.profile.runnerInfo.phoneNumber}</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
												<FormField
													control={form.control}
													name="emergencyContactName"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.emergencyContactName}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="emergencyContactPhone"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.emergencyContactPhone}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<FormField
												control={form.control}
												name="address"
												render={({ field }) => (
													<FormItem>
														<FormLabel>{t.profile.runnerInfo.address}</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
												<FormField
													control={form.control}
													name="postalCode"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.postalCode}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="city"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.city}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="country"
													render={({ field }) => (
														<FormItem>
															<FormLabel>{t.profile.runnerInfo.country}</FormLabel>
															<FormControl>
																<Input {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>

											<Button type="submit">{t.profile.runnerInfo.save}</Button>
										</form>
									</Form>
								</CardContent>
							</Card>
						</div>
						<div>
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>{t.profile.sellerInfo.title}</CardTitle>
									<CardDescription>{t.profile.sellerInfo.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button className="w-full">{t.profile.sellerInfo.connectStripe}</Button>
									<p className="text-muted-foreground text-sm">
										{t.profile.sellerInfo.stripeConnectionStatus}{' '}
										<span className={user?.stripeAccountVerified ? 'text-green-500' : 'text-red-500'}>
											{user?.stripeAccountVerified
												? t.profile.sellerInfo.stripeVerified
												: t.profile.sellerInfo.stripeNotVerified}
										</span>
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
