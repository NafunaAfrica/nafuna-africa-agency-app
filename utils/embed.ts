type UrlTransformation = {
	pattern: RegExp;
	replacement: string;
};

const transformations: UrlTransformation[] = [
	// Video Players
	{
		// Matches various YouTube formats: watch?v=, embed/, youtu.be/, shorts/
		pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11}).*/,
		replacement: 'https://www.youtube.com/embed/$1',
	},
	{
		pattern: /https:\/\/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?|album\/\d+\/video\/|video\/|)(\d+).*/,
		replacement: 'https://player.vimeo.com/video/$1',
	},
	{
		pattern: /https:\/\/www\.loom\.com\/share\/([a-f0-9]+).*/,
		replacement: 'https://www.loom.com/embed/$1',
	},
	// File Services
	{
		pattern: /https:\/\/drive\.google\.com\/file\/d\/(.*?)\/view.*/,
		replacement: 'https://drive.google.com/file/d/$1/preview',
	},
];

export function transformUrlToIframeSrc(url: string): string {
	for (const transformation of transformations) {
		if (transformation.pattern.test(url)) {
			return url.replace(transformation.pattern, transformation.replacement);
		}
	}

	// If no transformation matches, return the original URL.
	return url;
}

// Helper to extract YouTube ID (Shared logic)
export function getYoutubeId(url: string): string | null {
	const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
	return match ? match[1] : null;
}

//Generate the Youtube, Vimeo, or Loom embed URL based on an URL from the user
export function generateVideoEmbed(url: string) {
	// YouTube
	const youtubeId = getYoutubeId(url);
	if (youtubeId) {
		return `https://www.youtube.com/embed/${youtubeId}`;
	}

	// Vimeo
	if (url.includes('vimeo.com')) {
		const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?|album\/\d+\/video\/|video\/|)(\d+)/);
		if (match) return `https://player.vimeo.com/video/${match[1]}`;
	}

	// Loom
	if (url.includes('loom.com')) {
		const match = url.match(/loom\.com\/share\/([a-f0-9]+)/);
		if (match) return `https://www.loom.com/embed/${match[1]}`;
	}

	return url;
}

