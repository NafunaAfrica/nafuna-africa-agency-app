<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon?: string
  color?: 'primary' | 'green' | 'orange' | 'purple'
}>()

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-4">
      <div :class="[colorClasses[color || 'primary'], 'w-12 h-12 rounded-lg flex items-center justify-center']">
        <span class="text-xl">{{ icon || '📊' }}</span>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
      </div>
    </div>
  </div>
</template>
