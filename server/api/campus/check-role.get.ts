export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const directusUrl = config.public.directus.rest.baseUrl;
	
	// Get the access token from cookies - Directus stores auth in 'directus-auth' as JSON
	const cookies = parseCookies(event);
	let accessToken = null;
	
	try {
		const directusAuth = cookies['directus-auth'];
		if (directusAuth) {
			const authData = JSON.parse(directusAuth);
			accessToken = authData?.access_token;
		}
	} catch (e) {
		console.error('Failed to parse directus-auth cookie:', e);
	}
	
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
