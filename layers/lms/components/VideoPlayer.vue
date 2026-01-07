<script setup lang="ts">
import { getYoutubeId } from '~~/utils/embed';

const props = defineProps<{
  videoUrl: string
  title?: string
}>()

const emit = defineEmits<{
  progress: [percentage: number]
  complete: []
}>()

// Extract YouTube video ID
const youtubeId = computed(() => {
  if (!props.videoUrl) return null
  return getYoutubeId(props.videoUrl)
})

const embedUrl = computed(() => {
  if (youtubeId.value) {
    return `https://www.youtube.com/embed/${youtubeId.value}?enablejsapi=1`
  }
  return props.videoUrl
})

const isYoutube = computed(() => !!youtubeId.value)
</script>

<template>
  <div class="relative w-full bg-black rounded-lg overflow-hidden" style="padding-bottom: 56.25%;">
    <iframe
      v-if="isYoutube"
      :src="embedUrl"
      :title="title"
      class="absolute top-0 left-0 w-full h-full"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
    <video
      v-else-if="videoUrl"
      :src="videoUrl"
      class="absolute top-0 left-0 w-full h-full"
      controls
      @timeupdate="(e: Event) => {
        const video = e.target as HTMLVideoElement
        const pct = (video.currentTime / video.duration) * 100
        emit('progress', pct)
        if (pct >= 90) emit('complete')
      }"
    />
    <div v-else class="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-400">
      <span>No video available</span>
    </div>
  </div>
</template>
