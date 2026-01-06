<script setup lang="ts">
import type { EnrollmentWithRelations, CourseWithRelations } from '~/types/lms'

// Student Dashboard - separate from commercial client portal
definePageMeta({
  layout: 'student',
  middleware: 'auth'
})

// SEO
useHead({
  title: 'Student Dashboard - Nafuna Africa LMS',
  meta: [
    { name: 'description', content: 'Access your animation courses, track progress, and manage your learning journey.' }
  ]
})

// Auth User
const { user } = useDirectusAuth()
const { loadStudentData, stats, activeCourses, allCourses, isLoading, error } = useStudentData()

// Derived Data
const recentActivity = computed(() => {
  // Derive activity from enrollments
  // Sort by last_accessed
  const recent = [...activeCourses.value].sort((a, b) => {
    return new Date(b.last_accessed || b.enrollment_date || 0).getTime() - new Date(a.last_accessed || a.enrollment_date || 0).getTime()
  })

  return recent.slice(0, 5).map(enrollment => {
    const isNew = new Date(enrollment.enrollment_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const courseTitle = (enrollment.course_id as CourseWithRelations)?.title || 'Unknown Course'
    
    return {
      id: enrollment.id,
      description: isNew 
        ? `Started new course: ${courseTitle}`
        : `Continued learning: ${courseTitle}`,
      created_at: enrollment.last_accessed || enrollment.enrollment_date
    }
  })
})

const recommendedCourses = computed(() => {
  // Filter out courses user is already enrolled in
  if (!allCourses.value || !activeCourses.value) return []
  
  const enrolledIds = new Set(activeCourses.value.map(e => (e.course_id as any)?.id))
  return allCourses.value
    .filter(c => !enrolledIds.has(c.id))
    .slice(0, 2) // Recommendation logic could be smarter in future
})

const upcomingLessons = ref<any[]>([]) // @TODO: Implement Live Sessions logic

// Computed for Template
const displayUser = computed(() => ({
  first_name: user.value?.first_name || 'Student',
  last_name: user.value?.last_name || '',
  avatar: user.value?.avatar
}))

// Load data on mount
onMounted(() => {
  loadStudentData()
})

// Utility functions
const formatTimeAgo = (date: string) => {
  if (!date) return ''
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper to safely get thumbnail
const getCourseThumbnail = (course: any) => {
  // Use directus asset URL or placeholder
  return course?.thumbnail ? `${useRuntimeConfig().public.directusUrl}/assets/${course.thumbnail}` : null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {{ displayUser.first_name }}!
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            Continue your animation learning journey
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <UBadge color="green" variant="soft">
            Student
          </UBadge>
          <UButton color="orange" to="/campus/courses">
            Browse All Courses
          </UButton>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-orange-500" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Progress Overview -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Learning Progress</h2>
          </template>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-500 mb-2">
                {{ stats?.completed || 0 }}
              </div>
              <p class="text-gray-600 dark:text-gray-300">Courses Completed</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-500 mb-2">
                {{ stats?.inProgress || 0 }}
              </div>
              <p class="text-gray-600 dark:text-gray-300">In Progress</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-2">
                {{ stats?.certificatesEarned || 0 }}
              </div>
              <p class="text-gray-600 dark:text-gray-300">Certificates</p>
            </div>
          </div>
        </UCard>

        <!-- Current Courses -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Current Courses</h2>
              <UButton variant="ghost" to="/campus/my-courses">View All</UButton>
            </div>
          </template>
          
          <div v-if="activeCourses && activeCourses.length > 0" class="space-y-4">
            <div 
              v-for="enrollment in activeCourses.slice(0, 3)" 
              :key="enrollment.id"
              class="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              @click="navigateTo(`/campus/course/${(enrollment.course_id as any)?.slug}`)"
            >
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                 <img 
                  v-if="getCourseThumbnail((enrollment.course_id as any))"
                  :src="getCourseThumbnail((enrollment.course_id as any))" 
                  :alt="(enrollment.course_id as any)?.title"
                  class="w-full h-full object-cover"
                >
                <UIcon v-else name="i-heroicons-photo" class="w-8 h-8 m-4 text-gray-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ (enrollment.course_id as any)?.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {{ (enrollment.course_id as any)?.instructors?.[0]?.instructor_id?.name || 'Nafuna Instructor' }}
                </p>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${enrollment.progress_percentage || 0}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ enrollment.progress_percentage || 0 }}% complete
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="text-gray-400" />
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            <p>You haven't enrolled in any courses yet.</p>
            <UButton to="/campus/courses" variant="link" color="orange">Browse Courses</UButton>
          </div>
        </UCard>
        
        <!-- Recommended Courses -->
        <UCard v-if="recommendedCourses.length > 0">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold">Recommended For You</h2>
              <UButton variant="ghost" to="/campus/courses">Browse All</UButton>
            </div>
          </template>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="course in recommendedCourses" 
              :key="course.id"
              class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="navigateTo(`/campus/course/${course.slug}`)"
            >
              <div class="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md mb-3 overflow-hidden">
                <img 
                  v-if="getCourseThumbnail(course)"
                  :src="getCourseThumbnail(course)"
                  :alt="course.title"
                  class="w-full h-full object-cover"
                />
                 <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <UIcon name="i-heroicons-photo" class="w-8 h-8" />
                 </div>
              </div>
              <UBadge size="xs" color="blue" variant="subtle" class="mb-2">{{ course.course_type }}</UBadge>
              <h3 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{{ course.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ (course as any).instructors?.[0]?.instructor_id?.name || 'Nafuna Instructor' }}</p>
            </div>
          </div>
        </UCard>

        <!-- Recent Activity -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Recent Activity</h2>
          </template>
          
          <div v-if="recentActivity.length > 0" class="space-y-3">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div class="flex-1">
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatTimeAgo(activity.created_at) }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            No recent activity.
          </div>
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Upcoming Live Sessions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Upcoming Live Sessions</h3>
          </template>
          
          <div v-if="upcomingLessons.length > 0" class="space-y-4">
            <div 
              v-for="session in upcomingLessons.slice(0, 3)" 
              :key="session.id"
              class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h4 class="font-medium text-sm text-gray-900 dark:text-white mb-1">
                {{ session.title }}
              </h4>
              <p class="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {{ session.instructor }}
              </p>
              <div class="flex items-center justify-between text-xs">
                <span class="text-orange-500">
                  {{ formatDate(session.scheduled_at) }}
                </span>
                <UButton size="xs" variant="outline">
                  Join
                </UButton>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">
            No upcoming sessions scheduled.
          </div>
        </UCard>

        <!-- Quick Actions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Quick Actions</h3>
          </template>
          
          <div class="space-y-3">
            <UButton 
              block 
              variant="outline" 
              to="/campus/assignments"
              class="justify-start"
            >
              <UIcon name="i-heroicons-document-text" class="mr-2" />
              View Assignments
            </UButton>
            
            <UButton 
              block 
              variant="outline" 
              to="/campus/certificates"
              class="justify-start"
            >
              <UIcon name="i-heroicons-academic-cap" class="mr-2" />
              My Certificates
            </UButton>
            
            <UButton 
              block 
              variant="outline" 
              to="/campus/support"
              class="justify-start"
            >
              <UIcon name="i-heroicons-chat-bubble-left-right" class="mr-2" />
              Get Help
            </UButton>
            
            <UButton 
              block 
              variant="outline" 
              to="/ai-chat"
              class="justify-start"
            >
              <UIcon name="i-heroicons-sparkles" class="mr-2" />
              AI Assistant
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
