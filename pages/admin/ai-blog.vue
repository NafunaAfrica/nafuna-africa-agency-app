<script setup lang="ts">
// AI Blog Generator for admin
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'AI Blog Generator - Admin',
  meta: [
    { name: 'description', content: 'Generate blog content using AI for your animation agency.' }
  ]
})

// Form state
const formData = ref({
  topic: '',
  tone: 'professional',
  length: 'medium',
  keywords: '',
  includeImages: true,
  category: 'animation'
})

const isGenerating = ref(false)
const generatedContent = ref<{
  title: string
  content: string
  excerpt: string
  seo_title: string
  meta_description: string
  suggested_images: string[]
} | null>(null)
const generationHistory = ref([
  {
    id: '1',
    topic: 'Character Animation Principles',
    status: 'published',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    topic: '3D Modeling Best Practices',
    status: 'draft',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
])

// Options
const toneOptions = [
  { label: 'Professional', value: 'professional' },
  { label: 'Casual', value: 'casual' },
  { label: 'Educational', value: 'educational' },
  { label: 'Inspiring', value: 'inspiring' }
]

const lengthOptions = [
  { label: 'Short (300-500 words)', value: 'short' },
  { label: 'Medium (500-800 words)', value: 'medium' },
  { label: 'Long (800-1200 words)', value: 'long' }
]

const categoryOptions = [
  { label: 'Animation', value: 'animation' },
  { label: '3D Modeling', value: '3d-modeling' },
  { label: 'Character Design', value: 'character-design' },
  { label: 'Industry News', value: 'industry-news' },
  { label: 'Tutorials', value: 'tutorials' }
]

// Generate content
const generateContent = async () => {
  if (!formData.value.topic.trim()) {
    return
  }

  isGenerating.value = true
  
  try {
    const response = await $fetch<{
      title: string
      content: string
      excerpt: string
      seo_title: string
      meta_description: string
      suggested_images: string[]
    }>('/api/admin/generate-blog', {
      method: 'POST',
      body: formData.value
    })
    
    generatedContent.value = response
  } catch (error) {
    console.error('Generation failed:', error)
    // Handle error
  } finally {
    isGenerating.value = false
  }
}

// Publish content
const publishContent = async () => {
  if (!generatedContent.value) return
  
  try {
    await $fetch('/api/admin/publish-blog', {
      method: 'POST',
      body: {
        ...generatedContent.value,
        category: formData.value.category,
        status: 'published'
      }
    })
    
    // Reset form and show success
    generatedContent.value = null
    formData.value.topic = ''
    
    // Refresh history
    // await refreshHistory()
  } catch (error) {
    console.error('Publishing failed:', error)
  }
}

// Save as draft
const saveDraft = async () => {
  if (!generatedContent.value) return
  
  try {
    await $fetch('/api/admin/publish-blog', {
      method: 'POST',
      body: {
        ...generatedContent.value,
        category: formData.value.category,
        status: 'draft'
      }
    })
    
    // Reset and show success
    generatedContent.value = null
    formData.value.topic = ''
  } catch (error) {
    console.error('Saving draft failed:', error)
  }
}

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
              AI Blog Generator
            </h1>
            <p class="text-gray-600 dark:text-gray-300 mt-1">
              Create engaging blog content with artificial intelligence
            </p>
          </div>
          <UButton variant="outline" to="/admin/dashboard">
            <UIcon name="i-heroicons-arrow-left" class="mr-2" />
            Back to Dashboard
          </UButton>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Generation Form -->
        <div class="lg:col-span-2">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">Generate New Content</h2>
            </template>
            
            <form @submit.prevent="generateContent" class="space-y-6">
              <!-- Topic -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Blog Topic *
                </label>
                <UInput
                  v-model="formData.topic"
                  placeholder="e.g., The Future of 3D Animation in Film"
                  required
                  class="w-full"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Be specific for better results
                </p>
              </div>

              <!-- Settings Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Tone -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone
                  </label>
                  <USelect
                    v-model="formData.tone"
                    :options="toneOptions"
                    option-attribute="label"
                    value-attribute="value"
                  />
                </div>

                <!-- Length -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Length
                  </label>
                  <USelect
                    v-model="formData.length"
                    :options="lengthOptions"
                    option-attribute="label"
                    value-attribute="value"
                  />
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <USelect
                    v-model="formData.category"
                    :options="categoryOptions"
                    option-attribute="label"
                    value-attribute="value"
                  />
                </div>

                <!-- Keywords -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (Optional)
                  </label>
                  <UInput
                    v-model="formData.keywords"
                    placeholder="animation, 3D, character design"
                  />
                </div>
              </div>

              <!-- Include Images -->
              <div class="flex items-center space-x-3">
                <UCheckbox v-model="formData.includeImages" />
                <label class="text-sm text-gray-700 dark:text-gray-300">
                  Suggest images for the content
                </label>
              </div>

              <!-- Generate Button -->
              <UButton
                type="submit"
                :loading="isGenerating"
                :disabled="!formData.topic.trim()"
                color="purple"
                size="lg"
                block
              >
                <UIcon name="i-heroicons-sparkles" class="mr-2" />
                {{ isGenerating ? 'Generating...' : 'Generate Content' }}
              </UButton>
            </form>
          </UCard>

          <!-- Generated Content Preview -->
          <UCard v-if="generatedContent" class="mt-6">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold">Generated Content</h2>
                <div class="flex space-x-2">
                  <UButton variant="outline" @click="saveDraft">
                    Save Draft
                  </UButton>
                  <UButton color="green" @click="publishContent">
                    Publish Now
                  </UButton>
                </div>
              </div>
            </template>
            
            <div class="space-y-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <UInput v-model="generatedContent.title" class="w-full" />
              </div>

              <!-- Excerpt -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt
                </label>
                <UTextarea v-model="generatedContent.excerpt" rows="3" />
              </div>

              <!-- Content -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <UTextarea v-model="generatedContent.content" rows="15" />
              </div>

              <!-- SEO Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO Title
                  </label>
                  <UInput v-model="generatedContent.seo_title" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <UInput v-model="generatedContent.meta_description" />
                </div>
              </div>

              <!-- Suggested Images -->
              <div v-if="generatedContent.suggested_images?.length">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suggested Images
                </label>
                <div class="space-y-2">
                  <div 
                    v-for="(image, index) in generatedContent.suggested_images" 
                    :key="index"
                    class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                  >
                    {{ image }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Generation History -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Recent Generations</h3>
            </template>
            
            <div class="space-y-3">
              <div 
                v-for="item in generationHistory" 
                :key="item.id"
                class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <h4 class="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  {{ item.topic }}
                </h4>
                <div class="flex items-center justify-between text-xs">
                  <UBadge 
                    :color="item.status === 'published' ? 'green' : 'yellow'"
                    variant="soft"
                  >
                    {{ item.status }}
                  </UBadge>
                  <span class="text-gray-500">
                    {{ formatTimeAgo(item.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Tips -->
          <UCard class="mt-6">
            <template #header>
              <h3 class="text-lg font-semibold">Tips for Better Results</h3>
            </template>
            
            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-start space-x-2">
                <UIcon name="i-heroicons-light-bulb" class="text-yellow-500 mt-0.5" />
                <p>Be specific with your topic for more targeted content</p>
              </div>
              <div class="flex items-start space-x-2">
                <UIcon name="i-heroicons-hashtag" class="text-blue-500 mt-0.5" />
                <p>Include relevant keywords to improve SEO</p>
              </div>
              <div class="flex items-start space-x-2">
                <UIcon name="i-heroicons-pencil" class="text-green-500 mt-0.5" />
                <p>Always review and edit generated content before publishing</p>
              </div>
              <div class="flex items-start space-x-2">
                <UIcon name="i-heroicons-photo" class="text-purple-500 mt-0.5" />
                <p>Use suggested images as inspiration for visuals</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
