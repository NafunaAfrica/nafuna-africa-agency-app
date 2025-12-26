export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const directusUrl = config.public.directus.rest.baseUrl;
	const serverToken = config.directusServerToken;
	
	// Get user ID from query params
	const query = getQuery(event);
	const userId = query.userId as string;
	
	if (!userId) {
		return { roleId: null, error: 'User ID required' };
	}
	
	if (!serverToken) {
		console.error('DIRECTUS_SERVER_TOKEN not configured');
		return { roleId: null, error: 'Server configuration error' };
	}
	
	try {
		// Use admin token to fetch user's role (bypasses permission restrictions)
		const response = await fetch(`${directusUrl}/users/${userId}?fields=id,role`, {
			headers: {
				'Authorization': `Bearer ${serverToken}`,
				'Content-Type': 'application/json'
			}
		});
		
		if (!response.ok) {
			console.error('Failed to fetch user:', response.status, response.statusText);
			return { roleId: null, error: 'Failed to fetch user' };
		}
		
		const data = await response.json();
		const user = data.data;
		
		// Extract role ID
		let roleId = user?.role;
		if (user?.role && typeof user.role === 'object') {
			roleId = user.role.id;
		}
		
		console.log('=== CHECK ROLE API (Admin) ===');
		console.log('userId:', userId);
		console.log('roleId:', roleId);
		
		return { roleId };
	} catch (error) {
		console.error('Check role error:', error);
		return { roleId: null, error: 'Server error' };
	}
});
