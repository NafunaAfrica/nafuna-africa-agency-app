import auth from '../middleware/auth';
import common from '../middleware/common';
import guest from '../middleware/guest';

import { addRouteMiddleware, defineNuxtPlugin, useDirectusAuth, useRuntimeConfig, useState, navigateTo } from '#imports';

// Campus redirect middleware - redirects campus users away from /portal
const campusRedirect = async (to: any) => {
	// Logic has been moved to middleware/campus-redirect.global.ts for consistency
	return;
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
		const runtimeConfig = useRuntimeConfig();

		const { _loggedIn, user } = useDirectusAuth();

		if (initialized.value === false) {
			const { fetchUser } = useDirectusAuth();

			// fetchUser now handles role caching internally
			await fetchUser();
		}

		initialized.value = true;

		console.log('=== AUTH PLUGIN DEBUG ===');
		console.log('user.value:', user.value);
		console.log('user.value?.role:', user.value?.role);

		if (user.value) {
			_loggedIn.set(true);

			// Check if campus user is on /portal and redirect
			if (process.client) {
				const userRole = user.value.role;
				const userRoleId = typeof userRole === 'object' && userRole !== null
					? (userRole as any).id
					: userRole;

				const campusRoleId = runtimeConfig.public.campusRoleId;

				if (campusRoleId && userRoleId &&
					String(userRoleId).trim() === String(campusRoleId).trim()) {
					const currentPath = window.location.pathname;
					if (currentPath.startsWith('/portal')) {
						console.log('Campus user on /portal, redirecting to /campus');
						window.location.href = '/campus';
					}
				}
			}
		} else {
			_loggedIn.set(false);
		}
	} catch (err: any) {
		// console.error(e)
	}
});
