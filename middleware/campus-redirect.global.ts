// Campus redirect middleware - redirects campus users away from /portal
export default defineNuxtRouteMiddleware((to) => {
    const { user } = useDirectusAuth();
    const config = useRuntimeConfig();

    const campusRoleId = config.public.campusRoleId;
    if (!campusRoleId) return;

    let userRoleIdStr = '';

    // 1. Try to get role from user state
    if (user.value) {
        const userRoleId = typeof user.value.role === 'object' && user.value.role !== null
            ? (user.value.role as any).id
            : user.value.role;
        userRoleIdStr = String(userRoleId || '').trim();
    }
    // 2. Fallback to localStorage (especially useful during initial navigation after login)
    else if (process.client) {
        userRoleIdStr = String(localStorage.getItem('user_role_id') || '').trim();
    }

    const configRoleIdStr = String(campusRoleId || '').trim();

    // If campus user trying to access /portal, redirect to /campus
    if (configRoleIdStr && userRoleIdStr === configRoleIdStr && to.path.startsWith('/portal')) {
        console.log('[Campus Redirect] Student detected on /portal. Sending to /campus');
        return navigateTo('/campus');
    }
});
