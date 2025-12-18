<script setup lang="ts">
const props = defineProps<{
  enrollment: any
}>()

const { fileUrl } = useFiles()

const course = computed(() => {
  return typeof props.enrollment.course_id === 'object' ? props.enrollment.course_id : null
})

const thumbnailUrl = computed(() => {
  return course.value?.thumbnail ? fileUrl(course.value.thumbnail) : '/images/course-placeholder.jpg'
})

const instructorNames = computed(() => {
  if (!course.value?.instructors?.length) return 'Unknown'
  return course.value.instructors.map((i: any) => i.instructor_id?.name).filter(Boolean).join(', ')
})

const currentLesson = computed(() => {
  return typeof props.enrollment.current_lesson_id === 'object' ? props.enrollment.current_lesson_id : null
})
</script>

<template>
  <NuxtLink 
    :to="`/campus/course/${course?.slug}`"
    class="group flex bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-200 dark:border-gray-700"
  >
    <div class="w-48 flex-shrink-0">
      <img :src="thumbnailUrl" :alt="course?.title" class="w-full h-full object-cover" />
    </div>
    <div class="flex-1 p-4 flex flex-col">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
          {{ course?.title }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">{{ instructorNames }}</p>
        <p v-if="currentLesson" class="text-xs text-gray-400 mt-2">
          Continue: {{ currentLesson.title }}
        </p>
      </div>
      <div class="mt-3">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-gray-500">{{ enrollment.lessons_completed }} lessons completed</span>
          <span class="font-medium">{{ enrollment.progress_percentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-primary-600 h-2 rounded-full transition-all" 
            :style="{ width: `${enrollment.progress_percentage}%` }"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
