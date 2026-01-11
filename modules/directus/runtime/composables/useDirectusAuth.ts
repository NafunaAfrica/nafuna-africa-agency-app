import { readMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~/types/schema';
import type { User } from '~/types';

import { useState, useRuntimeConfig, useRoute, navigateTo, clearNuxtData, useNuxtApp, useCookie } from '#imports';

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

			// Get basic user info from SDK
			const userResponse = await $directus.request(
				readMe({
					fields: ['*']
				})
			);

			console.log('=== USER RESPONSE ===');
			console.log('userResponse:', userResponse);

			user.value = userResponse as User;

			// Fetch role via server API (uses admin token to bypass permission restrictions)
			let userRoleId: string | undefined;
			if (userResponse?.id) {
				try {
					const roleResponse = await $fetch<{ roleId: string | null; error?: string }>(`/api/campus/check-role?userId=${userResponse.id}`);
					console.log('=== ROLE API RESPONSE ===');
					console.log('roleResponse:', roleResponse);
					userRoleId = roleResponse?.roleId || undefined;
				} catch (roleError) {
					console.error('Failed to fetch role:', roleError);
				}
			}

			console.log('Extracted userRoleId:', userRoleId);

			// Cache role in localStorage for middleware
			if (process.client && userRoleId) {
				const roleIdStr = userRoleId.toString().trim();
				localStorage.setItem('user_role_id', roleIdStr);

				// CRITICAL: Set Cookie immediately for Middleware/SSR support
				const roleCookie = useCookie('user_role_id', {
					maxAge: 60 * 60 * 24 * 7, // 1 week
					sameSite: 'lax',
					secure: true,
					path: '/'
				});
				roleCookie.value = roleIdStr;
			}

			// Determine redirect based on role
			const returnPath = route.query.redirect?.toString();
			const campusRoleId = config.public.campusRoleId;

			// Direct comparison - both should be strings already
			const userRole = userRoleId ? userRoleId.toString().trim() : '';
			const campusRole = campusRoleId ? campusRoleId.toString().trim() : '';

			console.log('=== LOGIN DEBUG ===');
			console.log('userRole:', userRole);
			console.log('campusRole:', campusRole);
			console.log('match:', userRole === campusRole);

			let redirect = '/portal';

			// Campus users ALWAYS go to /campus/dashboard (Personal Dashboard) - ignore any redirect query
			if (campusRole && userRole && userRole === campusRole) {
				redirect = '/campus/dashboard';
			} else if (returnPath && !returnPath.startsWith('/campus')) {
				// Only use redirect query for non-campus users
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

		// Clear auth persistence
		if (process.client) {
			localStorage.removeItem('authenticated');
			localStorage.removeItem('user_role_id');

			// Clear cookie
			const roleCookie = useCookie('user_role_id');
			roleCookie.value = null;
		}

		user.value = null;

		await clearNuxtData();
		await navigateTo('/auth/signin');
	}

	async function fetchUser(params?: object) {
		try {
			// Check if we have a valid session
			const token = await $directus.getToken();

			if (!token) {
				user.value = null;
				return;
			}

			// Get basic user info from SDK
			const userResponse = await $directus.request(
				readMe({
					fields: ['*']
				})
			);

			console.log('=== FETCH USER DEBUG ===');
			console.log('userResponse:', userResponse);

			user.value = userResponse as User;

			// Fetch role via server API (uses admin token to bypass permission restrictions)
			if (process.client && userResponse?.id) {
				try {
					const roleResponse = await $fetch<{ roleId: string | null; error?: string }>(`/api/campus/check-role?userId=${userResponse.id}`);
					console.log('=== ROLE API RESPONSE (fetchUser) ===');
					console.log('roleResponse:', roleResponse);
					if (roleResponse?.roleId) {
						localStorage.setItem('user_role_id', roleResponse.roleId.toString().trim());

						// SYNC COOKIE (CRITICAL FOR PERSISTENCE)
						if (process.client && typeof localStorage !== 'undefined') {
							const roleCookie = useCookie('user_role_id', {
								maxAge: 60 * 60 * 24 * 7,
								path: '/'
							});
							roleCookie.value = roleResponse.roleId.toString().trim();
						}
					}
				} catch (roleError) {
					console.error('Failed to fetch role:', roleError);
				}
			}
		} catch (error) {
			console.error('fetchUser error:', error);
			user.value = null;
		}
	}

	return {
		user,
		login,
		logout,
		fetchUser,
		_loggedIn,
	};
}
