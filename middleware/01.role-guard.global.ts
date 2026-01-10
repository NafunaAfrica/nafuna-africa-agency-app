
export default defineNuxtRouteMiddleware((to) => {
    // 1. Read the Role Cookie (Primary) OR LocalStorage (Backup)
    const roleCookie = useCookie('user_role_id');
    let userRole = roleCookie.value ? String(roleCookie.value).trim().toLowerCase() : null;

    // Reliability Patch: If cookie is missing on client, check LocalStorage
    if (!userRole && process.client) {
        // Validate against Token existence
        const { token } = useDirectusAuth();

        if (!token.value) {
            // No Token = No Session. Any stored role is a "Ghost".
            // Do NOT recover it. Clear it to prevent loops.
            const stored = localStorage.getItem('user_role_id');
            if (stored) {
                console.warn('[Role Guard] Found stale role in LocalStorage but no Auth Token. Clearing.');
                localStorage.removeItem('user_role_id');
            }
            userRole = null;
        } else {
            // Token exists, safe to check LocalStorage for role hint
            const storedRole = localStorage.getItem('user_role_id');
            if (storedRole) {
                userRole = String(storedRole).trim().toLowerCase();
                console.log('[Role Guard] Recovered role from LocalStorage (Token Valid):', userRole);
            } else {
                // Fallback: Check Directus User State directly
                const { user } = useDirectusAuth();
                if (user.value && user.value.role) {
                    const roleId = typeof user.value.role === 'object'
                        ? (user.value.role as any).id
                        : user.value.role;
                    userRole = String(roleId).trim().toLowerCase();
                    console.log('[Role Guard] Recovered role from User State:', userRole);

                    // Heal the cookie
                    const roleCookieRef = useCookie('user_role_id');
                    roleCookieRef.value = userRole;
                }
            }
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
            return navigateTo('/campus/dashboard');
        } else if (userRole) {
            return navigateTo('/portal');
        } else {
            // Not logged in? Back to login.
            return navigateTo('/auth/signin');
        }
    }

    // 5. LOGIC: Campus Protection
    // If you are in Campus Zone but NOT a student -> Get out.
    // EXCEPTION: Allow access to login/register pages AND ROOT /campus (Public Directus Page)
    if (isCampusZone && (['/campus/login', '/campus/register'].includes(to.path) || to.path === '/campus')) {
        // Special Case: Public Landing Page /campus
        if (to.path === '/campus') {
            // If logged in as student, redirect to dashboard automatically
            if (userRole === campusRoleId) {
                return navigateTo('/campus/dashboard');
            }
            return; // Otherwise allow public access
        }

        // Allow access to public pages
        return;
    }
    // PROTECTED ZONE: Sub-pages in Campus (e.g. /campus/dashboard, /campus/courses)
    else if (isCampusZone) {
        if (!userRole) {
            // 🚨 SSR LOOP BREAKER
            // If we are on the server, we might rely on LocalStorage which server can't see.
            // Defer the decision to the Client.
            if (process.server) return;

            return navigateTo('/auth/signin'); // Redirect to generic signin as campus login doesn't exist
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
            console.warn('[Role Guard] Student tried to access Portal. Redirecting to Campus Dashboard.');
            return navigateTo('/campus/dashboard');
        }
    }
});
