<script setup lang="ts">
const props = defineProps<{
  course: any
  showProgress?: boolean
  progress?: number
}>()

const { fileUrl } = useFiles()

const thumbnailUrl = computed(() => {
  return props.course.thumbnail ? fileUrl(props.course.thumbnail) : '/images/course-placeholder.jpg'
})

const instructorNames = computed(() => {
  if (!props.course.instructors?.length) return 'Unknown'
  return props.course.instructors.map((i: any) => i.instructor_id?.name).filter(Boolean).join(', ')
})

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

const typeColors: Record<string, string> = {
  animation: 'bg-purple-100 text-purple-800',
  technology: 'bg-orange-100 text-orange-800'
}
</script>

<template>
  <NuxtLink 
    :to="`/student/course/${course.slug}`"
    class="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
  >
    <div class="relative aspect-video overflow-hidden">
      <img :src="thumbnailUrl" :alt="course.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      <div class="absolute top-2 left-2 flex gap-2">
        <span :class="[typeColors[course.course_type], 'px-2 py-1 text-xs font-medium rounded-full']">
          {{ course.course_type }}
        </span>
        <span :class="[levelColors[course.level], 'px-2 py-1 text-xs font-medium rounded-full']">
          {{ course.level }}
        </span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
        {{ course.title }}
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ instructorNames }}</p>
      <div class="flex items-center justify-between mt-3 text-sm text-gray-500">
        <span>{{ course.duration_weeks }} weeks</span>
        <span v-if="course.price" class="font-semibold text-primary-600">${{ course.price }}</span>
        <span v-else class="text-green-600 font-medium">Free</span>
      </div>
      <div v-if="showProgress" class="mt-3">
        <div class="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-primary-600 h-2 rounded-full transition-all" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
