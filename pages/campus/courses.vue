<script setup lang="ts">
useHead({
  title: 'Courses - Nafuna Campus'
})

const { fetchCourses } = useCourses()

const selectedType = ref<string | null>(null)
const selectedLevel = ref<string | null>(null)

const { data: courses, pending } = await useAsyncData(
  'public-courses',
  () => fetchCourses({
    course_type: selectedType.value as any,
    level: selectedLevel.value as any
  }),
  { watch: [selectedType, selectedLevel] }
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-primary-600 text-white py-12 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-3xl font-bold mb-2">Our Courses</h1>
        <p class="text-primary-100">Explore our animation and technology courses</p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto py-8 px-4">
      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-8">
        <select
          v-model="selectedType"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option v-for="type in courseTypes" :key="type.label" :value="type.value">
            {{ type.label }}
          </option>
        </select>
        <select
          v-model="selectedLevel"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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

      <!-- Courses -->
      <CourseGrid v-else-if="courses?.length" :courses="courses" />

      <!-- Empty -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500">No courses found</p>
      </div>

      <!-- CTA -->
      <div class="mt-12 text-center bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to start learning?</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Create a free account to enroll in courses</p>
        <NuxtLink 
          to="/campus/register" 
          class="inline-block px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Get Started Free
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
