import auth from '../middleware/auth';
import common from '../middleware/common';
import guest from '../middleware/guest';

import { addRouteMiddleware, defineNuxtPlugin, useDirectusAuth, useRuntimeConfig, useState, navigateTo } from '#imports';

// Campus redirect middleware - redirects campus users away from /portal
const campusRedirect = (to: any) => {
	const { user } = useDirectusAuth();
	const config = useRuntimeConfig();
	
	if (!user.value) {
		console.log('Campus redirect: No user');
		return;
	}
	
	const campusRoleId = config.public.campusRoleId;
	
	// Extract role ID - handle various formats from Directus
	let userRoleId: string | undefined;
	const role = user.value.role;
	
	console.log('Raw role value:', role, 'type:', typeof role);
	
	if (typeof role === 'string') {
		userRoleId = role;
	} else if (role && typeof role === 'object') {
		// Could be { id: '...' } or nested
		userRoleId = (role as any).id || (role as any).role?.id;
	}
	
	// Log actual string values for debugging
	console.log('Campus redirect check:', 
		'path=' + to.path,
		'campusRoleId=' + campusRoleId,
		'userRoleId=' + userRoleId,
		'match=' + (userRoleId === campusRoleId)
	);
	
	// If campus user trying to access /portal, redirect to /campus
	if (campusRoleId && userRoleId === campusRoleId && to.path.startsWith('/portal')) {
		console.log('Redirecting campus user to /campus');
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

			// Include role field for campus redirect middleware
			await fetchUser({ fields: ['*', 'role'] });
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
