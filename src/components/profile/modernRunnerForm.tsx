'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Contact, Phone, Shield, MapPin, FileText, Trophy, Calendar, Globe } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { User } from '@/models/user.model'
import { updateUser } from '@/services/user.services'

interface RunnerFormData {
	firstName: string
	lastName: string
	birthDate: string
	phoneNumber: string
	emergencyContactName: string
	emergencyContactPhone: string
	emergencyContactRelationship: string
	address: string
	postalCode: string
	city: string
	country: string
	gender: string
	medicalCertificateUrl: string
	clubAffiliation: string
	licenseNumber: string
}

export default function ModernRunnerForm({ user }: Readonly<{ user: User }>) {
	const [activeSection, setActiveSection] = useState<string | null>(null)

	const form = useForm<RunnerFormData>({
		defaultValues: {
			firstName: user?.firstName ?? '',
			lastName: user?.lastName ?? '',
			birthDate: user?.birthDate ?? '',
			phoneNumber: user?.phoneNumber ?? '',
			emergencyContactName: user?.emergencyContactName ?? '',
			emergencyContactPhone: user?.emergencyContactPhone ?? '',
			emergencyContactRelationship: user?.emergencyContactRelationship ?? '',
			address: user?.address ?? '',
			postalCode: user?.postalCode ?? '',
			city: user?.city ?? '',
			country: user?.country ?? '',
			gender: user?.gender ?? '',
			medicalCertificateUrl: user?.medicalCertificateUrl ?? '',
			clubAffiliation: user?.clubAffiliation ?? '',
			licenseNumber: user?.licenseNumber ?? '',
		},
	})

	async function onSubmit(values: RunnerFormData) {
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

	const sections = [
		{
			id: 'personal',
			title: 'Informations Personnelles',
			icon: Contact,
			fields: ['firstName', 'lastName', 'birthDate', 'phoneNumber', 'gender'],
		},
		{
			id: 'emergency',
			title: "Contact d'Urgence",
			icon: Shield,
			fields: ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'],
		},
		{ id: 'address', title: 'Adresse', icon: MapPin, fields: ['address', 'postalCode', 'city', 'country'] },
		{
			id: 'documents',
			title: 'Documents & Affiliations',
			icon: FileText,
			fields: ['medicalCertificateUrl', 'clubAffiliation', 'licenseNumber'],
		},
	]

	return (
		<div className="bg-card/80 min-h-screen rounded-xl p-4">
			<div className="mx-auto max-w-4xl space-y-8">
				{/* Header */}
				<div className="space-y-4 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-blue-800 bg-blue-900/20 px-4 py-2">
						<Trophy className="h-4 w-4 text-blue-400" />
						<span className="text-sm font-medium text-blue-300">Profil Coureur</span>
					</div>
					<h1 className="text-3xl font-bold text-white">Informations Coureur</h1>
					<p className="mx-auto max-w-2xl text-gray-400">
						Complétez votre profil de coureur pour acheter des dossards sur la marketplace.
					</p>
				</div>

				{/* Progress Overview */}
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{sections.map(section => {
						const Icon = section.icon
						const hasErrors = section.fields.some(field => form.formState.errors[field as keyof RunnerFormData])
						const isComplete = section.fields.every(field => {
							const value = form.watch(field as keyof RunnerFormData)
							return value && value.toString().trim() !== ''
						})

						return (
							<Card
								key={section.id}
								className={`cursor-pointer border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-200 hover:bg-gray-900/80 ${
									activeSection === section.id ? 'border-blue-500 ring-2 ring-blue-500' : ''
								}`}
								onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div
											className={`rounded-lg p-2 ${
												hasErrors
													? 'bg-red-900/20 text-red-400'
													: isComplete
														? 'bg-green-900/20 text-green-400'
														: 'bg-blue-900/20 text-blue-400'
											}`}
										>
											<Icon className="h-4 w-4" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-white">{section.title}</p>
											<div className="mt-1 flex items-center gap-2">
												{isComplete && (
													<Badge
														variant="secondary"
														className="border-green-800 bg-green-900/20 text-xs text-green-400"
													>
														Complet
													</Badge>
												)}
												{hasErrors && (
													<Badge variant="destructive" className="border-red-800 bg-red-900/20 text-xs text-red-400">
														Erreurs
													</Badge>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>

				{/* Main Form */}
				<Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
					<CardContent className="p-8">
						<Form {...form}>
							<form onSubmit={handleSubmit} className="space-y-12">
								{/* Personal Information Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-blue-900/20 p-2">
											<Contact className="h-5 w-5 text-blue-400" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">Informations Personnelles</h3>
											<p className="text-sm text-gray-400">Vos informations de base</p>
										</div>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormField
											control={form.control}
											name="firstName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Prénom</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="Votre prénom"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="lastName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Nom</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="Votre nom"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={form.control}
											name="birthDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2 text-gray-300">
														<Calendar className="h-4 w-4" />
														Date de naissance
													</FormLabel>
													<FormControl>
														<Input
															type="date"
															{...field}
															className="border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="phoneNumber"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2 text-gray-300">
														<Phone className="h-4 w-4" />
														Numéro de téléphone
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="+33 6 12 34 56 78"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="gender"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Genre</FormLabel>
													<Select defaultValue={field.value} onValueChange={field.onChange}>
														<FormControl>
															<SelectTrigger className="border-gray-700 bg-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20">
																<SelectValue placeholder="Sélectionner le genre" />
															</SelectTrigger>
														</FormControl>
														<SelectContent className="border-gray-700 bg-gray-800">
															<SelectItem value="male" className="text-white hover:bg-gray-700">
																Homme
															</SelectItem>
															<SelectItem value="female" className="text-white hover:bg-gray-700">
																Femme
															</SelectItem>
															<SelectItem value="other" className="text-white hover:bg-gray-700">
																Autre
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<Separator className="bg-gray-800" />

								{/* Emergency Contact Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-red-900/20 p-2">
											<Shield className="h-5 w-5 text-red-400" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">Contact d'Urgence</h3>
											<p className="text-sm text-gray-400">Personne à contacter en cas d'urgence</p>
										</div>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormField
											control={form.control}
											name="emergencyContactName"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Nom du contact d'urgence</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="Nom complet"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="emergencyContactPhone"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Téléphone du contact d'urgence</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="+33 6 12 34 56 78"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="emergencyContactRelationship"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Relation du contact d'urgence</FormLabel>
												<FormControl>
													<Input
														{...field}
														className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
														placeholder="Ex: Conjoint(e), Parent, Ami(e)..."
													/>
												</FormControl>
												<FormMessage className="text-red-400" />
											</FormItem>
										)}
									/>
								</div>

								<Separator className="bg-gray-800" />

								{/* Address Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-green-900/20 p-2">
											<MapPin className="h-5 w-5 text-green-400" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">Adresse</h3>
											<p className="text-sm text-gray-400">Votre adresse de résidence</p>
										</div>
									</div>

									<FormField
										control={form.control}
										name="address"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Adresse</FormLabel>
												<FormControl>
													<Input
														{...field}
														className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
														placeholder="123 Rue de la Course"
													/>
												</FormControl>
												<FormMessage className="text-red-400" />
											</FormItem>
										)}
									/>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={form.control}
											name="postalCode"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Code Postal</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="75001"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="city"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Ville</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="Paris"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="country"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="flex items-center gap-2 text-gray-300">
														<Globe className="h-4 w-4" />
														Pays
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="France"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<Separator className="bg-gray-800" />

								{/* Documents & Affiliations Section */}
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="rounded-lg bg-purple-900/20 p-2">
											<FileText className="h-5 w-5 text-purple-400" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-white">Documents & Affiliations</h3>
											<p className="text-sm text-gray-400">Certificats médicaux et affiliations sportives</p>
										</div>
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormField
											control={form.control}
											name="medicalCertificateUrl"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">URL du certificat médical</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="https://..."
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="clubAffiliation"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-gray-300">Affiliation au club</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
															placeholder="Nom du club (optionnel)"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="licenseNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-gray-300">Numéro de licence</FormLabel>
												<FormControl>
													<Input
														{...field}
														className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
														placeholder="Numéro de licence FFA (optionnel)"
													/>
												</FormControl>
												<FormMessage className="text-red-400" />
											</FormItem>
										)}
									/>
								</div>

								{/* Submit Button */}
								<div className="flex justify-end pt-6">
									<Button
										type="submit"
										size="lg"
										className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
									>
										Enregistrer les modifications
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
