import { defineNuxtRouteMiddleware, useRuntimeConfig, navigateTo, useDirectusAuth } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
	const runtimeConfig = useRuntimeConfig();
	const config = runtimeConfig.public.directus;

	if (to.path === config.auth.redirect.login || to.path === config.auth.redirect.callback) {
		const { user } = useDirectusAuth();

		if (user.value) {
			// Check for student role redirect
			const campusRoleId = runtimeConfig.public.campusRoleId;
			
			// Handle case where role might be an object (if fields expanded) or just an ID string
			const userRoleId = typeof user.value.role === 'object' && user.value.role !== null 
				? (user.value.role as any).id 
				: user.value.role;

			// If user is a student, force redirect to student dashboard
			if (campusRoleId && String(userRoleId) === String(campusRoleId)) {
				return navigateTo('/student');
			}

			const returnToPath = to.query.redirect?.toString();
			const redirectTo = returnToPath || config.auth.redirect.home;
			return navigateTo(redirectTo);
		}
	}
});
