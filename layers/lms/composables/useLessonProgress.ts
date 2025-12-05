import { readItems, createItem, updateItem } from '@directus/sdk'
import type { LessonProgress, Lesson } from '~/types/lms'

export const useLessonProgress = () => {
  const { user } = useAuth()

  const fetchLessonProgress = async (enrollmentId: string): Promise<LessonProgress[]> => {
    if (!user.value?.id) return []

    return useDirectus(
      readItems('lesson_progress', {
        filter: {
          enrollment_id: { _eq: enrollmentId },
          user_id: { _eq: user.value.id }
        },
        fields: ['*']
      })
    )
  }

  const getLessonProgressByLesson = async (lessonId: string, enrollmentId: string): Promise<LessonProgress | null> => {
    if (!user.value?.id) return null

    const progress = await useDirectus(
      readItems('lesson_progress', {
        filter: {
          lesson_id: { _eq: lessonId },
          enrollment_id: { _eq: enrollmentId },
          user_id: { _eq: user.value.id }
        },
        limit: 1
      })
    )

    return progress?.[0] || null
  }

  const startLesson = async (lessonId: string, enrollmentId: string): Promise<LessonProgress> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    // Check if progress already exists
    const existing = await getLessonProgressByLesson(lessonId, enrollmentId)
    if (existing) return existing

    return useDirectus(
      createItem('lesson_progress', {
        user_id: user.value.id,
        lesson_id: lessonId,
        enrollment_id: enrollmentId,
        status: 'in_progress',
        watched_percentage: 0,
        time_spent_minutes: 0
      })
    )
  }

  const updateProgress = async (
    progressId: string,
    data: Partial<LessonProgress>
  ): Promise<LessonProgress> => {
    return useDirectus(
      updateItem('lesson_progress', progressId, data)
    )
  }

  const markLessonComplete = async (progressId: string): Promise<LessonProgress> => {
    return updateProgress(progressId, {
      status: 'completed',
      watched_percentage: 100,
      completion_date: new Date().toISOString()
    })
  }

  const updateWatchProgress = async (progressId: string, percentage: number, timeSpent: number): Promise<LessonProgress> => {
    const status = percentage >= 90 ? 'completed' : 'in_progress'
    return updateProgress(progressId, {
      watched_percentage: Math.min(100, Math.round(percentage)),
      time_spent_minutes: timeSpent,
      status,
      ...(status === 'completed' ? { completion_date: new Date().toISOString() } : {})
    })
  }

  const getCompletedLessonsCount = (progressList: LessonProgress[]): number => {
    return progressList.filter(p => p.status === 'completed').length
  }

  const calculateCourseProgress = (progressList: LessonProgress[], totalLessons: number): number => {
    if (totalLessons === 0) return 0
    const completed = getCompletedLessonsCount(progressList)
    return Math.round((completed / totalLessons) * 100)
  }

  const isLessonCompleted = (progressList: LessonProgress[], lessonId: string): boolean => {
    const progress = progressList.find(p => p.lesson_id === lessonId)
    return progress?.status === 'completed'
  }

  const getLessonStatus = (progressList: LessonProgress[], lessonId: string): 'not_started' | 'in_progress' | 'completed' => {
    const progress = progressList.find(p => p.lesson_id === lessonId)
    return progress?.status || 'not_started'
  }

  return {
    fetchLessonProgress,
    getLessonProgressByLesson,
    startLesson,
    updateProgress,
    markLessonComplete,
    updateWatchProgress,
    getCompletedLessonsCount,
    calculateCourseProgress,
    isLessonCompleted,
    getLessonStatus
  }
}
