export const useStudentData = () => {
  // Mock data for now - replace with actual Directus queries
  const enrolledCourses = ref([
    {
      id: '1',
      title: '2D Animation Fundamentals',
      slug: '2d-animation-fundamentals',
      instructor: 'John Doe',
      thumbnail: '/images/course-1.jpg',
      progress: 65
    },
    {
      id: '2', 
      title: '3D Character Modeling',
      slug: '3d-character-modeling',
      instructor: 'Jane Smith',
      thumbnail: '/images/course-2.jpg',
      progress: 30
    }
  ])

  const progress = ref({
    totalCourses: 5,
    completedCourses: 2,
    currentCourses: 3,
    totalHours: 120,
    completedHours: 48
  })

  return {
    enrolledCourses,
    progress
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
