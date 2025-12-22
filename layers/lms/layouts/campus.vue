<script setup lang="ts">
// Student-specific layout with LMS navigation
const { user, logout } = useDirectusAuth()
const route = useRoute()

// Student navigation items
const navigation = [
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/campus'
  },
  {
    label: 'My Courses',
    icon: 'i-heroicons-academic-cap',
    to: '/campus/my-courses'
  },
  {
    label: 'Browse Courses',
    icon: 'i-heroicons-magnifying-glass',
    to: '/campus/courses'
  },
  {
    label: 'Certificates',
    icon: 'i-heroicons-trophy',
    to: '/campus/certificates'
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/campus/settings'
  }
]

// Mobile menu state
const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile menu backdrop -->
    <div 
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="isMobileMenuOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- Mobile menu -->
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Logo class="h-8" />
        <UButton 
          variant="ghost" 
          icon="i-heroicons-x-mark"
          @click="isMobileMenuOpen = false"
        />
      </div>
      
      <nav class="mt-5 px-2">
        <div class="space-y-1">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="route.path === item.to 
              ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
            @click="isMobileMenuOpen = false"
          >
            <UIcon :name="item.icon" class="mr-3 text-lg" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Desktop sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <!-- Logo -->
        <div class="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200 dark:border-gray-700">
          <Logo class="h-8" />
          <span class="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            Campus Portal
          </span>
        </div>
        
        <!-- Navigation -->
        <div class="flex-1 flex flex-col overflow-y-auto">
          <nav class="flex-1 px-2 py-4">
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation"
                :key="item.to"
                :to="item.to"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                :class="route.path === item.to 
                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'"
              >
                <UIcon :name="item.icon" class="mr-3 text-lg" />
                {{ item.label }}
              </NuxtLink>
            </div>
          </nav>
          
          <!-- User info -->
          <div class="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <UAvatar 
                  :src="user?.avatar" 
                  :alt="user?.first_name"
                  size="sm"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {{ user?.first_name }} {{ user?.last_name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64 flex flex-col flex-1">
      <!-- Top bar -->
      <div class="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow lg:hidden">
        <UButton
          variant="ghost"
          icon="i-heroicons-bars-3"
          class="px-4 border-r border-gray-200 dark:border-gray-700"
          @click="isMobileMenuOpen = true"
        />
        
        <div class="flex-1 px-4 flex justify-between items-center">
          <Logo class="h-8" />
          
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <UButton variant="ghost" icon="i-heroicons-bell" />
            
            <!-- User menu -->
            <UDropdown :items="[
              [{ label: 'Profile', icon: 'i-heroicons-user', to: '/campus/profile' }],
              [{ label: 'Settings', icon: 'i-heroicons-cog-6-tooth', to: '/campus/settings' }],
              [{ label: 'Sign out', icon: 'i-heroicons-arrow-right-on-rectangle', click: () => logout() }]
            ]">
              <UAvatar 
                :src="user?.avatar" 
                :alt="user?.first_name"
                size="sm"
              />
            </UDropdown>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1 p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
