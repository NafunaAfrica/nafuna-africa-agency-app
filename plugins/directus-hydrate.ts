import { defineNuxtPlugin, useCookie, useNuxtApp } from '#imports';
import type { AuthenticationClient, RestClient } from '@directus/sdk';
import type { Schema } from '~/types/schema';

export default defineNuxtPlugin((nuxtApp) => {
	const { $directus } = useNuxtApp();
	const token = useCookie('directus_token').value;
	
	const client = $directus as unknown as RestClient<Schema> & AuthenticationClient<Schema>;

	if (token && client && typeof client.setToken === 'function') {
		// console.log('Hydrating Directus token from cookie');
		client.setToken(token);
	}
});
