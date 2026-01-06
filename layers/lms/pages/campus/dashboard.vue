<script setup lang="ts">
// Student Dashboard - separate from commercial client portal
definePageMeta({
  layout: 'student'
})

// SEO
useHead({
  title: 'Student Dashboard - Nafuna Africa LMS',
  meta: [
    { name: 'description', content: 'Access your animation courses, track progress, and manage your learning journey.' }
  ]
})

// Mock user data (replace with actual auth system)
const user = ref({
  first_name: 'Student',
  last_name: 'User',
  avatar: null
})

// Mock dashboard data (replace with actual API calls)
const studentStats = ref({
  level: 'Intermediate',
  coursesCompleted: 3,
  hoursLearned: 45,
  certificatesEarned: 2,
  recentAchievement: {
    title: 'Animation Master',
    description: 'Completed advanced 2D animation course'
  }
})

const enrolledCourses = ref([
  {
    id: '1',
    title: '2D Animation Fundamentals',
    slug: '2d-animation-fundamentals',
    instructor: 'John Doe',
    thumbnail: '/images/course-1.jpg', // Ensure these exist or use placeholders
    progress: 65
  },
  {
    id: '2', 
    title: '3D Character Modeling',
    slug: '3d-character-modeling',
    instructor: 'Jane Smith',
    thumbnail: '/images/course-2.jpg',
    progress: 30
  }
])

const recommendedCourses = ref([
  {
    id: '3',
    title: 'Motion Graphics Mastery',
    slug: 'motion-graphics-mastery',
    instructor: 'Sarah Connor',
    thumbnail: '/images/course-3.jpg',
    category: 'VFX'
  },
  {
    id: '4',
    title: 'Storyboarding for Film',
    slug: 'storyboarding-film',
    instructor: 'Mike Ross',
    thumbnail: '/images/course-4.jpg',
    category: 'Pre-production'
  }
])

const recentActivity = ref([
  {
    id: '1',
    description: 'Completed lesson: Character Design Basics',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    description: 'Started new course: Advanced Animation',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  }
])

const upcomingLessons = ref([
  {
    id: '1',
    title: 'Live Q&A Session',
    instructor: 'John Doe',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }
])

// Utility functions
const formatTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Dashboard Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {{ user?.first_name }}!
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mt-1">
            Continue your animation learning journey
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <UBadge color="green" variant="soft">
            {{ studentStats?.level || 'Beginner' }}
          </UBadge>
          <UButton color="orange" to="/campus/courses">
            Browse All Courses
          </UButton>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                {{ studentStats?.coursesCompleted || 0 }}
              </div>
              <p class="text-gray-600 dark:text-gray-300">Courses Completed</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-500 mb-2">
                {{ studentStats?.hoursLearned || 0 }}h
              </div>
              <p class="text-gray-600 dark:text-gray-300">Hours Learned</p>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-500 mb-2">
                {{ studentStats?.certificatesEarned || 0 }}
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
          
          <div class="space-y-4">
            <div 
              v-for="course in enrolledCourses?.slice(0, 3)" 
              :key="course.id"
              class="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              @click="navigateTo(`/campus/course/${course.slug}`)"
            >
              <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                 <img 
                  v-if="course.thumbnail"
                  :src="course.thumbnail" 
                  :alt="course.title"
                  class="w-full h-full object-cover"
                >
                <UIcon v-else name="i-heroicons-photo" class="w-8 h-8 m-4 text-gray-400" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ course.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {{ course.instructor }}
                </p>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${course.progress}%` }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  {{ course.progress }}% complete
                </p>
              </div>
              <UIcon name="i-heroicons-chevron-right" class="text-gray-400" />
            </div>
          </div>
        </UCard>
        
        <!-- Recommended Courses -->
        <UCard>
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
                  v-if="course.thumbnail"
                  :src="course.thumbnail"
                  :alt="course.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <UBadge size="xs" color="blue" variant="subtle" class="mb-2">{{ course.category }}</UBadge>
              <h3 class="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">{{ course.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ course.instructor }}</p>
            </div>
          </div>
        </UCard>

        <!-- Recent Activity -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Recent Activity</h2>
          </template>
          
          <div class="space-y-3">
            <div 
              v-for="activity in recentActivity?.slice(0, 5)" 
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
        </UCard>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Upcoming Live Sessions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Upcoming Live Sessions</h3>
          </template>
          
          <div class="space-y-4">
            <div 
              v-for="session in upcomingLessons?.slice(0, 3)" 
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

        <!-- Achievement Badge -->
        <UCard v-if="studentStats?.recentAchievement">
          <template #header>
            <h3 class="text-lg font-semibold">Latest Achievement</h3>
          </template>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <UIcon name="i-heroicons-trophy" class="text-yellow-500 text-2xl" />
            </div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-1">
              {{ studentStats.recentAchievement.title }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ studentStats.recentAchievement.description }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
