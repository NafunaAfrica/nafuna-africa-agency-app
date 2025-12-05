export const useStudentData = () => {
  const { fetchUserEnrollments, getEnrollmentStats } = useEnrollments()
  const { fetchCourses } = useCourses()

  const enrollments = ref<any[]>([])
  const allCourses = ref<any[]>([])
  const stats = ref({
    totalEnrolled: 0,
    inProgress: 0,
    completed: 0,
    certificatesEarned: 0,
    averageProgress: 0
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadStudentData = async () => {
    isLoading.value = true
    error.value = null
    try {
      const [userEnrollments, courses] = await Promise.all([
        fetchUserEnrollments(),
        fetchCourses({ status: 'published' })
      ])
      enrollments.value = userEnrollments
      allCourses.value = courses
      stats.value = getEnrollmentStats(userEnrollments)
    } catch (e: any) {
      error.value = e.message || 'Failed to load data'
    } finally {
      isLoading.value = false
    }
  }

  const activeCourses = computed(() => enrollments.value.filter(e => e.status === 'active'))
  const completedCourses = computed(() => enrollments.value.filter(e => e.status === 'completed'))

  return {
    enrollments,
    allCourses,
    stats,
    isLoading,
    error,
    loadStudentData,
    activeCourses,
    completedCourses
  }
}

// Utility functions
export const formatTimeAgo = (date: string) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
