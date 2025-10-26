<script setup lang="ts">
// This creates a specific route at /ai-chat
// It will take precedence over the [...permalink].vue catch-all route

definePageMeta({
  layout: 'default' // or create a custom layout for the chatbot
  // middleware: 'auth' // optional: require authentication (commented out for now)
})

// SEO for the chatbot page
useHead({
  title: 'AI Assistant - Nafuna Africa',
  meta: [
    { name: 'description', content: 'Chat with our AI assistant for instant help and support.' }
  ]
})

// Chatbot state
const messages = ref([
  { role: 'assistant', content: 'Hello! How can I help you today?' }
])
const currentMessage = ref('')
const isLoading = ref(false)

// Send message function
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return
  
  // Add user message
  messages.value.push({ role: 'user', content: currentMessage.value })
  const userMessage = currentMessage.value
  currentMessage.value = ''
  isLoading.value = true
  
  try {
    // Call your AI API endpoint
    const response = await $fetch<{ message: string; timestamp: string }>('/api/ai-chat', {
      method: 'POST',
      body: { message: userMessage, history: messages.value }
    })
    
    messages.value.push({ role: 'assistant', content: response.message })
  } catch (error) {
    messages.value.push({ 
      role: 'assistant', 
      content: 'Sorry, I encountered an error. Please try again.' 
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI Assistant
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Get instant help with your questions about our services
          </p>
        </div>

        <!-- Chat Container -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <!-- Messages Area -->
          <div class="h-96 overflow-y-auto p-6 space-y-4">
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              class="flex"
              :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div 
                class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                :class="message.role === 'user' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'"
              >
                {{ message.content }}
              </div>
            </div>
            
            <!-- Loading indicator -->
            <div v-if="isLoading" class="flex justify-start">
              <div class="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4">
            <form @submit.prevent="sendMessage" class="flex space-x-4">
              <UInput
                v-model="currentMessage"
                placeholder="Type your message..."
                class="flex-1"
                :disabled="isLoading"
              />
              <UButton 
                type="submit" 
                :disabled="isLoading || !currentMessage.trim()"
                color="orange"
              >
                Send
              </UButton>
            </form>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard class="cursor-pointer hover:shadow-md transition-shadow">
            <div class="text-center p-4">
              <h3 class="font-semibold mb-2">Services Info</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Learn about our animation services
              </p>
            </div>
          </UCard>
          
          <UCard class="cursor-pointer hover:shadow-md transition-shadow">
            <div class="text-center p-4">
              <h3 class="font-semibold mb-2">Pricing</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Get pricing information
              </p>
            </div>
          </UCard>
          
          <UCard class="cursor-pointer hover:shadow-md transition-shadow">
            <div class="text-center p-4">
              <h3 class="font-semibold mb-2">Contact</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Speak with our team
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
