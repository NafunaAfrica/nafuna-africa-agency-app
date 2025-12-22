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

			// Use SDK's readMe with explicit fields to get role
			// The SDK handles session auth properly via cookies
			const userResponse = await $directus.request(
				readMe({
					fields: ['*', 'role']
				})
			);
			
			console.log('=== USER RESPONSE ===');
			console.log('userResponse:', JSON.stringify(userResponse, null, 2));
			console.log('userResponse.role:', userResponse?.role);
			
			user.value = userResponse as User;
			
			// Extract and cache role ID
			let userRoleId: string | undefined;
			if (typeof userResponse?.role === 'string') {
				userRoleId = userResponse.role;
			} else if (userResponse?.role && typeof userResponse.role === 'object') {
				userRoleId = (userResponse.role as any).id;
			}
			
			console.log('Extracted userRoleId:', userRoleId);
			
			// Cache role in localStorage for middleware
			if (process.client && userRoleId) {
				localStorage.setItem('user_role_id', userRoleId.toString().trim());
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
	
			// Campus users ALWAYS go to /campus - ignore any redirect query
			if (campusRole && userRole && userRole === campusRole) {
				redirect = '/campus';
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

		user.value = null;

		await clearNuxtData();
		await navigateTo(config.public?.directus?.auth?.redirect?.login || '/auth/login');
	}

	async function fetchUser(params?: object) {
		try {
			// Check if we have a valid session
			const token = await $directus.getToken();
			
			if (!token) {
				user.value = null;
				return;
			}
			
			// Use SDK's readMe with explicit fields - SDK handles session auth via cookies
			const userResponse = await $directus.request(
				readMe({
					fields: ['*', 'role']
				})
			);
			
			console.log('=== FETCH USER DEBUG ===');
			console.log('userResponse:', userResponse);
			console.log('userResponse.role:', userResponse?.role);
			
			user.value = userResponse as User;
			
			// Cache role in localStorage for middleware
			if (process.client && userResponse?.role) {
				const userRoleId = typeof userResponse.role === 'object' 
					? (userResponse.role as any).id 
					: userResponse.role;
				if (userRoleId) {
					localStorage.setItem('user_role_id', userRoleId.toString().trim());
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
