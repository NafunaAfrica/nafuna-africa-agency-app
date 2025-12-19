import auth from '../middleware/auth';
import common from '../middleware/common';
import guest from '../middleware/guest';

import { addRouteMiddleware, defineNuxtPlugin, useDirectusAuth, useRuntimeConfig, useState, navigateTo } from '#imports';

// Campus redirect middleware - redirects campus users away from /portal
const campusRedirect = async (to: any) => {
	// Only check on /portal routes
	if (!to.path.startsWith('/portal')) return;
	
	const config = useRuntimeConfig();
	const campusRoleId = config.public.campusRoleId;
	
	if (!campusRoleId) return;
	
	// Check localStorage for cached role check (use string comparison)
	if (process.client) {
		const cachedRole = localStorage.getItem('user_role_id');
		const campusRoleStr = String(campusRoleId || '').trim();
		const cachedRoleStr = String(cachedRole || '').trim();
		
		console.log('=== CAMPUS REDIRECT CHECK ===');
		console.log('cachedRole:', cachedRoleStr);
		console.log('campusRoleId:', campusRoleStr);
		console.log('match:', cachedRoleStr === campusRoleStr);
		
		if (cachedRoleStr && cachedRoleStr === campusRoleStr) {
			console.log('Campus user detected, redirecting to /campus');
			return navigateTo('/campus');
		}
	}
};

export default defineNuxtPlugin(async () => {
	try {
		const config = useRuntimeConfig().public.directus;

		addRouteMiddleware('common', common, { global: true });

		addRouteMiddleware('auth', auth, {
			global: config.auth.enableGlobalAuthMiddleware,
		});

		addRouteMiddleware('guest', guest);
		
		// Add campus redirect middleware globally
		addRouteMiddleware('campus-redirect', campusRedirect, { global: true });

		const initialized = useState('directus-auth-initialized', () => false);

		const { _loggedIn } = useDirectusAuth();

		if (initialized.value === false) {
			const { fetchUser } = useDirectusAuth();

			// Include role field for campus redirect middleware
			await fetchUser({ fields: ['*', 'role', { contacts: ['*'] }] });
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
