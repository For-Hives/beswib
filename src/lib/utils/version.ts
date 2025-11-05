import packageJson from '../../../package.json'

export function getVersion(): string {
	return `v${packageJson.version}`
}
