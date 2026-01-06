<script setup lang="ts">
definePageMeta({
  layout: 'student',
  middleware: 'auth'
})

useHead({
  title: 'My Courses - Nafuna Campus'
})

const { enrollments, isLoading, loadStudentData, activeCourses, completedCourses } = useStudentData()

const activeTab = ref<'active' | 'completed'>('active')

onMounted(() => {
  loadStudentData()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Track your learning progress</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700">
      <button
        @click="activeTab = 'active'"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'active' 
            ? 'border-primary-600 text-primary-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        In Progress ({{ activeCourses.length }})
      </button>
      <button
        @click="activeTab = 'completed'"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'completed' 
            ? 'border-primary-600 text-primary-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        Completed ({{ completedCourses.length }})
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Active Courses -->
    <div v-else-if="activeTab === 'active'">
      <div v-if="activeCourses.length" class="space-y-4">
        <EnrolledCourseCard 
          v-for="enrollment in activeCourses" 
          :key="enrollment.id" 
          :enrollment="enrollment" 
        />
      </div>
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <div class="text-4xl mb-4">📚</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No active courses</h3>
        <p class="text-gray-500 mb-4">Start learning something new!</p>
        <NuxtLink to="/campus/courses" class="text-primary-600 hover:underline">
          Browse courses
        </NuxtLink>
      </div>
    </div>

    <!-- Completed Courses -->
    <div v-else>
      <div v-if="completedCourses.length" class="space-y-4">
        <EnrolledCourseCard 
          v-for="enrollment in completedCourses" 
          :key="enrollment.id" 
          :enrollment="enrollment" 
        />
      </div>
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <div class="text-4xl mb-4">🎯</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No completed courses yet</h3>
        <p class="text-gray-500">Keep learning to complete your first course!</p>
      </div>
    </div>
  </div>
</template>
