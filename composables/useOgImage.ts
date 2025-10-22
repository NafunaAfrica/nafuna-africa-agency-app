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
		// Priority 1: SEO og_image (highest priority)
		if (seo?.og_image) {
			return fileUrl(seo.og_image);
		}

		// Priority 2: Content-specific image (e.g., post featured image)
		if (contentImage) {
			return fileUrl(contentImage);
		}

		// Priority 3: Global fallback image (lowest priority)
		if (fallbackImage) {
			return fileUrl(fallbackImage);
		}

		return undefined;
	});
};
