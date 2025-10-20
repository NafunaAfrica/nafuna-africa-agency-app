<script setup lang="ts">
const appConfig = useAppConfig();

const logo = computed(() => {
	return appConfig.globals?.logo_on_dark_bg;
});

const props = defineProps({
	color: {
		type: String,
		default: 'currentColor',
	},
});
</script>

<template>
	<NuxtImg v-if="logo" :src="logo" alt="" />
	<template v-else>
		<svg width="300" height="75" viewBox="0 0 300 75" fill="none" xmlns="http://www.w3.org/2000/svg">
			<!-- Nafuna Africa Logo -->
			<!-- Left circular design with X pattern -->
			<g>
				<circle cx="30" cy="37" r="18" stroke="#FF4500" stroke-width="3.5" fill="none"/>
				<path d="M18 25 L42 49 M42 25 L18 49" stroke="#FF4500" stroke-width="3.5"/>
			</g>
			
			<!-- Second circular design with X pattern -->
			<g>
				<circle cx="67" cy="37" r="18" stroke="#FF4500" stroke-width="3.5" fill="none"/>
				<path d="M55 25 L79 49 M79 25 L55 49" stroke="#FF4500" stroke-width="3.5"/>
			</g>
			<!-- Vertical separator line -->
			<line x1="105" y1="12" x2="105" y2="63" stroke="#FF4500" stroke-width="3"/>
			<!-- Text: nafuna -->
			<text x="120" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="normal" fill="#FF4500">nafuna</text>
			<!-- Text: africa -->
			<text x="120" y="54" font-family="Arial, sans-serif" font-size="21" font-weight="bold" fill="#FF4500">africa</text>
		</svg>
	</template>
</template>

<style>
.accent {
	fill: rgb(var(--color-primary-500));
}
</style>
