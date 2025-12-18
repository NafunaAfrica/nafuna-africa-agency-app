import { readMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~/types/schema';
import type { User } from '~/types';

import { useState, useRuntimeConfig, useRoute, navigateTo, clearNuxtData, useNuxtApp } from '#imports';

export default function useDirectusAuth<DirectusSchema extends object>() {
	const nuxtApp = useNuxtApp();
	const $directus = nuxtApp.$directus as RestClient<Schema> & AuthenticationClient<Schema>;

	const user: Ref<User | null | undefined> = useState('user');

	const config = useRuntimeConfig();

	const _loggedIn = {
		get: () => process.client && localStorage.getItem('authenticated'),
		set: (value: boolean) => process.client && localStorage.setItem('authenticated', value.toString()),
	};

	async function login(email: string, password: string, otp?: string) {
		const route = useRoute();

		const response = await $directus.login(email, password);

		_loggedIn.set(true);

		// Fetch user to get role
		await fetchUser({ fields: ['*', { contacts: ['*'] }] });

		// Determine redirect based on role
		const returnPath = route.query.redirect?.toString();
		let redirect = returnPath || '/portal';

		// If no explicit redirect, check role for campus users
		if (!returnPath && user.value?.role) {
			const campusRoleId = config.public.campusRoleId;
			const userRoleId = typeof user.value.role === 'object' ? (user.value.role as any).id : user.value.role;
			
			if (campusRoleId && userRoleId === campusRoleId) {
				redirect = '/student';
			}
		}

		await navigateTo(redirect);
	}

	async function logout() {
		const token = await $directus.getToken();

		await $directus.logout();

		user.value = null;

		await clearNuxtData();
		await navigateTo(config.public?.directus?.auth?.redirect?.login || '/auth/login');
	}

	async function fetchUser(params?: object) {
		const fields = config.public?.directus?.auth?.userFields || ['*'];

		const response = await $directus.request(
			readMe({
				// @ts-ignore
				fields,
				...params,
			}),
		);

		user.value = response as User;
	}

	return {
		user,
		login,
		logout,
		fetchUser,
		_loggedIn,
	};
}
