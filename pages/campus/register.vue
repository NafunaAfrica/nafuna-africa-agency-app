<script setup lang="ts">
useHead({
  title: 'Register - Nafuna Campus'
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const step = ref(1)

// Form data
const form = reactive({
  // Step 1: Account
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  // Step 2: Profile
  experience_level: 'beginner',
  expertise_areas: [] as string[],
  learning_goals: '',
  referral_source: '',
  notifications_enabled: true
})

const expertiseOptions = [
  'Animation & Motion Graphics',
  '3D Modeling & Visual Effects',
  'Web Development',
  'UI/UX Design',
  'Video Editing & Production',
  'Graphic Design',
  'Audio/Music Production'
]

const experienceLevels = [
  { value: 'beginner', label: 'Complete Beginner' },
  { value: 'some_experience', label: 'Some Experience' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' }
]

const referralSources = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'search', label: 'Search Engine' },
  { value: 'friend_referral', label: 'Friend/Referral' },
  { value: 'existing_client', label: 'Existing Nafuna Client' },
  { value: 'other', label: 'Other' }
]

const validateStep1 = () => {
  if (!form.first_name || !form.last_name || !form.email || !form.password) {
    error.value = 'Please fill in all required fields'
    return false
  }
  if (form.password !== form.confirm_password) {
    error.value = 'Passwords do not match'
    return false
  }
  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return false
  }
  error.value = null
  return true
}

const nextStep = () => {
  if (validateStep1()) {
    step.value = 2
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  error.value = null

  try {
    // Call server API to create user (requires admin token)
    const response = await $fetch('/api/campus/register', {
      method: 'POST',
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        experience_level: form.experience_level,
        expertise_areas: form.expertise_areas,
        learning_goals: form.learning_goals,
        referral_source: form.referral_source,
        notifications_enabled: form.notifications_enabled
      }
    })

    if ((response as any).success) {
      // Login via server API to get role-based redirect
      const loginResponse = await $fetch('/api/campus/login', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password
        }
      }) as any

      if (loginResponse.success) {
        // Store tokens in cookies for Directus auth
        // Use the expires value from response (ms) or default to 15 mins
        const maxAge = loginResponse.expires ? Math.floor(loginResponse.expires / 1000) : 900
        console.log('Registration login success, setting cookies:', {
           maxAge,
           path: '/'
        })

        const accessToken = useCookie('directus_token', {
           maxAge,
           path: '/'
        })
        
        const refreshToken = useCookie('directus_refresh_token', {
           maxAge: 604800, // 7 days
           path: '/'
        })

        accessToken.value = loginResponse.access_token
        refreshToken.value = loginResponse.refresh_token
        
        // Redirect based on role
        await navigateTo(loginResponse.redirectTo, { external: true })
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || e.message || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const toggleExpertise = (area: string) => {
  const index = form.expertise_areas.indexOf(area)
  if (index === -1) {
    form.expertise_areas.push(area)
  } else {
    form.expertise_areas.splice(index, 1)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Join Nafuna Campus</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Create your free account</p>
      </div>

      <!-- Progress -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600']">1</div>
        <div class="w-16 h-1 bg-gray-200"><div :class="['h-full bg-primary-600 transition-all', step >= 2 ? 'w-full' : 'w-0']"></div></div>
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600']">2</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <!-- Error -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Step 1: Account -->
        <form v-if="step === 1" @submit.prevent="nextStep" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <input v-model="form.first_name" type="text" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <input v-model="form.last_name" type="text" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
            <input v-model="form.password" type="password" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password *</label>
            <input v-model="form.confirm_password" type="password" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <button type="submit" class="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            Continue
          </button>
        </form>

        <!-- Step 2: Profile -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level</label>
            <select v-model="form.experience_level" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option v-for="level in experienceLevels" :key="level.value" :value="level.value">{{ level.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Areas of Interest</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="area in expertiseOptions"
                :key="area"
                type="button"
                @click="toggleExpertise(area)"
                :class="[
                  'px-3 py-1 text-sm rounded-full border transition-colors',
                  form.expertise_areas.includes(area)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                ]"
              >
                {{ area }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Goals</label>
            <textarea v-model="form.learning_goals" rows="3" placeholder="What do you want to achieve?" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How did you hear about us?</label>
            <select v-model="form.referral_source" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Select...</option>
              <option v-for="source in referralSources" :key="source.value" :value="source.value">{{ source.label }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.notifications_enabled" type="checkbox" id="notifications" class="rounded" />
            <label for="notifications" class="text-sm text-gray-700 dark:text-gray-300">Send me course updates and tips</label>
          </div>
          <div class="flex gap-3">
            <button type="button" @click="step = 1" class="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Back
            </button>
            <button type="submit" :disabled="isLoading" class="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {{ isLoading ? 'Creating...' : 'Create Account' }}
            </button>
          </div>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?
          <NuxtLink to="/auth/signin" class="text-primary-600 hover:underline">Sign in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
