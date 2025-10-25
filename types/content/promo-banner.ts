export interface PromoBanner {
	id: string;
	status: 'draft' | 'published' | 'archived';
	title: string;
	message: string;
	background_color: string;
	text_color: string;
	button_text?: string | null;
	button_url?: string | null;
	countdown_end: string | null; // ISO date string from Directus
	is_dismissible: boolean;
	show_countdown: boolean;
	priority: number;
	date_created: string | null;
	date_updated: string | null;
	user_created?: string | null;
	user_updated?: string | null;
}

export interface CountdownTime {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	total: number;
}
