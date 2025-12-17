<script setup lang="ts">
definePageMeta({
  layout: 'student',
  middleware: ['auth']
})

useHead({
  title: 'Dashboard - Nafuna Campus',
  meta: [{ name: 'description', content: 'Your learning dashboard' }]
})

const { user } = useDirectusAuth()
const { enrollments, allCourses, stats, isLoading, loadStudentData, activeCourses } = useStudentData()

// Load data on mount
onMounted(() => {
  loadStudentData()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ greeting }}, {{ user?.first_name || 'Student' }}! 👋
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Continue your learning journey
        </p>
      </div>
      <NuxtLink 
        to="/student/courses" 
        class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Browse Courses
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Enrolled Courses" :value="stats.totalEnrolled" icon="📚" color="primary" />
        <StatsCard title="In Progress" :value="stats.inProgress" icon="▶️" color="orange" />
        <StatsCard title="Completed" :value="stats.completed" icon="✅" color="green" />
        <StatsCard title="Certificates" :value="stats.certificatesEarned" icon="🏆" color="purple" />
      </div>

      <!-- Continue Learning -->
      <section v-if="activeCourses.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
          <NuxtLink to="/student/my-courses" class="text-primary-600 hover:text-primary-700 text-sm">
            View all →
          </NuxtLink>
        </div>
        <div class="space-y-4">
          <EnrolledCourseCard 
            v-for="enrollment in activeCourses.slice(0, 3)" 
            :key="enrollment.id" 
            :enrollment="enrollment" 
          />
        </div>
      </section>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="text-4xl mb-4">🎓</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Start your learning journey today!</p>
        <NuxtLink 
          to="/student/courses" 
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Browse Courses
        </NuxtLink>
      </div>

      <!-- Recommended Courses -->
      <section v-if="allCourses.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recommended for You</h2>
          <NuxtLink to="/student/courses" class="text-primary-600 hover:text-primary-700 text-sm">
            See all →
          </NuxtLink>
        </div>
        <CourseGrid :courses="allCourses.slice(0, 4)" />
      </section>
    </template>
  </div>
</template>
