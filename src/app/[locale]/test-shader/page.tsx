'use client'

import MountainShader from '@/components/ui/MountainShader'

export default function TestShaderPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
			<div className="container mx-auto p-8">
				<h1 className="mb-8 text-center text-4xl font-bold text-white">Test du Shader de Montagne Original</h1>
				<div className="mx-auto max-w-4xl">
					<div className="h-96 w-full overflow-hidden rounded-lg border-2 border-white/20 shadow-2xl">
						<MountainShader className="h-full w-full" />
					</div>
					<div className="mt-8 space-y-4 text-center text-white">
						<p className="text-lg">Ce shader utilise EXACTEMENT ton code mountainImage.glsl original</p>
						<p className="text-sm text-gray-300">Si tu vois une erreur, vérifie la console du navigateur (F12)</p>
					</div>
				</div>
			</div>
		</div>
	)
}
