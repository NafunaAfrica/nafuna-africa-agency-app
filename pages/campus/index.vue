<script setup lang="ts">
useHead({
  title: 'Nafuna Campus - Learn Animation & Technology',
  meta: [
    { name: 'description', content: 'Join Nafuna Campus to learn animation, motion graphics, web development, and more from industry experts.' }
  ]
})

const { fetchCourses } = useCourses()

const { data: featuredCourses } = await useAsyncData(
  'featured-courses',
  () => fetchCourses({ status: 'published' })
)
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          Learn Animation & Technology
        </h1>
        <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join Nafuna Campus and master creative skills with hands-on courses taught by industry professionals.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <NuxtLink 
            to="/campus/register" 
            class="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </NuxtLink>
          <NuxtLink 
            to="/campus/courses" 
            class="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Browse Courses
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Why Choose Nafuna Campus?
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="text-4xl mb-4">🎨</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Industry-Led Courses</h3>
            <p class="text-gray-600 dark:text-gray-400">Learn from professionals with real-world experience in animation and technology.</p>
          </div>
          <div class="text-center p-6">
            <div class="text-4xl mb-4">💻</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Hands-On Projects</h3>
            <p class="text-gray-600 dark:text-gray-400">Build a portfolio with practical projects that showcase your skills.</p>
          </div>
          <div class="text-center p-6">
            <div class="text-4xl mb-4">🏆</div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Earn Certificates</h3>
            <p class="text-gray-600 dark:text-gray-400">Get recognized certificates upon completing courses.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses -->
    <section class="py-16 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
          <NuxtLink to="/campus/courses" class="text-primary-600 hover:text-primary-700">
            View all →
          </NuxtLink>
        </div>
        <CourseGrid v-if="featuredCourses?.length" :courses="featuredCourses.slice(0, 4)" />
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4 bg-primary-600 text-white">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
        <p class="text-primary-100 mb-8">Join thousands of students mastering creative and technical skills.</p>
        <NuxtLink 
          to="/campus/register" 
          class="inline-block px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Create Free Account
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
