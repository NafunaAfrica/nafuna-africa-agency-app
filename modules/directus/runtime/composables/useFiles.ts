import { useRuntimeConfig } from '#imports';
import type { File } from '~/types';

export default function useFiles() {
	const config = useRuntimeConfig();

	function fileUrl(fileId: string) {
		if (!fileId) return undefined;

		// Get token to access private assets
		const token = useState<string | null>('directus_token');
		let url = '';

		if (typeof fileId === 'string') {
			url = `${config.public.directus.rest.baseUrl}/assets/${fileId}`;
		} else if (fileId as File) {
			// Handle case where fileId is an object<File>
			url = `${config.public.directus.rest.baseUrl}/assets/${(fileId as File).id}`;
		}

		if (url && token.value) {
			url += `?access_token=${token.value}`;
		}

		return url || undefined;
	}

	return {
		fileUrl,
	};
}
