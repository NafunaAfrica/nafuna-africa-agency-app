import { readItems } from '@directus/sdk'
import type { Course, CourseWithRelations } from '~/types/lms'

export interface CourseFilters {
  course_type?: 'animation' | 'technology' | null
  level?: 'beginner' | 'intermediate' | 'advanced' | null
  status?: 'published' | 'draft' | 'archived'
  search?: string
}

export const useCourses = () => {
  const fetchCourses = async (filters: CourseFilters = {}) => {
    const filter: Record<string, any> = {
      status: { _eq: filters.status || 'published' }
    }

    if (filters.course_type) {
      filter.course_type = { _eq: filters.course_type }
    }

    if (filters.level) {
      filter.level = { _eq: filters.level }
    }

    if (filters.search) {
      filter._or = [
        { title: { _icontains: filters.search } },
        { description: { _icontains: filters.search } }
      ]
    }

    return useDirectus(
      readItems('courses', {
        filter,
        sort: ['sort', '-date_created'],
        fields: [
          'id',
          'title',
          'slug',
          'description',
          'thumbnail',
          'featured_image',
          'course_type',
          'level',
          'price',
          'duration_weeks',
          'status',
          {
            instructors: [
              {
                instructor_id: ['id', 'name', 'avatar']
              }
            ],
            modules: ['id', 'name', 'sort', { lessons: ['id'] }]
          }
        ]
      })
    )
  }

  const fetchCourseBySlug = async (slug: string): Promise<CourseWithRelations | null> => {
    const courses = await useDirectus(
      readItems('courses', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: [
          '*',
          {
            instructors: [
              {
                instructor_id: ['id', 'name', 'bio', 'avatar', 'expertise_areas', 'credentials']
              }
            ],
            modules: [
              'id',
              'name',
              'description',
              'sort',
              {
                lessons: [
                  'id',
                  'title',
                  'slug',
                  'video_duration_minutes',
                  'lesson_type',
                  'status',
                  'sort'
                ]
              }
            ]
          }
        ],
        limit: 1
      })
    )

    return courses?.[0] || null
  }

  const getTotalLessons = (course: CourseWithRelations): number => {
    if (!course.modules) return 0
    return course.modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0)
    }, 0)
  }

  const getTotalDuration = (course: CourseWithRelations): number => {
    if (!course.modules) return 0
    return course.modules.reduce((total, module) => {
      if (!module.lessons) return total
      return total + module.lessons.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.video_duration_minutes || 0)
      }, 0)
    }, 0)
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return {
    fetchCourses,
    fetchCourseBySlug,
    getTotalLessons,
    getTotalDuration,
    formatDuration
  }
}
