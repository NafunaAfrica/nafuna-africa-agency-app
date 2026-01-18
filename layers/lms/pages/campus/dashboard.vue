<script setup lang="ts">
import type { EnrollmentWithRelations, CourseWithRelations } from '~/types/lms'

// Student Dashboard - separate from commercial client portal
definePageMeta({
  layout: 'student',
  middleware: 'auth'
})

// SEO
useHead({
  title: 'Student Dashboard - Nafuna Africa LMS',
  meta: [
    { name: 'description', content: 'Access your animation courses, track progress, and manage your learning journey.' }
  ]
})

// Auth User
const { user, token } = useDirectusAuth()
const { loadStudentData, stats, activeCourses, allCourses, isLoading, error } = useStudentData()

// Greetings Logic (Mirrors Client Portal)
function useGreetings() {
	type Message = string;

	const messages: Message[] = [
		'Remember, <em>every frame</em> tells a story.',
        'Your creativity is your <em>greatest asset</em>.',
		"The best animations used to be <em>rough sketches</em>. Keep going!",
		'Every keyframe, every tween, every render. <em>It all matters</em>.',
		"Learning isn't just about the destination, it's about <em>enjoying the creative journey</em>.",
		'With every lesson, you <em>grow stronger</em>.',
		"From concept to final render, your skills are <em>leveling up</em>.",
	];

	function getTodaysMessage(): Message {
		const now = new Date();
		const start = new Date(now.getFullYear(), 0, 0);
		const difference = now.getTime() - start.getTime();
		const oneDay = 1000 * 60 * 60 * 24;
		const dayOfYear = Math.floor(difference / oneDay);
		const messageIndex = dayOfYear % messages.length;
		return messages[messageIndex];
	}

    function greetUser() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }

	return {
		getTodaysMessage,
        greetUser
	};
}

const { getTodaysMessage, greetUser } = useGreetings()

// Load data on mount
onMounted(() => {
  loadStudentData()
})

// Helper to safely get thumbnail
const { fileUrl } = useFiles()
</script>

<template>
  <PageContainer class="px-4 sm:px-6 lg:px-8 py-8">
    <!-- Illustration -->
    <img class="w-48 ml-auto mr-0 hidden md:block" src="~/assets/illustrations/tokyo-luminous-table-lamp-on-boxes.svg" alt="Illustration" />
    
    <!-- Welcome Header -->
    <TypographyTitle class="normal-case">
        {{ greetUser() }} {{ user?.first_name ?? 'Student' }},
    </TypographyTitle>
    <TypographyHeadline :content="getTodaysMessage()" size="xl" />
    
    <VDivider class="my-8" />

    <!-- Dashboard Grid -->
    <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
      
      <!-- Left Column: Active Courses Widget -->
      <VCard class="flex flex-col h-full">
         <div class="p-6 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6">
                <TypographyHeadline content="Active Courses" size="sm" />
                <UButton to="/campus/my-courses" variant="ghost" color="gray" size="xs">View All</UButton>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="flex-1 flex justify-center items-center py-12">
                 <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
            </div>

            <!-- List -->
            <div v-else-if="activeCourses && activeCourses.length > 0" class="space-y-4 flex-1">
                 <div 
                  v-for="enrollment in activeCourses.slice(0, 3)" 
                  :key="enrollment.id"
                  class="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                  @click="navigateTo(`/campus/course/${(enrollment.course_id as any)?.slug}`)"
                >
                  <!-- Thumbnail -->
                   <div class="w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                       <img 
                        v-if="(enrollment.course_id as any)?.thumbnail"
                        :src="fileUrl((enrollment.course_id as any)?.thumbnail)" 
                        class="w-full h-full object-cover"
                      >
                   </div>
                   
                   <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {{ (enrollment.course_id as any)?.title }}
                      </h4>
                      <p class="text-xs text-gray-500 truncate mt-0.5">{{ (enrollment.course_id as any)?.instructors?.[0]?.instructor_id?.name || 'Instructor' }}</p>
                      
                      <div class="flex items-center gap-2 mt-2">
                         <UProgress :value="enrollment.progress_percentage || 0" color="primary" size="xs" class="w-full max-w-[100px]" />
                         <span class="text-xs text-gray-500 font-medium">{{ enrollment.progress_percentage || 0 }}%</span>
                      </div>
                   </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex-1 flex flex-col justify-center items-center text-center py-12">
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded-full mb-3">
                   <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-gray-400" />
                </div>
                <p class="text-gray-500 text-sm mb-4">You haven't enrolled in any courses yet.</p>
                <UButton to="/campus/courses" color="black" size="sm">Browse Catalogue</UButton>
            </div>
         </div>
      </VCard>

      <!-- Right Column: Stats & Actions -->
      <div class="space-y-6">
         
         <!-- Stats Row -->
         <div class="grid grid-cols-2 gap-4">
             <VCard class="p-5 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                 <span class="text-3xl font-display font-bold text-primary">{{ stats?.completed || 0 }}</span>
                 <span class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Completed</span>
             </VCard>
             <VCard class="p-5 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors">
                 <span class="text-3xl font-display font-bold text-primary">{{ stats?.certificatesEarned || 0 }}</span>
                 <span class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Certificates</span>
             </VCard>
         </div>

         <!-- Quick Actions / Assignments -->
         <VCard class="flex-1">
             <div class="p-6">
                <TypographyHeadline content="Assignments" size="sm" class="mb-4" />
                
                <div class="text-center py-8 text-gray-400 text-sm">
                     <p>All caught up! No pending assignments.</p>
                     <UButton variant="link" to="/campus/assignments" class="mt-2">View History</UButton>
                </div>
             </div>
         </VCard>

      </div>

    </div>
  </PageContainer>
</template>
