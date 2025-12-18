import auth from '../middleware/auth';
import common from '../middleware/common';
import guest from '../middleware/guest';

import { addRouteMiddleware, defineNuxtPlugin, useDirectusAuth, useRuntimeConfig, useState, navigateTo } from '#imports';

// Campus redirect middleware - redirects campus users away from /portal
const campusRedirect = (to: any) => {
	const { user } = useDirectusAuth();
	const config = useRuntimeConfig();
	
	if (!user.value) return;
	
	const campusRoleId = config.public.campusRoleId;
	const userRoleId = typeof user.value.role === 'object' ? (user.value.role as any).id : user.value.role;
	
	// If campus user trying to access /portal, redirect to /campus
	if (campusRoleId && userRoleId === campusRoleId && to.path.startsWith('/portal')) {
		console.log('Campus user detected on /portal, redirecting to /campus');
		return navigateTo('/campus');
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
