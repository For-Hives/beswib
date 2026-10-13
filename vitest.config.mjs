import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	test: {
		setupFiles: ['./src/tests/setup.ts'],
		// Claude Code worktrees are full copies of the repository, tests included
		exclude: [...configDefaults.exclude, '.claude/**'],
		globals: true,
		environment: 'jsdom',
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			// Next.js resolves 'server-only' itself at build time; under Vitest it is the empty module Next ships
			'server-only': resolve(__dirname, './node_modules/next/dist/compiled/server-only/empty.js'),
		},
	},
	plugins: [react()],
})
