'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useThemeStore } from '@/hooks/useTheme'

// Global knobs
export const GLOBAL_SPEED = 0.75 // >1.0 makes everyone faster
export const COUNT_MULTIPLIER = 0.2 // >1.0 increases number of entities

type RaceEntity = {
	id: string
	kind: 'bike' | 'runner'
	topPercent: number
	durationMs: number
	delayMs: number
	zIndex: number
	color: string
	internalDurMs: number
	isSpecial?: boolean
	name?: string
}

export function AnimatedLife() {
	const { theme } = useThemeStore()

	const [entities, setEntities] = useState<RaceEntity[]>([])
	const nextWaveAtRef = useRef<number | null>(null)
	const fastSpecialIdRef = useRef<string | null>(null)
	const slowSpecialIdRef = useRef<string | null>(null)
	const [showSpecialTooltip, setShowSpecialTooltip] = useState(false)

	const randInt = useCallback((min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min, [])

	const clampToOneMinute = useCallback((durationMs: number, delayMs: number) => {
		const cap = 60000
		if (delayMs + durationMs <= cap) return { durationMs, delayMs }
		const maxDuration = Math.max(10000, cap - delayMs - 500)
		return { durationMs: Math.min(durationMs, maxDuration), delayMs }
	}, [])

	const generateGroup = useCallback(
		(kind: 'bike' | 'runner', count: number): RaceEntity[] => {
			// Group distribution: peloton, breakaway, stragglers
			const pelotonCount = Math.max(3, Math.floor(count * 0.7))
			const breakawayCount = Math.max(1, Math.floor(count * 0.1))
			const stragglerCount = Math.max(0, count - pelotonCount - breakawayCount)

			const result: RaceEntity[] = []

			// Tailwind-like neutral gray shades (broader range for more disparity)
			const neutralForLight = [
				'#0a0a0a',
				'#111111',
				'#171717',
				'#262626',
				'#303030',
				'#404040',
				'#525252',
				'#6b7280',
				'#737373',
				'#9ca3af',
				'#a3a3a3',
			]
			const neutralForDark = [
				'#fafafa',
				'#f9fafb',
				'#f5f5f5',
				'#e5e5e5',
				'#e7e5e4',
				'#d4d4d4',
				'#cfcfcf',
				'#bfbfbf',
				'#a3a3a3',
			]
			const palette = theme === 'dark' ? neutralForDark : neutralForLight
			const pickColor = () => palette[randInt(0, palette.length - 1)]

			// Helper for durations per kind/group (ms)
			// Faster overall now
			const pickDuration = (g: 'peloton' | 'breakaway' | 'straggler') => {
				if (kind === 'bike') {
					if (g === 'breakaway') return randInt(5000, 8000)
					if (g === 'peloton') return randInt(7000, 10000)
					return randInt(10000, 14000)
				}
				// runner
				if (g === 'breakaway') return randInt(7000, 11000)
				if (g === 'peloton') return randInt(10000, 16000)
				return randInt(16000, 22000)
			}

			const pickDelay = (g: 'peloton' | 'breakaway' | 'straggler') => {
				if (g === 'breakaway') return randInt(0, 500)
				if (g === 'peloton') return randInt(0, 1500)
				return randInt(500, 2500)
			}

			const kindMin = kind === 'bike' ? 5000 : 7000
			const kindMax = kind === 'bike' ? 14000 : 22000
			const internalMin = kind === 'bike' ? 200 : 300 // ms per internal cycle
			const internalMax = kind === 'bike' ? 600 : 800
			const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
				const t = Math.min(1, Math.max(0, (value - inMin) / Math.max(1, inMax - inMin)))
				return Math.round(outMin + (outMax - outMin) * t)
			}

			const pushEntity = (g: 'peloton' | 'breakaway' | 'straggler') => {
				let durationMs = pickDuration(g)
				let delayMs = pickDelay(g)
				// Apply global speed
				durationMs = Math.max(1000, Math.round(durationMs / GLOBAL_SPEED))
				delayMs = Math.max(0, Math.round(delayMs / GLOBAL_SPEED))
				const { durationMs: dMs, delayMs: dlMs } = clampToOneMinute(durationMs, delayMs)
				// Vertical position: random across 0–40 (decoupled from group)
				const topPercent = randInt(0, 40)
				let internalDurMs = mapRange(dMs, kindMin, kindMax, internalMin, internalMax)
				internalDurMs = Math.max(150, Math.round(internalDurMs / GLOBAL_SPEED))
				result.push({
					id: `${kind}-${g}-${crypto.randomUUID()}`,
					kind,
					topPercent,
					durationMs: dMs,
					delayMs: dlMs,
					zIndex: kind === 'bike' ? 3 : 2,
					color: pickColor(),
					internalDurMs,
				})
			}

			for (let i = 0; i < pelotonCount; i++) pushEntity('peloton')

			for (let i = 0; i < breakawayCount; i++) pushEntity('breakaway')

			for (let i = 0; i < stragglerCount; i++) pushEntity('straggler')

			return result
		},
		[clampToOneMinute, randInt, theme]
	)

	const spawnWave = useCallback(() => {
		const bikeCount = randInt(Math.round(25 * COUNT_MULTIPLIER), Math.round(55 * COUNT_MULTIPLIER))
		const runnerCount = randInt(Math.round(25 * COUNT_MULTIPLIER), Math.round(55 * COUNT_MULTIPLIER))
		const bikes = generateGroup('bike', bikeCount)
		const runners = generateGroup('runner', runnerCount)
		const all = [...bikes, ...runners]
		// Compute baselines
		const durations = all.map(e => e.durationMs)
		const fastestMs = durations.length ? Math.min(...durations) : 10000
		const slowestMs = durations.length ? Math.max(...durations) : 20000
		// Ensure exactly one fastest special (Bréval) and one slowest special (quentin)
		const hasFast = fastSpecialIdRef.current && all.some(e => e.id === fastSpecialIdRef.current)
		const hasSlow = slowSpecialIdRef.current && all.some(e => e.id === slowSpecialIdRef.current)
		let fastIdx = -1
		let slowIdx = -1
		if (!hasFast && all.length > 0) fastIdx = randInt(0, all.length - 1)
		if (!hasSlow && all.length > 1) {
			do {
				slowIdx = randInt(0, all.length - 1)
			} while (slowIdx === fastIdx)
		}
		if (fastIdx >= 0) {
			const extraFast = 1 + (Math.random() * 0.1 + 0.05) // +5% to +15% speed
			const targetDur = Math.max(300, Math.round(fastestMs / extraFast))
			const chosen = all[fastIdx]
			chosen.isSpecial = true
			chosen.name = 'Bréval'
			// Base color while tooltip hidden (neutral gray)
			chosen.color = '#9ca3af'
			chosen.durationMs = targetDur
			// internal duration proportional
			chosen.internalDurMs = Math.max(100, Math.round(chosen.internalDurMs / extraFast))
			fastSpecialIdRef.current = chosen.id
		}
		if (slowIdx >= 0) {
			const extraSlow = 1 + (Math.random() * 0.1 + 0.05) // +5% to +15% slower (longer duration)
			const targetDur = Math.min(59000, Math.round(slowestMs * extraSlow))
			const chosenS = all[slowIdx]
			chosenS.isSpecial = true
			chosenS.name = 'quentin'
			chosenS.color = '#9ca3af'
			chosenS.durationMs = targetDur
			chosenS.internalDurMs = Math.max(150, Math.round(chosenS.internalDurMs * extraSlow))
			slowSpecialIdRef.current = chosenS.id
		}
		setEntities(all)
		nextWaveAtRef.current = Date.now() + 60000
	}, [generateGroup, randInt])

	useEffect(() => {
		spawnWave()
		const id = setInterval(spawnWave, 60000)
		return () => clearInterval(id)
	}, [spawnWave])

	const handleAnimationEnd = useCallback(
		(entity: RaceEntity) => {
			setEntities(prev => {
				const others = prev.filter(e => e.id !== entity.id)
				const next = [...others]
				// baselines from remaining entities
				const durations = others.map(e => e.durationMs)
				const fastestMs = durations.length ? Math.min(...durations) : 10000
				const slowestMs = durations.length ? Math.max(...durations) : 20000
				const fresh = generateGroup(entity.kind, 1)[0]
				if (entity.isSpecial && entity.name === 'Bréval') {
					const extraFast = 1 + (Math.random() * 0.1 + 0.05)
					fresh.isSpecial = true
					fresh.name = 'Bréval'
					fresh.color = '#9ca3af'
					fresh.durationMs = Math.max(300, Math.round(fastestMs / extraFast))
					fresh.internalDurMs = Math.max(100, Math.round(fresh.internalDurMs / extraFast))
					fastSpecialIdRef.current = fresh.id
				} else if (entity.isSpecial && entity.name === 'quentin') {
					const extraSlow = 1 + (Math.random() * 0.1 + 0.05)
					fresh.isSpecial = true
					fresh.name = 'quentin'
					fresh.color = '#9ca3af'
					fresh.durationMs = Math.min(59000, Math.round(slowestMs * extraSlow))
					fresh.internalDurMs = Math.max(150, Math.round(fresh.internalDurMs * extraSlow))
					slowSpecialIdRef.current = fresh.id
				}
				next.push(fresh)
				return next
			})
		},
		[generateGroup]
	)

	return (
		<div
			className="absolute bottom-0 left-0 z-20 flex h-[35vh] w-screen"
			onClick={() => setShowSpecialTooltip(v => !v)}
		>
			<div className="relative h-full w-full">
				<style>{`
					@keyframes race-move {
            from { transform: translateX(-25vw); }
            to { transform: translateX(125vw); }
					}
					.race-move {
						animation-name: race-move;
						animation-timing-function: linear;
            animation-fill-mode: both;
						will-change: transform;
            transform: translateX(-25vw);
					}
				`}</style>

				{entities.map(entity => (
					<div
						key={entity.id}
						className="pointer-events-none absolute top-0 left-0"
						style={{ top: `${entity.topPercent}%`, zIndex: entity.zIndex }}
					>
						<div
							className="race-move relative"
							style={{ animationDuration: `${entity.durationMs}ms`, animationDelay: `${entity.delayMs}ms` }}
							onAnimationEnd={() => handleAnimationEnd(entity)}
						>
							{entity.isSpecial && showSpecialTooltip && (
								<div className="pointer-events-none absolute -top-6 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white">
									{entity.name}
								</div>
							)}
							{entity.kind === 'bike' ? (
								<Cycling
									color={
										entity.isSpecial && showSpecialTooltip
											? entity.name === 'Bréval'
												? '#f97316'
												: entity.name === 'quentin'
													? '#22c55e'
													: entity.color
											: entity.color
									}
									internalDurMs={entity.internalDurMs}
								/>
							) : (
								<Runner
									color={
										entity.isSpecial && showSpecialTooltip
											? entity.name === 'Bréval'
												? '#f97316'
												: entity.name === 'quentin'
													? '#22c55e'
													: entity.color
											: entity.color
									}
									internalDurMs={entity.internalDurMs}
								/>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

function Cycling({ color, internalDurMs }: { color: string; internalDurMs: number }) {
	return (
		<svg
			width="800"
			height="800"
			viewBox="0 0 800 800"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-10 w-10"
		>
			<path
				d="M644.677 410.63C730.333 410.63 800 480.325 800 565.981C800 651.609 730.333 721.277 644.677 721.277C559.034 721.277 489.367 651.609 489.367 565.981C489.367 480.325 559.034 410.63 644.677 410.63ZM644.677 678.727C706.867 678.727 757.436 628.142 757.436 565.98C757.436 503.777 706.866 453.206 644.677 453.206C582.502 453.206 531.917 503.778 531.917 565.98C531.919 628.142 582.502 678.727 644.677 678.727Z"
				fill={color}
			/>
			<path
				d="M155.323 410.63C240.966 410.63 310.633 480.325 310.633 565.981C310.633 651.609 240.966 721.277 155.323 721.277C69.6672 721.277 1.14441e-05 651.609 1.14441e-05 565.981C1.14441e-05 480.325 69.6672 410.63 155.323 410.63ZM155.323 678.727C217.498 678.727 268.083 628.142 268.083 565.98C268.083 503.777 217.498 453.206 155.323 453.206C93.1344 453.206 42.55 503.778 42.55 565.98C42.55 628.142 93.1344 678.727 155.323 678.727Z"
				fill={color}
			/>
			<path
				d="M393.791 136.427L612.578 170.467C652.644 179.588 650.636 196.35 645.6 222.748L621.278 310.983L706.391 311.703L706.377 311.906C717.248 313.264 725.677 322.52 725.677 333.744C725.677 345.933 715.795 355.786 703.634 355.786L587.698 367.444C565.833 368.394 558.517 348.416 558.967 331.925L563.772 276.073L482.528 253.217C482.528 253.217 521.969 300.028 525.241 304.114C541.581 324.541 547.5 361.986 521.155 381.748L407.106 464.555L400.619 563.852C400.619 580.288 387.291 593.616 370.855 593.616C354.433 593.616 341.105 580.288 341.105 563.852C341.105 563.2 314.909 245.767 314.909 245.767C307.334 179.586 345.405 128.813 393.791 136.427ZM453.889 356.763C459.562 352.514 458.164 346.841 453.889 341.167C449.655 335.48 415.614 307.114 415.614 307.114L408.503 396.475L453.889 356.763Z"
				fill={color}
			/>
			<path
				d="M761.02 154.247H702.863V223.234H694.094V154.247H664.859C664.859 154.247 634.172 138.747 620.681 123.261C616.908 118.917 614.681 108.656 627.359 111.303C627.359 111.303 620.355 94.9344 618.089 88.6094C615.822 82.2578 617.628 76.4485 630.277 79.6125C636.764 81.2407 670.411 87.6735 717.983 98.0969C761.347 107.613 772.719 141.57 772.719 147.202C772.719 152.836 770.616 154.247 761.02 154.247Z"
				fill={color}
			/>
			<path d="M767.183 180.998L754.519 192.602L717.494 182.058V164.114H767.183V180.998Z" fill={color} />

			<path d="M18 563.5H290.5" stroke={color} strokeWidth="25">
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					from="0 154.25 563.5"
					to="360 154.25 563.5"
					dur={`${Math.max(0.2, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
			<path d="M508 563.5H780.5" stroke={color} strokeWidth="25">
				<animateTransform
					attributeName="transform"
					attributeType="XML"
					type="rotate"
					from="0 644.25 563.5"
					to="360 644.25 563.5"
					dur={`${Math.max(0.2, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
		</svg>
	)
}

function Runner({ color, internalDurMs }: { color: string; internalDurMs: number }) {
	return (
		<svg
			width="800"
			height="800"
			viewBox="0 0 800 800"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-10 w-10"
		>
			{/* right leg */}
			<path d="M583 750L530 559L388.5 419" stroke={color} strokeWidth="80" strokeLinecap="round" strokeLinejoin="round">
				<animate
					attributeName="d"
					values="M583 750L530 559L388.5 419; M135 625L315 625L388.5 419; M583 750L530 559L388.5 419"
					keyTimes="0; 0.5; 1"
					calcMode="spline"
					keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
					dur={`${Math.max(0.25, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
			{/* body */}
			<path d="M388 419L430 199" stroke={color} strokeWidth="80" strokeLinecap="round" />
			{/* left leg */}
			<path d="M135 625L315 625L388.5 419" stroke={color} strokeWidth="80" strokeLinecap="round" strokeLinejoin="round">
				<animate
					attributeName="d"
					values="M135 625L315 625L388.5 419; M583 750L530 559L388.5 419; M135 625L315 625L388.5 419"
					keyTimes="0; 0.5; 1"
					calcMode="spline"
					keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
					dur={`${Math.max(0.25, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
			{/* arm */}
			<path
				d="M430 201L268 259L207.5 372.5"
				stroke={color}
				strokeWidth="80"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<animate
					attributeName="d"
					values="M430 201L268 259L207.5 372.5; M430 201L533 358.5L649.5 418; M430 201L268 259L207.5 372.5"
					keyTimes="0; 0.5; 1"
					calcMode="spline"
					keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
					dur={`${Math.max(0.25, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
			{/* arm */}
			<path d="M430 201L532 366L660.5 348" stroke={color} strokeWidth="80" strokeLinecap="round" strokeLinejoin="round">
				<animate
					attributeName="d"
					values="M430 201L532 366L660.5 348; M430 201L280 257L208 369.5; M430 201L532 366L660.5 348"
					keyTimes="0; 0.5; 1"
					calcMode="spline"
					keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
					dur={`${Math.max(0.25, internalDurMs / 1000).toFixed(2)}s`}
					repeatCount="indefinite"
				/>
			</path>
			{/* head (no anim)*/})
			<path
				d="M449.063 137.188C467.188 137.188 482.5 130.937 495.313 118.125C508.125 105.312 514.375 90.3126 514.375 73.1251C514.375 55.0001 508.125 39.6874 495.313 26.8749C482.5 14.0624 467.188 7.8125 449.063 7.8125C431.563 7.8125 416.563 14.0624 403.75 26.8749C390.938 39.6874 384.688 55.0001 384.688 73.1251C384.688 90.6251 390.938 105.625 403.75 118.125C416.875 130.937 431.875 137.188 449.063 137.188Z"
				fill={color}
			></path>
		</svg>
	)
}
