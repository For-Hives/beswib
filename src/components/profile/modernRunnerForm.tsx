'use client'

import React from 'react'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
	User,
	Phone,
	Calendar,
	MapPin,
	Shield,
	Shirt,
	Trophy,
	Sparkles,
	Zap,
	Rocket,
	ChevronRight,
	ChevronLeft,
	Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const formSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	birthDate: z.string().min(1, 'Birth date is required'),
	phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
	emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
	emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
	emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
	address: z.string().min(5, 'Address is required'),
	postalCode: z.string().min(3, 'Postal code is required'),
	city: z.string().min(2, 'City is required'),
	country: z.string().min(2, 'Country is required'),
	gender: z.string().min(1, 'Gender selection is required'),
	medicalCertificateUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
	tshirtSize: z.string().min(1, 'T-shirt size is required'),
	clubAffiliation: z.string().optional(),
	licenseNumber: z.string().optional(),
})

const steps = [
	{
		id: 'personal',
		title: 'Personal Info',
		icon: User,
		description: 'Tell us about yourself',
		color: 'from-purple-500 to-pink-500',
	},
	{
		id: 'contact',
		title: 'Contact & Emergency',
		icon: Phone,
		description: 'Stay connected & safe',
		color: 'from-blue-500 to-cyan-500',
	},
	{
		id: 'location',
		title: 'Location',
		icon: MapPin,
		description: 'Where are you from?',
		color: 'from-green-500 to-emerald-500',
	},
	{
		id: 'preferences',
		title: 'Preferences',
		icon: Shirt,
		description: 'Final touches',
		color: 'from-orange-500 to-red-500',
	},
]

