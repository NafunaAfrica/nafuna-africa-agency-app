
export default defineNuxtRouteMiddleware((to) => {
    // 1. Get User State (Don't try to manage it or recover it)
    const { user } = useDirectusAuth();

    // 2. If NO user, we do NOTHING. 
    // The native 'auth' middleware (defined in dashboard pages) will handle the "Not Logged In" case.
    if (!user.value) return;

    // 3. If User EXISTS, we enforce Role Zones
    // At this point, we are confident we have a session.

    // Get Role ID safely (Handle object vs string)
    // The previous code had crashes here, so we use defensive checks.
    const userRole = user.value.role && typeof user.value.role === 'object'
        ? (user.value.role as any).id
        : user.value.role;

    const roleId = String(userRole || '').trim().toLowerCase();

    // Get Config
    const config = useRuntimeConfig();
    const campusRoleId = String(config.public.campusRoleId || '').trim().toLowerCase();

    // Define Zones
    const isCampusZone = to.path.startsWith('/campus');
    const isPortalZone = to.path.startsWith('/portal');
    const isCheckpoint = to.path === '/auth/checkpoint';

    // Log for debugging
    // Log for debugging
    if (process.client) {
        console.log('[Role Guard] Path:', to.path);
        console.log('[Role Guard] User Role Raw:', user.value?.role);
        console.log('[Role Guard] Extracted Role ID:', roleId);
        console.log('[Role Guard] Campus Config ID:', campusRoleId);
        console.log('[Role Guard] Match:', roleId === campusRoleId);
    }

    // 4. LOGIC: Checkpoint Rescue
    // The "Neutral Config" sends users to /auth/checkpoint. We must bounce them out.
    if (isCheckpoint) {
        if (roleId === campusRoleId) {
            return navigateTo('/campus/dashboard');
        } else if (roleId) {
            return navigateTo('/portal');
        }
        // If not logged in, we do nothing (let the page load or auth middleware handle it)
        return;
    }

    // 5. LOGIC: Campus Protection
    // If you are in Campus Zone but NOT a student -> Get out.
    // EXCEPTION: Allow access to login/register pages AND ROOT /campus (Public Directus Page)
    if (isCampusZone) {
        // Special Case: Public Landing Page /campus
        if (to.path === '/campus') {
            // Logged-in Students should go to Dashboard (Convenience)
            if (roleId === campusRoleId) {
                return navigateTo('/campus/dashboard');
            }
            return; // Others (or public) can see the landing page
        }

        // Protected Campus Pages (e.g. /campus/dashboard)
        // If I am NOT a student (e.g. I am a Client), I shouldn't be here.
        if (roleId && roleId !== 'undefined' && roleId !== campusRoleId) {
            // Allow login/register pages explicitly
            if (['/campus/login', '/campus/register'].includes(to.path)) return;

            console.warn('[Role Guard] User tried to access Campus without role. Redirecting to Portal.');
            return navigateTo('/portal');
        }
    }

    // 6. LOGIC: Portal Protection (Reverse)
    // If you are in Portal Zone but ARE a student -> Get out.
    if (isPortalZone) {
        // If I am a Student, I shouldn't be in the Client Portal
        if (roleId === campusRoleId) {
            console.warn('[Role Guard] Student tried to access Portal. Redirecting to Campus Dashboard.');
            return navigateTo('/campus/dashboard');
        }
    }
});
