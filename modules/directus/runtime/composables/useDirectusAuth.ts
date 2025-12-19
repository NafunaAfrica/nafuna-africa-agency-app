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

		try {
			const response = await $directus.login(email, password);

			_loggedIn.set(true);

			// Fetch user with role - use direct API call to ensure role is included
			const userResponse = await $directus.request(
				readMe({
					fields: ['*', 'role'],
				}),
			);
			user.value = userResponse as User;
			
			// Extract and cache role ID
			let userRoleId: string | undefined;
			if (typeof userResponse.role === 'string') {
				userRoleId = userResponse.role;
			} else if (userResponse.role && typeof userResponse.role === 'object') {
				userRoleId = (userResponse.role as any).id;
			}
			
			// Cache role in localStorage for middleware
			if (process.client && userRoleId) {
				localStorage.setItem('user_role_id', userRoleId);
			}
			
			// Determine redirect based on role
			const returnPath = route.query.redirect?.toString();
			const campusRoleId = config.public.campusRoleId;
		
			console.log('=== LOGIN DEBUG ===');
			console.log('userRoleId:', userRoleId, 'type:', typeof userRoleId);
			console.log('campusRoleId:', campusRoleId, 'type:', typeof campusRoleId);
			console.log('returnPath:', returnPath);
			console.log('match:', userRoleId === campusRoleId);
		
			let redirect = '/portal';
		
			// Campus users go to /campus, everyone else to /portal
			if (campusRoleId && userRoleId === campusRoleId) {
				redirect = '/campus';
			}
		
			// Override with explicit redirect if provided
			if (returnPath) {
				redirect = returnPath;
			}

			console.log('Final redirect:', redirect);
			await navigateTo(redirect);
		} catch (err) {
			console.error('Login error:', err);
			throw err;
		}
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
