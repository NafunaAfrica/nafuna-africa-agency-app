import { defineNuxtRouteMiddleware, useRuntimeConfig, navigateTo, useDirectusAuth } from '#imports';

export default defineNuxtRouteMiddleware((to) => {
	const runtimeConfig = useRuntimeConfig();
	const config = runtimeConfig.public.directus;

	if (to.path === config.auth.redirect.login || to.path === config.auth.redirect.callback) {
		return;
	}

	const { user } = useDirectusAuth();

	if (user.value) {
		// Check for campus role redirect
		const campusRoleId = runtimeConfig.public.campusRoleId;
		const userRoleId = typeof user.value.role === 'object' && user.value.role !== null 
			? (user.value.role as any).id 
			: user.value.role;

		// Campus users go to /campus, everyone else to /portal
		if (campusRoleId && String(userRoleId) === String(campusRoleId)) {
			return navigateTo('/campus');
		}
		
		return navigateTo(config.auth.redirect.home);
	}
});
