<template>
	<div
		v-if="shouldShowBanner"
		:style="{ backgroundColor: banner?.background_color || '#10B981', color: banner?.text_color || '#FFFFFF' }"
		class="relative w-full px-4 py-3 text-center transition-all duration-300 ease-in-out"
	>
		<div class="flex items-center justify-center space-x-4 max-w-6xl mx-auto">
			<!-- Main Content -->
			<div class="flex items-center space-x-4 flex-1">
				<!-- Title & Message -->
				<div class="flex items-center space-x-2">
					<span class="font-bold">{{ banner?.title }}</span>
					<span>{{ banner?.message }}</span>
				</div>

				<!-- Countdown Timer -->
				<div v-if="banner?.show_countdown && banner?.countdown_end" class="flex items-center space-x-2">
					<Icon name="material-symbols:timer" class="w-4 h-4" />
					<CountdownTimer :end-date="banner.countdown_end" />
				</div>
			</div>

			<!-- Action Button -->
			<NuxtLink
				v-if="banner?.button_text && banner?.button_url"
				:to="banner.button_url"
				class="inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 hover:opacity-80"
				:style="{ 
					backgroundColor: banner?.text_color || '#FFFFFF', 
					color: banner?.background_color || '#10B981' 
				}"
			>
				{{ banner.button_text }}
			</NuxtLink>

			<!-- Dismiss Button -->
			<button
				v-if="banner?.is_dismissible"
				@click="dismissBanner"
				class="flex-shrink-0 p-1 rounded-md hover:opacity-75 transition-opacity duration-200"
				:aria-label="`Dismiss ${banner?.title} banner`"
			>
				<Icon name="material-symbols:close" class="w-5 h-5" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { PromoBanner } from '~/types/content';

const { data: banner, error } = await useAsyncData(
	'active-promo-banner',
	async () => {
		try {
			// First, let's get ALL items to debug
			const allItems = await useDirectus(
				readItems('promo_banners', {
					limit: 10, // Get all items for debugging
				}),
			);
			
			console.log('DEBUG: All promo banners:', allItems);
			console.log('DEBUG: Number of banners found:', allItems?.length || 0);
			
			// Then filter for published ones
			const publishedItems = await useDirectus(
				readItems('promo_banners', {
					filter: { 
						status: { _eq: 'published' }
					},
					sort: ['-priority'],
					limit: 1,
				}),
			);
			
			console.log('DEBUG: Published banners:', publishedItems);
			
			return publishedItems;
		} catch (err) {
			console.error('DEBUG: Error fetching promo banners:', err);
			return [];
		}
	},
	{
		transform: (data: any[]) => {
			console.log('DEBUG: Transform received:', data);
			return data?.[0] || null;
		},
		default: () => null,
	},
);

// Debug: Log final banner data
console.log('DEBUG: Final banner data:', banner.value);
if (banner.value) {
	console.log('DEBUG: Banner fields:', Object.keys(banner.value));
	console.log('DEBUG: Banner title:', banner.value.title);
	console.log('DEBUG: Banner message:', banner.value.message);
	console.log('DEBUG: Banner countdown_end:', banner.value.countdown_end);
}

// Debug: Log any errors (remove this later)
if (process.dev && error.value) {
	console.error('Promo banner fetch error:', error.value);
}

// Dismissal state management
const isDismissed = ref(false);

const dismissalKey = computed(() => 
	banner.value ? `promo-banner-dismissed-${banner.value.id}` : null
);

const shouldShowBanner = computed(() => {
	if (!banner.value) return false;
	if (isDismissed.value) return false;
	
	// Check if banner was previously dismissed
	if (dismissalKey.value && process.client) {
		const dismissed = localStorage.getItem(dismissalKey.value);
		if (dismissed) return false;
	}
	
	// Check if countdown has expired
	if (banner.value.countdown_end) {
		const now = new Date();
		const end = new Date(banner.value.countdown_end);
		if (now > end) return false;
	}
	
	return true;
});

const dismissBanner = () => {
	if (!banner.value?.is_dismissible || !dismissalKey.value) return;
	
	isDismissed.value = true;
	
	// Store dismissal in localStorage
	if (process.client) {
		localStorage.setItem(dismissalKey.value, 'true');
	}
};

// Check dismissal state on mount
onMounted(() => {
	if (dismissalKey.value && process.client) {
		const dismissed = localStorage.getItem(dismissalKey.value);
		if (dismissed) {
			isDismissed.value = true;
		}
	}
});
</script>
