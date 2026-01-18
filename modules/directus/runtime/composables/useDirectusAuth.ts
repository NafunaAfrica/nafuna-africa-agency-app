import { readMe, updateMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~/types/schema';
import type { User } from '~/types';

import { useState, useRuntimeConfig, useRoute, navigateTo, clearNuxtData, useNuxtApp, useCookie } from '#imports';

export default function useDirectusAuth<DirectusSchema extends object>() {
	const nuxtApp = useNuxtApp();
	const $directus = nuxtApp.$directus as RestClient<Schema> & AuthenticationClient<Schema>;

	const user: Ref<User | null | undefined> = useState('user');
	const token = useState<string | null>('directus_token');

	// CRITICAL: Explicit token cookie for SSR and Image rendering
	const tokenCookie = useCookie('directus_token', {
		maxAge: 60 * 60 * 24 * 7, // 1 week
		sameSite: 'lax',
		secure: true,
		path: '/'
	});

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

			// SYNC TOKEN
			const accessToken = await $directus.getToken();
			token.value = accessToken;
			tokenCookie.value = accessToken || null;

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

					// CRITICAL FIX: Merge role back into user object so middleware sees it
					if (userRoleId && user.value) {
						// Ensure role object structure exists
						(user.value as any).role = { id: userRoleId };
					}

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
		const tokenVal = await $directus.getToken();

		await $directus.logout();

		// Clear auth persistence
		if (process.client) {
			localStorage.removeItem('authenticated');
			localStorage.removeItem('user_role_id');

			// Clear cookie
			const roleCookie = useCookie('user_role_id');
			roleCookie.value = null;
		}

		tokenCookie.value = null;
		user.value = null;
		token.value = null;

		await clearNuxtData();
		await navigateTo('/auth/signin');
	}

	async function fetchUser(params?: object) {
		try {
			// Check if we have a valid session via Cookie first (SSR friendly)
			if (tokenCookie.value) {
				token.value = tokenCookie.value;
				await $directus.setToken(tokenCookie.value);
			} else {
				// Fallback to SDK (mostly for client side initially)
				const currentToken = await $directus.getToken();
				token.value = currentToken || null;
			}

			// If no token, we can't fetch user
			// if (!token.value) {
			// 	user.value = null;
			// 	return;
			// }

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
						const rId = roleResponse.roleId.toString().trim();
						localStorage.setItem('user_role_id', rId);

						// Merge role back into user object
						if (user.value) {
							(user.value as any).role = { id: rId };
						}

						// SYNC COOKIE (CRITICAL FOR PERSISTENCE)
						if (process.client && typeof localStorage !== 'undefined') {
							const roleCookie = useCookie('user_role_id', {
								maxAge: 60 * 60 * 24 * 7,
								path: '/'
							});
							roleCookie.value = rId;
						}
					}
				} catch (roleError) {
					console.error('Failed to fetch role:', roleError);
				}
			}
		} catch (error) {
			console.error('fetchUser error:', error);

			// RESILIENCE: If API fails, check if we have a persistence cookie.
			// If we do, DO NOT log out. Fake the user state to keep them on the page.
			if (process.client) {
				const savedRole = useCookie('user_role_id').value || localStorage.getItem('user_role_id');
				if (savedRole && tokenCookie.value) {
					console.warn('Recovering session from cookie despite API error.');
					// Create a minimal user object to satisfy Middleware
					user.value = {
						id: 'recovered-session',
						first_name: 'Student',
						email: '',
						role: { id: savedRole }
					} as User;
					return; // Successfully recovered, do not set user to null
				}
			}

			user.value = null;
			token.value = null;
		}
	}

	async function updateUser(data: Partial<User>) {
		try {
			// Update user in Directus
			const response = await $directus.request(updateMe(data));

			// Update local state
			if (user.value) {
				user.value = { ...user.value, ...response } as User;
			}

			return response;
		} catch (err) {
			console.error('Failed to update user:', err);
			throw err;
		}
	}

	return {
		user,
		token,
		login,
		logout,
		fetchUser,
		updateUser,
		_loggedIn,
		isLoggedIn: computed(() => !!user.value)
	};
}
