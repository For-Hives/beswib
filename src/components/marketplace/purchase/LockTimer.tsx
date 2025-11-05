import NumberFlow from '@number-flow/react'
import type React from 'react'

interface LockTimerProps {
	seconds: number
}

// Simple number flow animation using CSS transitions
export const LockTimer: React.FC<LockTimerProps> = ({ seconds }) => {
	// Format as MM:SS
	const min = Math.floor(seconds / 60)
	const sec = seconds % 60
	return (
		<div className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-black shadow-lg">
			<span className="text-lg font-bold">Bib locked for you</span>
			<span className="flex items-center font-mono text-2xl transition-all">
				{min}:
				<NumberFlow value={sec} />
			</span>
		</div>
	)
}

// Add basic numberflow animation
// You can further enhance with a library like framer-motion or react-spring for more advanced effects.
