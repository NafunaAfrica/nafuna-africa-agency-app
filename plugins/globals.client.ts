import { readSingleton } from '@directus/sdk';

export default defineNuxtPlugin(async () => {
	const appConfig = useAppConfig();
	
	try {
		// Fetch globals data from Directus
		const globals = await useDirectus(
			readSingleton('globals', {
				fields: ['*'],
			})
		);
		
		// Add globals to app config
		appConfig.globals = globals;
	} catch (error) {
		console.warn('Failed to fetch globals from Directus:', error);
		// Set default globals if fetch fails
		appConfig.globals = {
			title: 'Nafuna Africa',
			description: 'Your digital agency partner',
			og_image: null,
		};
	}
});
