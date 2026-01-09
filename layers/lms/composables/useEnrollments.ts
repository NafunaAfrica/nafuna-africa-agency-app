import { readItems, createItem, updateItem } from '@directus/sdk'
import type { Enrollment, EnrollmentWithRelations } from '~/types/lms'

export const useEnrollments = () => {
  const { user } = useDirectusAuth()

  const fetchUserEnrollments = async (): Promise<EnrollmentWithRelations[]> => {
    if (!user.value?.id) return []

    return useDirectus(
      readItems('enrollments', {
        filter: {
          user_id: { _eq: user.value.id }
        },
        sort: ['-last_accessed', '-enrollment_date'],
        fields: [
          'id',
          'status',
          'progress_percentage',
          'lessons_completed',
          'enrollment_date',
          'last_accessed',
          'certificate_issued',
          {
            course_id: [
              'id',
              'title',
              'slug',
              'thumbnail',
              'course_type',
              'level',
              'duration_weeks',
              {
                instructors: [{ instructor_id: ['id', 'name', 'avatar'] }],
                modules: ['id', { lessons: ['id'] }]
              }
            ],
            current_lesson_id: ['id', 'title', 'slug', { module_id: ['id', 'name'] }]
          }
        ]
      })
    )
  }

  const fetchEnrollmentByCourse = async (courseId: string): Promise<Enrollment | null> => {
    if (!user.value?.id) return null

    const enrollments = await useDirectus(
      readItems('enrollments', {
        filter: {
          user_id: { _eq: user.value.id },
          course_id: { _eq: courseId }
        },
        fields: ['*'],
        limit: 1
      })
    )

    return enrollments?.[0] || null
  }

  const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    return useDirectus(
      createItem('enrollments', {
        user_id: user.value.id,
        course_id: courseId,
        status: 'active',
        progress_percentage: 0,
        lessons_completed: 0,
        enrollment_date: new Date().toISOString()
      })
    )
  }

  const updateEnrollmentProgress = async (
    enrollmentId: string,
    data: Partial<Enrollment>
  ): Promise<Enrollment> => {
    return useDirectus(
      updateItem('enrollments', enrollmentId, {
        ...data,
        last_accessed: new Date().toISOString()
      })
    )
  }

  const getActiveEnrollments = (enrollments: EnrollmentWithRelations[]): EnrollmentWithRelations[] => {
    return enrollments.filter(e => e.status === 'active')
  }

  const getCompletedEnrollments = (enrollments: EnrollmentWithRelations[]): EnrollmentWithRelations[] => {
    return enrollments.filter(e => e.status === 'completed')
  }

  const getEnrollmentStats = (enrollments: EnrollmentWithRelations[]) => {
    const active = getActiveEnrollments(enrollments)
    const completed = getCompletedEnrollments(enrollments)

    const totalProgress = active.reduce((sum, e) => sum + (e.progress_percentage || 0), 0)
    const avgProgress = active.length > 0 ? Math.round(totalProgress / active.length) : 0

    return {
      totalEnrolled: enrollments.length,
      inProgress: active.length,
      completed: completed.length,
      certificatesEarned: enrollments.filter(e => e.certificate_issued).length,
      averageProgress: avgProgress
    }
  }

  return {
    fetchUserEnrollments,
    fetchEnrollmentByCourse,
    enrollInCourse,
    updateEnrollmentProgress,
    getActiveEnrollments,
    getCompletedEnrollments,
    getEnrollmentStats
  }
}
