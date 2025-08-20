import { version } from '../../../package.json'

export function getVersion(): string {
	return 'v' + version
}
