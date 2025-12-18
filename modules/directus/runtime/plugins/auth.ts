import auth from '../middleware/auth';
import common from '../middleware/common';
import guest from '../middleware/guest';
import type { AuthenticationClient, RestClient } from '@directus/sdk';
import type { Schema } from '~/types/schema';

import { addRouteMiddleware, defineNuxtPlugin, useDirectusAuth, useRuntimeConfig, useState, useCookie, useNuxtApp } from '#imports';

export default defineNuxtPlugin(async () => {
	try {
		const config = useRuntimeConfig().public.directus;

		addRouteMiddleware('common', common, { global: true });

		addRouteMiddleware('auth', auth, {
			global: config.auth.enableGlobalAuthMiddleware,
		});

		addRouteMiddleware('guest', guest);

		const initialized = useState('directus-auth-initialized', () => false);

		const { _loggedIn } = useDirectusAuth();

		// Hydrate token from cookie if present
		const token = useCookie('directus_token').value;
		if (token) {
			const { $directus } = useNuxtApp();
			const client = $directus as unknown as RestClient<Schema> & AuthenticationClient<Schema>;
			if (client && typeof client.setToken === 'function') {
				await client.setToken(token);
			}
		}

		if (initialized.value === false) {
			const { fetchUser } = useDirectusAuth();

			await fetchUser({});
		}

		initialized.value = true;

		const { user } = useDirectusAuth();

		if (user.value) {
			_loggedIn.set(true);
		} else {
			_loggedIn.set(false);
		}
	} catch (err: any) {
		// console.error(e)
	}
});
