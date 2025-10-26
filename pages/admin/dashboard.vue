<script setup lang="ts">
// Admin Dashboard for content management and AI integrations
definePageMeta({
  layout: 'default',
  // middleware: 'admin' // Add admin-only middleware later
})

useHead({
  title: 'Admin Dashboard - Nafuna Africa',
  meta: [
    { name: 'description', content: 'Manage content, AI integrations, and system settings.' }
  ]
})

// Mock admin stats
const adminStats = ref({
  totalPosts: 45,
  totalPages: 12,
  totalUsers: 156,
  aiGeneratedPosts: 8,
  pendingContent: 3
})

// Recent activity
const recentActivity = ref([
  {
    id: '1',
    type: 'post_created',
    description: 'New blog post published: "Animation Trends 2024"',
    user: 'Admin',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'ai_content',
    description: 'AI generated content for "Character Design Tips"',
    user: 'AI Assistant',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
])

// Quick actions
const quickActions = [
  {
    title: 'Create Blog Post',
    description: 'Write a new blog post manually',
    icon: 'i-heroicons-pencil-square',
    action: () => navigateTo('/admin/posts/create'),
    color: 'blue'
  },
  {
    title: 'AI Blog Generator',
    description: 'Generate blog content with AI',
    icon: 'i-heroicons-sparkles',
    action: () => navigateTo('/admin/ai-blog'),
    color: 'purple'
  },
  {
    title: 'Manage Pages',
    description: 'Edit existing pages and content',
    icon: 'i-heroicons-document-duplicate',
    action: () => navigateTo('/admin/pages'),
    color: 'green'
  },
  {
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: 'i-heroicons-users',
    action: () => navigateTo('/admin/users'),
    color: 'orange'
  }
]

const formatTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              Manage your content and AI integrations
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <UBadge color="red" variant="soft">
              {{ adminStats.pendingContent }} Pending
            </UBadge>
            <UButton color="orange" to="/admin/ai-blog">
              <UIcon name="i-heroicons-sparkles" class="mr-2" />
              AI Generator
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-500 mb-1">
              {{ adminStats.totalPosts }}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Blog Posts</p>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500 mb-1">
              {{ adminStats.totalPages }}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Pages</p>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-500 mb-1">
              {{ adminStats.totalUsers }}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Users</p>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-500 mb-1">
              {{ adminStats.aiGeneratedPosts }}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">AI Posts</p>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-500 mb-1">
              {{ adminStats.pendingContent }}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300">Pending</p>
          </div>
        </UCard>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-2">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">Quick Actions</h2>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="action in quickActions"
                :key="action.title"
                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                @click="action.action()"
              >
                <div class="flex items-start space-x-3">
                  <div 
                    class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                    :class="`bg-${action.color}-100 dark:bg-${action.color}-900`"
                  >
                    <UIcon 
                      :name="action.icon" 
                      :class="`text-${action.color}-500 text-lg`"
                    />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
                      {{ action.title }}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      {{ action.description }}
                    </p>
                  </div>
                  <UIcon 
                    name="i-heroicons-arrow-right" 
                    class="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors"
                  />
                </div>
              </div>
            </div>
          </UCard>

          <!-- AI Integration Tools -->
          <UCard class="mt-6">
            <template #header>
              <h2 class="text-xl font-semibold">AI Integration Tools</h2>
            </template>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div class="flex items-center space-x-3">
                  <UIcon name="i-heroicons-sparkles" class="text-purple-500 text-xl" />
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      Content Generator
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Generate blog posts, course descriptions, and marketing copy
                    </p>
                  </div>
                </div>
                <UButton color="purple" variant="outline" to="/admin/ai-blog">
                  Use Tool
                </UButton>
              </div>

              <div class="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="flex items-center space-x-3">
                  <UIcon name="i-heroicons-photo" class="text-blue-500 text-xl" />
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      Image Generator
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Create thumbnails, illustrations, and marketing images
                    </p>
                  </div>
                </div>
                <UButton color="blue" variant="outline" to="/admin/ai-images">
                  Use Tool
                </UButton>
              </div>

              <div class="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="flex items-center space-x-3">
                  <UIcon name="i-heroicons-language" class="text-green-500 text-xl" />
                  <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                      SEO Optimizer
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                      Optimize content for search engines automatically
                    </p>
                  </div>
                </div>
                <UButton color="green" variant="outline" to="/admin/seo-optimizer">
                  Use Tool
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Recent Activity -->
        <div>
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">Recent Activity</h2>
            </template>
            
            <div class="space-y-4">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="flex items-start space-x-3"
              >
                <div 
                  class="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                  :class="activity.type === 'ai_content' ? 'bg-purple-500' : 'bg-blue-500'"
                ></div>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 dark:text-white mb-1">
                    {{ activity.description }}
                  </p>
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ activity.user }}</span>
                    <span>{{ formatTimeAgo(activity.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- System Status -->
          <UCard class="mt-6">
            <template #header>
              <h2 class="text-xl font-semibold">System Status</h2>
            </template>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">Directus CMS</span>
                <UBadge color="green" variant="soft">Online</UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">AI Services</span>
                <UBadge color="green" variant="soft">Active</UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">Email Service</span>
                <UBadge color="green" variant="soft">Running</UBadge>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">Backup Status</span>
                <UBadge color="yellow" variant="soft">Pending</UBadge>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
