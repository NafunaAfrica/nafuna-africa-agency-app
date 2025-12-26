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

    // Debug logging to help identify mismatch
    if (process.client) {
        console.log('[Campus Redirect Check]');
        console.log('User Role:', userRoleIdStr || '(empty)');
        console.log('Config Role:', configRoleIdStr || '(empty)');
        console.log('Path:', to.path);
        console.log('Should Redirect?', (userRoleIdStr && userRoleIdStr === configRoleIdStr && to.path.startsWith('/portal')));
    }

    // If campus user trying to access /portal, redirect to /campus
    if (configRoleIdStr && userRoleIdStr === configRoleIdStr && to.path.startsWith('/portal')) {
        console.log('[Campus Redirect] MATCH! Sending to /campus');
        return navigateTo('/campus');
    }
});
