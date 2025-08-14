'use client'

import { useState } from 'react'

import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'

export default function TestTimelinePage() {
	const [clickLogs, setClickLogs] = useState<string[]>([])

	// Intercept console.log pour afficher les clics
	// eslint-disable-next-line no-console
	const originalLog = console.log
	// eslint-disable-next-line no-console
	console.log = (...args) => {
		const message = args.join(' ')
		if (message.includes('🔥 Click')) {
			setClickLogs(prev => [message, ...prev.slice(0, 4)]) // Keep last 5 logs
		}
		originalLog(...args)
	}

	return (
		<div className="bg-background min-h-screen p-8">
			<div className="mx-auto max-w-6xl">
				<h1 className="text-foreground mb-8 text-center text-3xl font-bold">
					Test Timeline Orbital avec Rotation Compensatoire
				</h1>
				<p className="text-muted-foreground mb-8 text-center">
					Ce composant teste la rotation compensatoire des nœuds et du logo central. Les nœuds tournent autour du centre
					mais gardent leur orientation. Cliquez sur un nœud pour l'expandre et voir les relations.
				</p>

				{/* Debug des clics */}
				<div className="bg-muted mb-4 rounded-lg p-4">
					<h3 className="text-foreground mb-2 text-sm font-semibold">Logs de clic (Debug) :</h3>
					{clickLogs.length === 0 ? (
						<p className="text-muted-foreground text-sm">Aucun clic détecté</p>
					) : (
						<ul className="text-foreground space-y-1">
							{clickLogs.map((log, i) => (
								<li key={i} className="font-mono text-xs">
									{log}
								</li>
							))}
						</ul>
					)}
				</div>

				<RadialOrbitalTimeline timelineData={[]} />
			</div>
		</div>
	)
}
