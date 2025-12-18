import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();

	if (!config.public.directus.rest.baseUrl) {
		throw new Error('Missing `runtimeConfig.apiURL` configuration.');
	}

	const target = joinURL(config.public.directus.rest.baseUrl, event.path.replace(/^\/api\/proxy\//, ''));

	let cookieDomainRewrite;
	try {
		cookieDomainRewrite = new URL(config.public.siteUrl).hostname;
	} catch (e) {
		// Fallback or ignore if siteUrl is invalid
		cookieDomainRewrite = undefined;
	}

	return proxyRequest(event, target, {
		cookieDomainRewrite,
		cookiePathRewrite: '/',
		headers: {
			Authorization: event.node.req.headers.authorization || '',
		},
	});
});
