<script setup lang="ts">
const props = defineProps<{
  modules: any[]
  currentLessonId?: string
  progressList?: any[]
}>()

const emit = defineEmits<{
  selectLesson: [lesson: any]
}>()

const getLessonStatus = (lessonId: string) => {
  const progress = props.progressList?.find(p => p.lesson_id === lessonId)
  return progress?.status || 'not_started'
}

const statusIcons: Record<string, string> = {
  completed: '✓',
  in_progress: '▶',
  not_started: '○'
}

const statusColors: Record<string, string> = {
  completed: 'text-green-500 bg-green-100',
  in_progress: 'text-primary-500 bg-primary-100',
  not_started: 'text-gray-400 bg-gray-100'
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="module in modules" :key="module.id" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div class="bg-gray-50 dark:bg-gray-800 px-4 py-3 font-medium text-gray-900 dark:text-white">
        {{ module.name }}
      </div>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li 
          v-for="lesson in module.lessons" 
          :key="lesson.id"
          @click="emit('selectLesson', lesson)"
          :class="[
            'px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
            currentLessonId === lesson.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
          ]"
        >
          <span :class="[statusColors[getLessonStatus(lesson.id)], 'w-6 h-6 rounded-full flex items-center justify-center text-xs']">
            {{ statusIcons[getLessonStatus(lesson.id)] }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ lesson.title }}</p>
            <p class="text-xs text-gray-500">{{ lesson.video_duration_minutes || 0 }} min</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
