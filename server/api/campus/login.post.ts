import { createDirectus, rest, authentication, login as directusLogin } from '@directus/sdk';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { email, password } = body;

	if (!email || !password) {
		throw createError({
			statusCode: 400,
			message: 'Email and password are required',
		});
	}

	const config = useRuntimeConfig();
	const directusUrl = config.public.directus.rest.baseUrl;

	if (!directusUrl) {
		throw createError({
			statusCode: 500,
			message: 'Server configuration error: Missing Directus URL',
		});
	}

	try {
		// Create a fresh client for login
		const client = createDirectus(directusUrl)
			.with(rest())
			.with(authentication());

		// Login and get tokens
		const authResult = await client.login(email, password);

		if (!authResult.access_token) {
			throw new Error('No access token returned from Directus');
		}

		console.log('Login tokens received:', {
			hasAccessToken: !!authResult.access_token,
			hasRefreshToken: !!authResult.refresh_token,
			expires: authResult.expires
		});

		// Get user info to check role (Explicitly ask for role!)
		const userResponse = await fetch(`${directusUrl}/users/me?fields=*,role`, {
			headers: {
				Authorization: `Bearer ${authResult.access_token}`,
			},
		});
		const userData = await userResponse.json();
		const user = userData.data;

		// Get campus role ID from runtime config
		// Note: config is already defined above, reuse it
		const campusRoleId = config.public.campusRoleId;

		// Safe role extraction and comparison
		// Handle case where role might be an object (if fields expanded) or just an ID string
		// Note: Detailed logging moved below

		console.log('=== SERVER LOGIN ROLE CHECK ===');
		console.log('User Role Raw:', user.role);
		console.log('User Role Type:', typeof user.role);
		console.log('Campus Role Raw (Config):', campusRoleId);

		const userRoleId = typeof user.role === 'object' && user.role !== null
			? (user.role as any).id
			: user.role;

		const userRoleIdStr = String(userRoleId || '').trim().toLowerCase();
		const configRoleIdStr = String(campusRoleId || '').trim().toLowerCase();

		console.log('User Role ID (Calculated):', userRoleIdStr);
		console.log('Config Role ID (Calculated):', configRoleIdStr);
		console.log('Match Result:', userRoleIdStr === configRoleIdStr);

		// Determine redirect based on role
		let redirectTo = '/portal';
		if (userRoleIdStr && configRoleIdStr && userRoleIdStr === configRoleIdStr) {
			console.log('MATCH FOUND: Sending to /campus/dashboard');
			redirectTo = '/campus/dashboard';
		} else {
			console.log('NO MATCH: Defaulting to /portal');
		}

		// Set cookie for instant middleware access (HttpOnly: false so client middleware can read it)
		setCookie(event, 'user_role_id', userRoleIdStr, {
			httpOnly: false,
			secure: false, // FORCE FALSE for Localhost debugging
			maxAge: 60 * 60 * 24 * 7, // 1 week
			path: '/'
		});

		console.log('Final redirectTo:', redirectTo);

		return {
			success: true,
			access_token: authResult.access_token,
			refresh_token: authResult.refresh_token,
			expires: authResult.expires,
			redirectTo,
			user: {
				id: user.id,
				email: user.email,
				first_name: user.first_name,
				last_name: user.last_name,
				role: user.role,
			},
			debug: {
				userRoleId: userRoleIdStr,
				requiredRole: configRoleIdStr,
				isMatch: userRoleIdStr === configRoleIdStr
			}
		};
	} catch (error: any) {
		console.error('Login error:', error);
		throw createError({
			statusCode: 401,
			message: 'Invalid email or password',
		});
	}
});
