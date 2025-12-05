import { directusServer, createUser, createItem } from '~/server/utils/directus-server';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	const {
		first_name,
		last_name,
		email,
		password,
		experience_level,
		expertise_areas,
		learning_goals,
		referral_source,
		notifications_enabled,
	} = body;

	// Validate required fields
	if (!first_name || !last_name || !email || !password) {
		throw createError({
			statusCode: 400,
			message: 'Missing required fields: first_name, last_name, email, password',
		});
	}

	// Get campus role ID from environment
	const campusRoleId = process.env.NUXT_PUBLIC_CAMPUS_ROLE_ID;

	if (!campusRoleId) {
		throw createError({
			statusCode: 500,
			message: 'Campus role not configured. Please contact support.',
		});
	}

	try {
		// Create user with campus role using admin token
		const newUser = await directusServer.request(
			createUser({
				first_name,
				last_name,
				email,
				password,
				role: campusRoleId,
			})
		);

		// Create campus_users profile
		if (newUser?.id) {
			await directusServer.request(
				createItem('campus_users' as any, {
					user_id: newUser.id,
					experience_level: experience_level || 'beginner',
					expertise_areas: expertise_areas || [],
					learning_goals: learning_goals || '',
					referral_source: referral_source || '',
					notifications_enabled: notifications_enabled ?? true,
				})
			);
		}

		return {
			success: true,
			message: 'Account created successfully',
			userId: newUser?.id,
		};
	} catch (error: any) {
		console.error('Registration error:', error);

		// Handle specific Directus errors
		if (error?.errors?.[0]?.message?.includes('unique')) {
			throw createError({
				statusCode: 409,
				message: 'An account with this email already exists',
			});
		}

		throw createError({
			statusCode: 500,
			message: error?.errors?.[0]?.message || 'Registration failed. Please try again.',
		});
	}
});
