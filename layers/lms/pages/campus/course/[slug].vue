<script setup lang="ts">
definePageMeta({
  layout: 'student'
})

const route = useRoute()
const slug = route.params.slug as string

const { fetchCourseBySlug, getTotalLessons, formatDuration, getTotalDuration } = useCourses()
const { fetchEnrollmentByCourse, enrollInCourse } = useEnrollments()
const { fetchLessonProgress, startLesson, getLessonStatus } = useLessonProgress()

const course = ref<any>(null)
const enrollment = ref<any>(null)
const progressList = ref<any[]>([])
const currentLesson = ref<any>(null)
const isLoading = ref(true)
const isEnrolling = ref(false)

// Load course data
const loadData = async () => {
  isLoading.value = true
  try {
    course.value = await fetchCourseBySlug(slug)
    if (course.value) {
      enrollment.value = await fetchEnrollmentByCourse(course.value.id)
      if (enrollment.value) {
        progressList.value = await fetchLessonProgress(enrollment.value.id)
        // Set current lesson
        if (enrollment.value.current_lesson_id) {
          currentLesson.value = findLesson(enrollment.value.current_lesson_id)
        } else {
          currentLesson.value = getFirstLesson()
        }
      }
    }
  } finally {
    isLoading.value = false
  }
}

const findLesson = (lessonId: string) => {
  for (const module of course.value?.modules || []) {
    const lesson = module.lessons?.find((l: any) => l.id === lessonId)
    if (lesson) return lesson
  }
  return null
}

const getFirstLesson = () => {
  const firstModule = course.value?.modules?.[0]
  return firstModule?.lessons?.[0] || null
}

const handleEnroll = async () => {
  if (!course.value) return
  isEnrolling.value = true
  try {
    enrollment.value = await enrollInCourse(course.value.id)
    currentLesson.value = getFirstLesson()
  } finally {
    isEnrolling.value = false
  }
}

const selectLesson = async (lesson: any) => {
  currentLesson.value = lesson
  if (enrollment.value) {
    await startLesson(lesson.id, enrollment.value.id)
    progressList.value = await fetchLessonProgress(enrollment.value.id)
  }
}

useHead({
  title: () => course.value?.title ? `${course.value.title} - Nafuna Campus` : 'Course - Nafuna Campus'
})

onMounted(loadData)
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!course" class="text-center py-12">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Course not found</h2>
      <NuxtLink to="/campus/courses" class="text-primary-600 hover:underline mt-2 inline-block">
        Browse courses
      </NuxtLink>
    </div>

    <!-- Course Content -->
    <div v-else class="space-y-6">
      <!-- Course Header -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
            {{ course.course_type }}
          </span>
          <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            {{ course.level }}
          </span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ course.title }}</h1>
        <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          <span>{{ getTotalLessons(course) }} lessons</span>
          <span>{{ formatDuration(getTotalDuration(course)) }}</span>
          <span>{{ course.duration_weeks }} weeks</span>
        </div>
        
        <!-- Enroll Button -->
        <button
          v-if="!enrollment"
          @click="handleEnroll"
          :disabled="isEnrolling"
          class="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {{ isEnrolling ? 'Enrolling...' : (course.price ? `Enroll - $${course.price}` : 'Enroll for Free') }}
        </button>
      </div>

      <!-- Enrolled View: Video + Lessons -->
      <div v-if="enrollment" class="grid lg:grid-cols-3 gap-6">
        <!-- Video Player -->
        <div class="lg:col-span-2 space-y-4">
          <VideoPlayer 
            v-if="currentLesson"
            :video-url="currentLesson.video_url || ''"
            :title="currentLesson.title"
          />
          <div v-if="currentLesson" class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">{{ currentLesson.title }}</h2>
            <div v-if="currentLesson.content" class="mt-4 prose dark:prose-invert" v-html="currentLesson.content" />
          </div>
        </div>

        <!-- Lesson List -->
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">Course Content</h3>
            <p class="text-sm text-gray-500">{{ enrollment.progress_percentage || 0 }}% complete</p>
          </div>
          <div class="max-h-[600px] overflow-y-auto">
            <LessonList 
              :modules="course.modules || []"
              :current-lesson-id="currentLesson?.id"
              :progress-list="progressList"
              @select-lesson="selectLesson"
            />
          </div>
        </div>
      </div>

      <!-- Not Enrolled: Course Info -->
      <div v-else class="grid lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">About this course</h2>
            <div class="prose dark:prose-invert" v-html="course.description" />
          </div>
        </div>
        <div>
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Course Content</h3>
            <ul class="space-y-2">
              <li v-for="module in course.modules" :key="module.id" class="text-sm text-gray-600 dark:text-gray-400">
                {{ module.name }} ({{ module.lessons?.length || 0 }} lessons)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