export default function ModernRunnerForm() {
	const [currentStep, setCurrentStep] = useState(0)
	const [completedSteps, setCompletedSteps] = useState<number[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			birthDate: '',
			phoneNumber: '',
			emergencyContactName: '',
			emergencyContactPhone: '',
			emergencyContactRelationship: '',
			address: '',
			postalCode: '',
			city: '',
			country: '',
			gender: '',
			medicalCertificateUrl: '',
			tshirtSize: '',
			clubAffiliation: '',
			licenseNumber: '',
		},
	})

	const nextStep = async () => {
		const fieldsToValidate = getFieldsForStep(currentStep)
		const isValid = await form.trigger(fieldsToValidate)

		if (isValid) {
			if (!completedSteps.includes(currentStep)) {
				setCompletedSteps([...completedSteps, currentStep])
			}
			if (currentStep < steps.length - 1) {
				setCurrentStep(currentStep + 1)
			}
		}
	}

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const getFieldsForStep = (step: number) => {
		switch (step) {
			case 0:
				return ['firstName', 'lastName', 'birthDate', 'gender'] as const
			case 1:
				return ['phoneNumber', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'] as const
			case 2:
				return ['address', 'postalCode', 'city', 'country'] as const
			case 3:
				return ['tshirtSize'] as const
			default:
				return []
		}
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setIsSubmitting(true)
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000))
		console.log(values)
		setIsSubmitting(false)
		// Add success animation or redirect
	}

	const progress = ((currentStep + 1) / steps.length) * 100

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
			<div className="mx-auto max-w-4xl">
				{/* Header with animated progress */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
					<div className="mb-4 flex items-center justify-center gap-2">
						<Rocket className="h-8 w-8 text-purple-400" />
						<h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
							Runner Registration
						</h1>
						<Sparkles className="h-8 w-8 text-pink-400" />
					</div>
					<p className="text-lg text-slate-400">Let's get you ready to run! ⚡</p>
				</motion.div>

				{/* Progress Bar */}
				<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
					<div className="mb-4 flex justify-between">
						{steps.map((step, index) => {
							const Icon = step.icon
							const isCompleted = completedSteps.includes(index)
							const isCurrent = currentStep === index

							return (
								<motion.div
									key={step.id}
									className="flex flex-col items-center"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<div
										className={`relative mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
											isCurrent
												? `bg-gradient-to-r ${step.color} border-transparent shadow-lg shadow-purple-500/25`
												: isCompleted
													? 'border-green-500 bg-green-500'
													: 'border-slate-600 bg-slate-800'
										} `}
									>
										{isCompleted ? (
											<Check className="h-6 w-6 text-white" />
										) : (
											<Icon className={`h-6 w-6 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
										)}
										{isCurrent && (
											<motion.div
												className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-75"
												animate={{ scale: [1, 1.2, 1] }}
												transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
											/>
										)}
									</div>
									<span className={`text-sm font-medium ${isCurrent ? 'text-purple-400' : 'text-slate-500'}`}>
										{step.title}
									</span>
								</motion.div>
							)
						})}
					</div>
					<Progress value={progress} className="h-2 bg-slate-800" />
				</motion.div>

				{/* Form Card */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
					<Card className="border-slate-700 bg-slate-800/50 shadow-2xl backdrop-blur-xl">
						<CardHeader className="text-center">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								className="flex items-center justify-center gap-3"
							>
								<div className={`rounded-full bg-gradient-to-r ${steps[currentStep].color} p-2`}>
									{React.createElement(steps[currentStep].icon, { className: 'h-6 w-6 text-white' })}
								</div>
								<div>
									<CardTitle className="text-2xl text-white">{steps[currentStep].title}</CardTitle>
									<CardDescription className="text-slate-400">{steps[currentStep].description}</CardDescription>
								</div>
							</motion.div>
						</CardHeader>

						<CardContent>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
									<AnimatePresence mode="wait">
										<motion.div
											key={currentStep}
											initial={{ opacity: 0, x: 50 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -50 }}
											transition={{ duration: 0.3 }}
										>
											{currentStep === 0 && (
												<div className="space-y-6">
													<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="firstName"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-slate-300">First Name</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
																			placeholder="Enter your first name"
																		/>
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
																	<FormLabel className="text-slate-300">Last Name</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
																			placeholder="Enter your last name"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="birthDate"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-2 text-slate-300">
																		<Calendar className="h-4 w-4" />
																		Birth Date
																	</FormLabel>
																	<FormControl>
																		<Input
																			type="date"
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white focus:border-purple-500 focus:ring-purple-500/20"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="gender"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-slate-300">Gender</FormLabel>
																	<Select onValueChange={field.onChange} defaultValue={field.value}>
																		<FormControl>
																			<SelectTrigger className="border-slate-600 bg-slate-900/50 text-white focus:border-purple-500 focus:ring-purple-500/20">
																				<SelectValue placeholder="Select gender" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent className="border-slate-600 bg-slate-800">
																			<SelectItem value="male" className="text-white hover:bg-slate-700">
																				Male
																			</SelectItem>
																			<SelectItem value="female" className="text-white hover:bg-slate-700">
																				Female
																			</SelectItem>
																			<SelectItem value="other" className="text-white hover:bg-slate-700">
																				Other
																			</SelectItem>
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											)}

											{currentStep === 1 && (
												<div className="space-y-6">
													<FormField
														control={form.control}
														name="phoneNumber"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2 text-slate-300">
																	<Phone className="h-4 w-4" />
																	Phone Number
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
																		placeholder="Your phone number"
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>

													<div className="rounded-lg border border-slate-600 bg-slate-900/30 p-4">
														<div className="mb-4 flex items-center gap-2">
															<Shield className="h-5 w-5 text-red-400" />
															<h3 className="font-semibold text-red-400">Emergency Contact</h3>
															<Badge variant="destructive" className="ml-auto">
																Important
															</Badge>
														</div>

														<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
															<FormField
																control={form.control}
																name="emergencyContactName"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-slate-300">Contact Name</FormLabel>
																		<FormControl>
																			<Input
																				{...field}
																				className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
																				placeholder="Emergency contact name"
																			/>
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
																		<FormLabel className="text-slate-300">Contact Phone</FormLabel>
																		<FormControl>
																			<Input
																				{...field}
																				className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
																				placeholder="Emergency contact phone"
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
														</div>

														<FormField
															control={form.control}
															name="emergencyContactRelationship"
															render={({ field }) => (
																<FormItem className="mt-4">
																	<FormLabel className="text-slate-300">Relationship</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-red-500 focus:ring-red-500/20"
																			placeholder="e.g., Parent, Spouse, Friend"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											)}

											{currentStep === 2 && (
												<div className="space-y-6">
													<FormField
														control={form.control}
														name="address"
														render={({ field }) => (
															<FormItem>
																<FormLabel className="flex items-center gap-2 text-slate-300">
																	<MapPin className="h-4 w-4" />
																	Address
																</FormLabel>
																<FormControl>
																	<Input
																		{...field}
																		className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20"
																		placeholder="Your full address"
																	/>
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
																	<FormLabel className="text-slate-300">Postal Code</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20"
																			placeholder="12345"
																		/>
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
																	<FormLabel className="text-slate-300">City</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20"
																			placeholder="Your city"
																		/>
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
																	<FormLabel className="text-slate-300">Country</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20"
																			placeholder="Your country"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											)}

											{currentStep === 3 && (
												<div className="space-y-6">
													<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="tshirtSize"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-2 text-slate-300">
																		<Shirt className="h-4 w-4" />
																		T-Shirt Size
																	</FormLabel>
																	<Select onValueChange={field.onChange} defaultValue={field.value}>
																		<FormControl>
																			<SelectTrigger className="border-slate-600 bg-slate-900/50 text-white focus:border-orange-500 focus:ring-orange-500/20">
																				<SelectValue placeholder="Select size" />
																			</SelectTrigger>
																		</FormControl>
																		<SelectContent className="border-slate-600 bg-slate-800">
																			{['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
																				<SelectItem key={size} value={size} className="text-white hover:bg-slate-700">
																					{size}
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="medicalCertificateUrl"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-slate-300">Medical Certificate URL</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
																			placeholder="https://..."
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>

													<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
														<FormField
															control={form.control}
															name="clubAffiliation"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="flex items-center gap-2 text-slate-300">
																		<Trophy className="h-4 w-4" />
																		Club Affiliation
																	</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
																			placeholder="Your running club (optional)"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														<FormField
															control={form.control}
															name="licenseNumber"
															render={({ field }) => (
																<FormItem>
																	<FormLabel className="text-slate-300">License Number</FormLabel>
																	<FormControl>
																		<Input
																			{...field}
																			className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20"
																			placeholder="License # (optional)"
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												</div>
											)}
										</motion.div>
									</AnimatePresence>

									{/* Navigation Buttons */}
									<div className="flex justify-between pt-6">
										<Button
											type="button"
											variant="outline"
											onClick={prevStep}
											disabled={currentStep === 0}
											className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700"
										>
											<ChevronLeft className="mr-2 h-4 w-4" />
											Previous
										</Button>

										{currentStep === steps.length - 1 ? (
											<Button
												type="submit"
												disabled={isSubmitting}
												className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
											>
												{isSubmitting ? (
													<motion.div
														animate={{ rotate: 360 }}
														transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
														className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
													/>
												) : (
													<Zap className="mr-2 h-4 w-4" />
												)}
												{isSubmitting ? 'Submitting...' : 'Complete Registration'}
											</Button>
										) : (
											<Button
												type="button"
												onClick={nextStep}
												className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
											>
												Next
												<ChevronRight className="ml-2 h-4 w-4" />
											</Button>
										)}
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	)
}
