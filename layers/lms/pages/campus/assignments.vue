<script setup lang="ts">
definePageMeta({
  layout: 'student',
  middleware: 'auth'
})

useHead({
  title: 'My Assignments - Nafuna Campus'
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
      <p class="text-gray-600 dark:text-gray-300 mt-1">
        Your pending and completed assignments will appear here.
      </p>
    </div>

    <!-- Empty State -->
    <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="text-4xl mb-4">📝</div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assignments due</h3>
      <p class="text-gray-500 mb-4">You're all caught up!</p>
      <UButton to="/campus/dashboard" variant="outline">Back to Dashboard</UButton>
    </div>
  </div>
</template>
