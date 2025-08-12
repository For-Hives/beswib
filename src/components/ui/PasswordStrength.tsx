'use client'

import { motion } from 'motion/react'
import { getPasswordStrength } from '@/lib/validation'
import { authTranslations } from '@/lib/translations/auth'
import { Locale } from '@/lib/i18n-config'

interface PasswordStrengthProps {
	password: string
	show?: boolean
	locale?: Locale
}

export function PasswordStrength({ password, show = true, locale = 'fr' }: PasswordStrengthProps) {
	if (!show || !password) return null

	const { score, feedback, color } = getPasswordStrength(password, locale)
	const t = authTranslations[locale].passwordStrength

	const strengthLabels = {
		0: t.veryWeak,
		1: t.weak,
		2: t.medium,
		3: t.good,
		4: t.strong,
		5: t.veryStrong,
	}

	const strengthColors = {
		red: 'bg-red-500',
		orange: 'bg-orange-500',
		yellow: 'bg-yellow-500',
		green: 'bg-green-500',
	}

	const strengthTextColors = {
		red: 'text-red-600',
		orange: 'text-orange-600',
		yellow: 'text-yellow-600',
		green: 'text-green-600',
	}

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: 'auto' }}
			exit={{ opacity: 0, height: 0 }}
			className="mt-2 space-y-2"
		>
			{/* Strength bar */}
			<div className="space-y-1">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground text-xs">{t.label}</span>
					<span className={`text-xs font-medium ${strengthTextColors[color]}`}>
						{strengthLabels[score as keyof typeof strengthLabels]}
					</span>
				</div>

				<div className="flex gap-1">
					{[1, 2, 3, 4, 5].map(level => (
						<motion.div
							key={level}
							className={`h-1 flex-1 rounded-full ${level <= score ? strengthColors[color] : 'bg-muted'}`}
							initial={{ scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ delay: level * 0.1 }}
						/>
					))}
				</div>
			</div>

			{/* Feedback */}
			{feedback.length > 0 && (
				<div className="space-y-1">
					<p className="text-muted-foreground text-xs">{t.suggestions}</p>
					<ul className="space-y-0.5">
						{feedback.slice(0, 3).map((item, index) => (
							<motion.li
								key={index}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="text-muted-foreground flex items-center gap-1 text-xs"
							>
								<span className="text-muted-foreground">•</span>
								{item}
							</motion.li>
						))}
					</ul>
				</div>
			)}
		</motion.div>
	)
}
