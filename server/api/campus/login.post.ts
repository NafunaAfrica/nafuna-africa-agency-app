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

	const directusUrl = process.env.DIRECTUS_URL as string;

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

		// Get user info to check role
		const userResponse = await fetch(`${directusUrl}/users/me`, {
			headers: {
				Authorization: `Bearer ${authResult.access_token}`,
			},
		});
		const userData = await userResponse.json();
		const user = userData.data;

		// Get campus role ID from runtime config
		const config = useRuntimeConfig();
		const campusRoleId = config.public.campusRoleId;

		// Safe role extraction and comparison
		// Handle case where role might be an object (if fields expanded) or just an ID string
		const userRoleId = typeof user.role === 'object' && user.role !== null 
			? (user.role as any).id 
			: user.role;
			
		const configRoleId = String(campusRoleId || '').trim();

		console.log('Login Role Check:', {
			userRoleId,
			configRoleId,
			match: userRoleId === configRoleId
		});

		// Determine redirect based on role
		const redirectTo = userRoleId === configRoleId ? '/student' : '/portal';

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
		};
	} catch (error: any) {
		console.error('Login error:', error);
		throw createError({
			statusCode: 401,
			message: 'Invalid email or password',
		});
	}
});
