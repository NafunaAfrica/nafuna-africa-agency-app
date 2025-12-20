export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const directusUrl = config.public.directus.rest.baseUrl;
	
	// Get the access token from cookies
	const cookies = parseCookies(event);
	const accessToken = cookies.directus_token;
	
	if (!accessToken) {
		return { roleId: null, error: 'Not authenticated' };
	}
	
	try {
		// Fetch user from Directus with role field
		const response = await fetch(`${directusUrl}/users/me?fields=id,role`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			}
		});
		
		if (!response.ok) {
			return { roleId: null, error: 'Failed to fetch user' };
		}
		
		const data = await response.json();
		const user = data.data;
		
		// Extract role ID
		let roleId = user?.role;
		if (user?.role && typeof user.role === 'object') {
			roleId = user.role.id;
		}
		
		console.log('=== CHECK ROLE API ===');
		console.log('user:', user);
		console.log('roleId:', roleId);
		
		return { roleId };
	} catch (error) {
		console.error('Check role error:', error);
		return { roleId: null, error: 'Server error' };
	}
});
