'use client'

import { useForm } from 'react-hook-form'

import { type InferOutput, isoDate, literal, minLength, object, optional, pipe, string, union } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'

import type { User } from '@/models/user.model'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import profileTranslations from '@/app/[locale]/profile/locales.json'
import PayPalOnboarding from '@/components/profile/PayPalOnboarding'
import UserHeader from '@/components/dashboard/user-header'
import { getTranslations } from '@/lib/getDictionary'
import { updateUser } from '@/services/user.services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Locale } from '@/lib/i18n-config'
import ModernRunnerForm from '@/components/profile/modernRunnerForm'

interface ProfileClientProps {
	clerkUser: SerializedClerkUser
	locale: Locale
	user: null | User
}

interface SerializedClerkUser {
	emailAddresses: { emailAddress: string; id: string }[]
	firstName: null | string
	id: string
	imageUrl: string
	lastName: null | string
	username: null | string
}

const runnerSchema = object({
	tshirtSize: optional(union([literal('XS'), literal('S'), literal('M'), literal('L'), literal('XL'), literal('XXL')])),
	postalCode: pipe(string(), minLength(1, 'Postal code must not be empty')),
	phoneNumber: pipe(string(), minLength(1, 'Phone number must not be empty')),
	medicalCertificateUrl: optional(string()),
	licenseNumber: optional(string()),
	lastName: pipe(string(), minLength(1, 'Last name must not be empty')),
	gender: optional(union([literal('male'), literal('female'), literal('other')])),
	firstName: pipe(string(), minLength(1, 'First name must not be empty')),
	emergencyContactRelationship: optional(string()),
	emergencyContactPhone: pipe(string(), minLength(1, 'Emergency contact phone must not be empty')),
	emergencyContactName: pipe(string(), minLength(1, 'Emergency contact name must not be empty')),
	country: pipe(string(), minLength(1, 'Country must not be empty')),
	clubAffiliation: optional(string()),
	city: pipe(string(), minLength(1, 'City must not be empty')),
	birthDate: pipe(string(), isoDate('Birth date must be a valid ISO date.')),
	address: pipe(string(), minLength(1, 'Address must not be empty')),
})

type RunnerForm = InferOutput<typeof runnerSchema>

export default function ProfileClient({ user, locale, clerkUser }: ProfileClientProps) {
	const t = getTranslations(locale, profileTranslations)

	const form = useForm<RunnerForm>({
		resolver: valibotResolver(runnerSchema),
		defaultValues: {
			tshirtSize: user?.tshirtSize ?? undefined,
			postalCode: user?.postalCode ?? '',
			phoneNumber: user?.phoneNumber ?? '',
			medicalCertificateUrl: user?.medicalCertificateUrl ?? undefined,
			licenseNumber: user?.licenseNumber ?? undefined,
			lastName: user?.lastName ?? '',
			gender: user?.gender ?? undefined,
			firstName: user?.firstName ?? '',
			emergencyContactRelationship: user?.emergencyContactRelationship ?? undefined,
			emergencyContactPhone: user?.emergencyContactPhone ?? '',
			emergencyContactName: user?.emergencyContactName ?? '',
			country: user?.country ?? '',
			clubAffiliation: user?.clubAffiliation ?? undefined,
			city: user?.city ?? '',
			birthDate: user?.birthDate ?? '',
			address: user?.address ?? '',
		},
	})

	async function onSubmit(values: RunnerForm) {
		if (!user) return
		try {
			await updateUser(user.id, values as Partial<User>)
		} catch (error) {
			console.error(error)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		form.handleSubmit(onSubmit)(e).catch(console.error)
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
							<ModernRunnerForm />
						</div>
						<div>
							<Card className="border-border/50 bg-card/80 backdrop-blur-sm">
								<CardHeader>
									<CardTitle>{t.profile.sellerInfo.title}</CardTitle>
									<CardDescription>{t.profile.sellerInfo.description}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{user ? (
										<PayPalOnboarding locale={locale} userId={user.id} />
									) : (
										<p className="text-muted-foreground text-sm">Please complete your profile first.</p>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
