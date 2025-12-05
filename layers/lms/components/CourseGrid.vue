<script setup lang="ts">
defineProps<{
  courses: any[]
  showProgress?: boolean
  enrollments?: any[]
}>()

const getProgress = (courseId: string, enrollments: any[]) => {
  const enrollment = enrollments?.find(e => 
    (typeof e.course_id === 'string' ? e.course_id : e.course_id?.id) === courseId
  )
  return enrollment?.progress_percentage || 0
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <CourseCard 
      v-for="course in courses" 
      :key="course.id" 
      :course="course"
      :show-progress="showProgress"
      :progress="getProgress(course.id, enrollments || [])"
    />
  </div>
</template>
