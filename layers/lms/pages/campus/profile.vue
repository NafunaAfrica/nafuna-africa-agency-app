<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  layout: 'student',
  middleware: 'auth'
})

// SEO
useHead({
  title: 'My Profile - Nafuna Campus',
})

const { user, fetchUser, updateUser } = useDirectusAuth()
const toast = useToast()
const { fileUrl } = useFiles() // Use existng file helper

// Helper for avatar
const getAssetUrl = (id: string) => fileUrl(id)

const loading = ref(false)

// Schema for validation
const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  first_name: user.value?.first_name || '',
  last_name: user.value?.last_name || '',
  title: user.value?.title || '',
  location: user.value?.location || '',
  bio: user.value?.description || '', // Directus uses 'description' for bio usually
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    // updateUser is from useDirectusAuth
    await updateUser({
      first_name: event.data.first_name,
      last_name: event.data.last_name,
      title: event.data.title,
      location: event.data.location,
      description: event.data.bio
    })
    
    // Refresh user data
    await fetchUser()
    
    toast.add({
        title: 'Profile Updated',
        description: 'Your details have been saved successfully.',
        icon: 'i-heroicons-check-circle',
        color: 'green'
    })
  } catch (err: any) {
    toast.add({
        title: 'Error',
        description: err.message || 'Failed to update profile',
        icon: 'i-heroicons-x-circle',
        color: 'red'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <PageContainer class="px-4 sm:px-6 lg:px-8 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <TypographyHeadline content="My <em>Profile</em>" size="lg" />
        <p class="text-gray-500 mt-2">Manage your personal information and student account.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sidebar / Avatar -->
        <div class="md:col-span-1 space-y-6">
           <VCard class="p-6 text-center">
              <UAvatar 
                :src="user?.avatar ? getAssetUrl(user.avatar as string) : undefined" 
                :alt="user?.first_name" 
                size="3xl"
                class="mb-4 mx-auto ring-4 ring-gray-100 dark:ring-gray-800"
              />
              <h3 class="font-bold text-gray-900 dark:text-white">{{ user?.first_name }} {{ user?.last_name }}</h3>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
              <div class="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                Student
              </div>
           </VCard>
        </div>

        <!-- Main Form -->
        <div class="md:col-span-2">
          <VCard class="p-6">
            <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="First Name" name="first_name" required>
                  <UInput v-model="state.first_name" />
                </UFormGroup>

                <UFormGroup label="Last Name" name="last_name" required>
                  <UInput v-model="state.last_name" />
                </UFormGroup>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormGroup label="Job Title / Role" name="title" help="e.g. 3D Animator, Student">
                  <UInput v-model="state.title" icon="i-heroicons-briefcase" />
                </UFormGroup>

                <UFormGroup label="Location" name="location">
                  <UInput v-model="state.location" icon="i-heroicons-map-pin" />
                </UFormGroup>
              </div>

              <UFormGroup label="Bio" name="bio">
                <UTextarea v-model="state.bio" :rows="4" placeholder="Tell us a bit about yourself..." />
              </UFormGroup>

              <div class="flex justify-end pt-4">
                <UButton type="submit" size="lg" :loading="loading" label="Save Changes" color="black" />
              </div>

            </UForm>
          </VCard>
        </div>
      </div>
    </div>
  </PageContainer>
</template>
