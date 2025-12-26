// Middleware to redirect campus users away from client portal to campus dashboard
export default defineNuxtRouteMiddleware((to) => {
    const { user } = useDirectusAuth();
    const config = useRuntimeConfig();

    if (!user.value) return;

    const campusRoleId = config.public.campusRoleId;

    // Role can be a string ID or an object with an ID
    const userRoleId = typeof user.value.role === 'object' && user.value.role !== null
        ? (user.value.role as any).id
        : user.value.role;

    // Critical: Convert to string and trim for reliable comparison
    const userRoleIdStr = String(userRoleId || '').trim();
    const configRoleIdStr = String(campusRoleId || '').trim();

    // console.log('[Campus Middleware] Checking redirect:', { to: to.path, userRoleIdStr, configRoleIdStr });

    // If campus user trying to access /portal, redirect to /campus
    if (configRoleIdStr && userRoleIdStr === configRoleIdStr && to.path.startsWith('/portal')) {
        console.log('[Campus Middleware] Redirecting student to /campus');
        return navigateTo('/campus');
    }
});
