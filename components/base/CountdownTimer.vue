<template>
	<div v-if="timeRemaining.total > 0" class="flex items-center space-x-1 text-sm font-medium">
		<template v-if="timeRemaining.days > 0">
			<span>{{ timeRemaining.days }}d</span>
		</template>
		<span>{{ String(timeRemaining.hours).padStart(2, '0') }}h</span>
		<span>{{ String(timeRemaining.minutes).padStart(2, '0') }}m</span>
		<span>{{ String(timeRemaining.seconds).padStart(2, '0') }}s</span>
	</div>
	<div v-else class="text-sm font-medium opacity-75">
		Expired
	</div>
</template>

<script setup lang="ts">
import type { CountdownTime } from '~/types/content';

interface Props {
	endDate: string | Date | null;
}

const props = defineProps<Props>();

const timeRemaining = ref<CountdownTime>({
	days: 0,
	hours: 0,
	minutes: 0,
	seconds: 0,
	total: 0,
});

const calculateTimeRemaining = () => {
	if (!props.endDate) {
		timeRemaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
		return;
	}

	const now = new Date().getTime();
	const end = new Date(props.endDate).getTime();
	const total = end - now;

	if (total <= 0) {
		timeRemaining.value = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
		return;
	}

	const days = Math.floor(total / (1000 * 60 * 60 * 24));
	const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((total % (1000 * 60)) / 1000);

	timeRemaining.value = { days, hours, minutes, seconds, total };
};

// Update countdown every second
let interval: NodeJS.Timeout;

onMounted(() => {
	calculateTimeRemaining();
	interval = setInterval(calculateTimeRemaining, 1000);
});

onUnmounted(() => {
	if (interval) {
		clearInterval(interval);
	}
});

// Recalculate when endDate changes
watch(() => props.endDate, calculateTimeRemaining, { immediate: true });
</script>
