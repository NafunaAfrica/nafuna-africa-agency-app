
export default defineNuxtRouteMiddleware((to) => {
    // 1. Read the Role Cookie (Primary) OR LocalStorage (Backup)
    const roleCookie = useCookie('user_role_id');
    let userRole = roleCookie.value ? String(roleCookie.value).trim().toLowerCase() : null;

    // Reliability Patch: If cookie is missing on client, check LocalStorage
    if (!userRole && process.client) {
        const storedRole = localStorage.getItem('user_role_id');
        if (storedRole) {
            userRole = String(storedRole).trim().toLowerCase();
            console.log('[Role Guard] Recovered role from LocalStorage:', userRole);
        }
    }

    // 2. Get Config for Comparison
    const config = useRuntimeConfig();
    const campusRoleId = String(config.public.campusRoleId || '').trim().toLowerCase();

    // 3. Define Zones
    // @TODO: Add 'game' here in future
    const isCampusZone = to.path.startsWith('/campus');
    const isPortalZone = to.path.startsWith('/portal');
    const isCheckpoint = to.path === '/auth/checkpoint';

    // Log for debugging (remove in production if noisy)
    if (process.client) {
        console.log('[Role Guard] Path:', to.path, '| Role:', userRole);
    }

    // 4. LOGIC: Checkpoint Rescue
    // The "Neutral Config" sends users to /auth/checkpoint. We must bounce them out.
    if (isCheckpoint) {
        if (userRole === campusRoleId) {
            return navigateTo('/campus');
        } else if (userRole) {
            return navigateTo('/portal');
        } else {
            // Not logged in? Back to login.
            return navigateTo('/auth/signin');
        }
    }

    // 5. LOGIC: Campus Protection
    // If you are in Campus Zone but NOT a student -> Get out.
    // EXCEPTION: Allow access to login/register pages
    if (isCampusZone && ['/campus/login', '/campus/register'].includes(to.path)) {
        // CONVENIENCE: If already logged in as student, go to dashboard
        if (userRole === campusRoleId) {
            console.log('[Role Guard] User already logged in. Redirecting to Dashboard.');
            return navigateTo('/campus');
        }
    }
    // PROTECTED ZONE: Everything else in Campus
    else if (isCampusZone) {
        if (!userRole) {
            // 🚨 SSR LOOP BREAKER
            // If we are on the server, we might rely on LocalStorage which server can't see.
            // Defer the decision to the Client.
            if (process.server) return;

            return navigateTo('/campus/login'); // Redirect to dedicated campus login instead of generic signin
        }
        if (userRole !== campusRoleId) {
            console.warn('[Role Guard] User tried to access Campus without role. Redirecting to Portal.');
            return navigateTo('/portal');
        }
    }

    // 6. LOGIC: Portal Protection (Reverse)
    // If you are in Portal Zone but ARE a student -> Get out.
    if (isPortalZone) {
        if (!userRole) return navigateTo('/auth/signin');
        if (userRole === campusRoleId) {
            console.warn('[Role Guard] Student tried to access Portal. Redirecting to Campus.');
            return navigateTo('/campus');
        }
    }
});
