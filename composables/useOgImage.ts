import type { SEO } from '~/types';

/**
 * Composable for handling OG image priority logic
 * Priority: SEO og_image → content image → global fallback
 */
export const useOgImage = (
	seo?: SEO | null,
	contentImage?: string | File | null,
	fallbackImage?: string | File | null
) => {
	const { fileUrl } = useFiles();

	return computed(() => {
		// Get base url dynamically based on priority
		let baseId: string | File | null | undefined = undefined;

		if (seo?.og_image) {
			baseId = seo.og_image;
		} else if (contentImage) {
			baseId = contentImage;
		} else if (fallbackImage) {
			baseId = fallbackImage;
		}

		if (!baseId) return undefined;

		const base = fileUrl(baseId as string);
		if (!base) return undefined;

		// Append resizing parameters to ensure image is perfectly sized for Facebook/WhatsApp 
		// and compressed to under 300KB to prevent silent drop of the URL preview.
		const separator = base.includes('?') ? '&' : '?';
		return `${base}${separator}width=1200&height=630&fit=cover&format=jpg&quality=80`;
	});
};
