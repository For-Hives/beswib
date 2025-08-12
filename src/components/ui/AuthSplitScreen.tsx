'use client'

import { Zap } from 'lucide-react'
import { ReactNode } from 'react'

import Link from 'next/link'

import PlasmaShader from './PlasmaShader'

export default function AuthSplitScreen({ children }: { children: ReactNode }) {
	return (
		<div className="flex min-h-screen items-center justify-center overflow-hidden p-4">
			<div className="relative w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl">
				{/* Grid Layout */}
				<div className="grid min-h-[600px] md:grid-cols-12">
					{/* Left Side - Plasma Shader Panel */}
					<div className="relative overflow-hidden md:col-span-6">
						{/* Plasma Shader Background */}
						<div className="absolute inset-0">
							<PlasmaShader />
						</div>

						{/* Overlay for content readability */}
						<div className="absolute inset-0 bg-black/30" />
					</div>

					{/* Right Side - Form Panel */}
					<div className="bg-background/95 flex flex-col justify-center p-8 backdrop-blur-sm md:col-span-6 md:p-12">
						<div className="mx-auto w-full max-w-md">
							{/* Clerk Form Container */}
							<div className="space-y-6">{children}</div>

							{/* Additional Info */}
							<div className="mt-8 text-center">
								<p className="text-muted-foreground text-xs">
									En continuant, vous acceptez nos{' '}
									<Link href="/legals/terms" className="text-primary hover:underline">
										Conditions d'utilisation
									</Link>{' '}
									et notre{' '}
									<Link href="/legals/privacy-policy" className="text-primary hover:underline">
										Politique de confidentialité
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				@keyframes fadeInOut {
					0%,
					100% {
						opacity: 0.1;
					}
					50% {
						opacity: 0.3;
					}
				}
			`}</style>
		</div>
	)
}
