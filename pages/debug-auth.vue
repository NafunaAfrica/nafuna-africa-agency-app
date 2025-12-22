<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useDirectusAuth()
const config = useRuntimeConfig()

const debugInfo = computed(() => {
  const userRole = user.value?.role
  const userRoleId = typeof userRole === 'object' && userRole !== null 
    ? (userRole as any).id 
    : userRole
  
  return {
    isLoggedIn: !!user.value,
    userId: user.value?.id,
    email: user.value?.email,
    firstName: user.value?.first_name,
    lastName: user.value?.last_name,
    roleRaw: userRole,
    roleType: typeof userRole,
    roleId: userRoleId,
    campusRoleId: config.public.campusRoleId,
    isCampusUser: userRoleId && config.public.campusRoleId 
      ? String(userRoleId).trim() === String(config.public.campusRoleId).trim()
      : false,
    cachedRoleId: process.client ? localStorage.getItem('user_role_id') : 'N/A (server)',
    fullUserObject: user.value
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Auth Debug Page</h1>
    
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="font-semibold">Is Logged In:</div>
        <div :class="debugInfo.isLoggedIn ? 'text-green-600' : 'text-red-600'">
          {{ debugInfo.isLoggedIn }}
        </div>
        
        <div class="font-semibold">User ID:</div>
        <div>{{ debugInfo.userId || 'N/A' }}</div>
        
        <div class="font-semibold">Email:</div>
        <div>{{ debugInfo.email || 'N/A' }}</div>
        
        <div class="font-semibold">Name:</div>
        <div>{{ debugInfo.firstName }} {{ debugInfo.lastName }}</div>
        
        <div class="font-semibold">Role (raw):</div>
        <div class="font-mono text-sm break-all">{{ JSON.stringify(debugInfo.roleRaw) }}</div>
        
        <div class="font-semibold">Role Type:</div>
        <div>{{ debugInfo.roleType }}</div>
        
        <div class="font-semibold">Role ID (extracted):</div>
        <div class="font-mono">{{ debugInfo.roleId || 'UNDEFINED/NULL' }}</div>
        
        <div class="font-semibold">Campus Role ID (config):</div>
        <div class="font-mono">{{ debugInfo.campusRoleId || 'NOT SET' }}</div>
        
        <div class="font-semibold">Is Campus User:</div>
        <div :class="debugInfo.isCampusUser ? 'text-green-600 font-bold' : 'text-red-600'">
          {{ debugInfo.isCampusUser }}
        </div>
        
        <div class="font-semibold">Cached Role ID (localStorage):</div>
        <div class="font-mono">{{ debugInfo.cachedRoleId || 'NOT SET' }}</div>
      </div>
      
      <div class="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
        <h2 class="font-semibold mb-2">Full User Object:</h2>
        <pre class="bg-gray-200 dark:bg-gray-900 p-4 rounded text-xs overflow-auto max-h-96">{{ JSON.stringify(debugInfo.fullUserObject, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="mt-6 flex gap-4">
      <NuxtLink to="/campus" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
        Go to Campus
      </NuxtLink>
      <NuxtLink to="/portal" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Go to Portal
      </NuxtLink>
      <NuxtLink to="/auth/signin" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
        Sign In Page
      </NuxtLink>
    </div>
  </div>
</template>
