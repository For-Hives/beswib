'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/inputAlt'
import { Button } from '@/components/ui/button'

export default function TestTimelinePage() {
	const [testInput, setTestInput] = useState('')
	const [testResults, setTestResults] = useState<string[]>([])
	const router = useRouter()

	// Test cases with special characters
	const testCases = [
		'événement spécial',
		'course à pied',
		'Trail du Mont-Blanc',
		"Marathon de l'Équipe",
		'Semi + 10K',
		'Ultra-Trail 100%',
		'Course & Marche',
		'Test@email.com',
		'Course (difficile)',
		'Trail [expert]',
		'Ultra {premium}',
	]

	const handleTestSearch = (searchTerm: string) => {
		// Simulate what happens when we navigate to marketplace with search params
		const encodedSearch = encodeURIComponent(searchTerm)
		const decodedSearch = decodeURIComponent(encodedSearch)

		const result = `Original: "${searchTerm}" → Encoded: "${encodedSearch}" → Decoded: "${decodedSearch}" → Match: ${searchTerm === decodedSearch ? '✅' : '❌'}`
		setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
	}

	const handleNavigateToMarketplace = (searchTerm: string) => {
		// Navigate to marketplace with the search term as a URL parameter
		const params = new URLSearchParams()
		params.set('search', searchTerm)
		router.push(`/fr/marketplace?${params.toString()}`)
	}

	return (
		<div className="bg-background min-h-screen p-8">
			<div className="mx-auto max-w-4xl space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>Test de Recherche avec Caractères Spéciaux</CardTitle>
						<CardDescription>
							Test des fonctionnalités d'encodage/décodage sécurisé des paramètres de recherche dans l'URL
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Manual test input */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Test manuel :</label>
							<div className="flex gap-2">
								<Input
									value={testInput}
									onChange={e => setTestInput(e.target.value)}
									placeholder="Entrez un terme de recherche avec caractères spéciaux..."
									className="flex-1"
								/>
								<Button onClick={() => handleTestSearch(testInput)} disabled={!testInput.trim()}>
									Tester
								</Button>
								<Button
									variant="outline"
									onClick={() => handleNavigateToMarketplace(testInput)}
									disabled={!testInput.trim()}
								>
									→ Marketplace
								</Button>
							</div>
						</div>

						{/* Predefined test cases */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Tests prédéfinis :</label>
							<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
								{testCases.map((testCase, index) => (
									<Button
										key={index}
										variant="outline"
										size="sm"
										onClick={() => {
											setTestInput(testCase)
											handleTestSearch(testCase)
										}}
										className="justify-start text-left"
									>
										{testCase}
									</Button>
								))}
							</div>
						</div>

						{/* Test results */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Résultats des tests :</label>
							<div className="bg-muted max-h-64 overflow-y-auto rounded-lg p-4">
								{testResults.length === 0 ? (
									<p className="text-muted-foreground text-sm">Aucun test effectué</p>
								) : (
									<ul className="space-y-2">
										{testResults.map((result, i) => (
											<li key={i} className="font-mono text-xs break-all">
												{result}
											</li>
										))}
									</ul>
								)}
							</div>
							{testResults.length > 0 && (
								<Button variant="outline" size="sm" onClick={() => setTestResults([])}>
									Effacer les résultats
								</Button>
							)}
						</div>

						{/* Instructions */}
						<div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
							<h4 className="font-semibold">Instructions :</h4>
							<ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
								<li>Testez l'encodage/décodage avec les boutons prédéfinis ou votre propre saisie</li>
								<li>Vérifiez que tous les tests montrent "Match: ✅"</li>
								<li>Utilisez "→ Marketplace" pour tester en conditions réelles</li>
								<li>
									Dans le marketplace, vérifiez que la recherche fonctionne avec des espaces et caractères spéciaux
								</li>
								<li>Vérifiez que l'URL contient les caractères encodés (%20 pour espaces, etc.)</li>
								<li>Vérifiez que la valeur dans l'input de recherche est décodée et lisible</li>
							</ol>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
