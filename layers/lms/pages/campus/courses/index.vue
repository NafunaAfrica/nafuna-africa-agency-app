<script setup lang="ts">
definePageMeta({
  layout: 'campus'
})

useHead({
  title: 'Course Catalog - Nafuna Campus'
})

const { fetchCourses } = useCourses()

const selectedType = ref<string | null>(null)
const selectedLevel = ref<string | null>(null)
const searchQuery = ref('')

const { data: courses, pending } = await useAsyncData(
  'courses-catalog',
  () => fetchCourses({
    course_type: selectedType.value as any,
    level: selectedLevel.value as any,
    search: searchQuery.value || undefined
  }),
  { watch: [selectedType, selectedLevel, searchQuery] }
)

const courseTypes = [
  { value: null, label: 'All Types' },
  { value: 'animation', label: 'Animation' },
  { value: 'technology', label: 'Technology' }
]

const levels = [
  { value: null, label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Course Catalog</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Explore our animation and technology courses</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search courses..."
        class="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <select
        v-model="selectedType"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option v-for="type in courseTypes" :key="type.label" :value="type.value">
          {{ type.label }}
        </option>
      </select>
      <select
        v-model="selectedLevel"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option v-for="level in levels" :key="level.label" :value="level.value">
          {{ level.label }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Courses Grid -->
    <CourseGrid v-else-if="courses?.length" :courses="courses" />

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
      <p class="text-gray-500">Try adjusting your filters</p>
    </div>
  </div>
</template>
