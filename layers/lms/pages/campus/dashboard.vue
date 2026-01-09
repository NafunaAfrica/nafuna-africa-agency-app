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
const { token } = useDirectusAuth()
const getCourseThumbnail = (course: any) => {
  // Use directus asset URL or placeholder
  if (!course?.thumbnail) return null
  const base = `${useRuntimeConfig().public.directusUrl}/assets/${course.thumbnail}`
  return token.value ? `${base}?access_token=${token.value}` : base
}
</script>

<template>
  <PageContainer>
    <!-- Welcome Header (Matching Client Portal) -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <div>
        <TypographyTitle class="normal-case mb-2">
          Welcome back, {{ displayUser.first_name }}
        </TypographyTitle>
        <TypographyHeadline 
          :content="`Ready to continue your <em>${activeCourses.length > 0 ? 'animation journey' : 'learning adventure'}</em>?`" 
          size="lg" 
        />
      </div>
      <div class="flex items-center space-x-3">
        <UButton color="black" variant="solid" size="lg" to="/campus/courses">
          Browse Courses
        </UButton>
      </div>
    </div>

    <VDivider class="my-8" />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content (Left Column) -->
      <div class="lg:col-span-2 space-y-10">
        
        <!-- Current Courses Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-display font-semibold dark:text-white">Active Courses</h3>
            <UButton variant="ghost" to="/campus/my-courses" color="gray">View All</UButton>
          </div>
          
          <div v-if="activeCourses && activeCourses.length > 0" class="grid grid-cols-1 gap-6">
            <div 
              v-for="enrollment in activeCourses.slice(0, 3)" 
              :key="enrollment.id"
              class="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer"
              @click="() => {
                const slug = (enrollment.course_id as any)?.slug
                if (slug) {
                  navigateTo(`/campus/course/${slug}`)
                } else {
                  console.error('Missing slug for course:', enrollment.course_id)
                }
              }"
            >
              <div class="flex gap-5">
                <!-- Thumbnail -->
                <div class="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                   <img 
                    v-if="getCourseThumbnail((enrollment.course_id as any))"
                    :src="getCourseThumbnail((enrollment.course_id as any))" 
                    :alt="(enrollment.course_id as any)?.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <UIcon name="i-heroicons-photo" class="w-8 h-8" />
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0 py-1">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-lg font-bold font-display text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                        {{ (enrollment.course_id as any)?.title }}
                      </h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        {{ (enrollment.course_id as any)?.instructors?.[0]?.instructor_id?.name || 'Nafuna Instructor' }}
                      </p>
                    </div>
                     <!-- Progress Badge -->
                    <div class="hidden md:block"> 
                       <UBadge :color="enrollment.progress_percentage === 100 ? 'green' : 'orange'" variant="subtle" size="sm">
                         {{ enrollment.progress_percentage || 0 }}% Complete
                       </UBadge>
                    </div>
                  </div>

                  <!-- Progress Bar Context -->
                  <div class="mt-4 md:mt-auto">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5 md:hidden">
                        <span>Progress</span>
                        <span>{{ enrollment.progress_percentage || 0 }}%</span>
                    </div>
                    <UProgress 
                      :value="enrollment.progress_percentage || 0" 
                      color="orange" 
                      size="sm" 
                      :ui="{ wrapper: 'bg-gray-100 dark:bg-gray-700' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p class="text-gray-500 mb-4">You haven't started any courses yet.</p>
            <UButton to="/campus/courses" color="primary">Explore Catalogue</UButton>
          </div>
        </section>

        <!-- Stats Overview (Grid) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div class="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20">
              <div class="text-2xl font-bold font-display text-orange-600 dark:text-orange-400">{{ stats?.completed || 0 }}</div>
              <div class="text-xs font-medium text-orange-600/70 dark:text-orange-400/70 uppercase tracking-wider mt-1">Completed</div>
           </div>
           <div class="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
              <div class="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">{{ stats?.inProgress || 0 }}</div>
              <div class="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mt-1">In Progress</div>
           </div>
           <div class="p-4 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20">
              <div class="text-2xl font-bold font-display text-green-600 dark:text-green-400">{{ stats?.certificatesEarned || 0 }}</div>
              <div class="text-xs font-medium text-green-600/70 dark:text-green-400/70 uppercase tracking-wider mt-1">Certificates</div>
           </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div class="text-2xl font-bold font-display text-gray-600 dark:text-gray-400">{{ stats?.averageProgress || 0 }}%</div>
              <div class="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Avg. Score</div>
           </div>
        </div>

      </div>

      <!-- Right Column (Sidebar Widgets) -->
      <div class="space-y-8">
        
        <!-- Recommended Widget -->
        <div v-if="recommendedCourses.length > 0" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
             <h3 class="font-display font-semibold text-gray-900 dark:text-white">Recommended</h3>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div 
              v-for="course in recommendedCourses" 
              :key="course.id"
              class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
              @click="navigateTo(`/campus/course/${course.slug}`)"
            >
              <div class="flex gap-3">
                 <div class="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                    <img 
                      v-if="getCourseThumbnail(course)"
                      :src="getCourseThumbnail(course)"
                      class="w-full h-full object-cover"
                    />
                 </div>
                 <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary">{{ course.title }}</h4>
                    <p class="text-xs text-gray-500">{{ course.course_type }}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Widget -->
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white shadow-lg">
          <h3 class="font-display font-semibold mb-4 text-lg">Quick Actions</h3>
          <div class="space-y-2">
            <NuxtLink to="/campus/assignments" class="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
               <UIcon name="i-heroicons-document-text" class="mr-3 text-orange-400" />
               View Assignments
            </NuxtLink>
            <NuxtLink to="/campus/certificates" class="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
               <UIcon name="i-heroicons-academic-cap" class="mr-3 text-blue-400" />
               My Certificates
            </NuxtLink>
            <NuxtLink to="/ai-chat" class="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors text-sm">
               <UIcon name="i-heroicons-sparkles" class="mr-3 text-purple-400" />
               AI Assistant
            </NuxtLink>
          </div>
        </div>

      </div>
    </div>
  </PageContainer>
</template>
