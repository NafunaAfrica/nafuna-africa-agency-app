// LMS Type Definitions

export interface Instructor {
  id: string
  name: string
  bio?: string
  expertise_areas?: string[]
  avatar?: string
  credentials?: string
  status: 'active' | 'inactive'
  date_created?: string
}

export interface Lesson {
  id: string
  title: string
  slug: string
  content?: string
  video_url?: string
  video_duration_minutes?: number
  lesson_type: 'video' | 'article' | 'interactive' | 'assignment'
  status: 'draft' | 'published'
  sort: number
  module_id: string
  date_created?: string
}

export interface Module {
  id: string
  name: string
  description?: string
  sort: number
  course_id: string
  lessons?: Lesson[]
  date_created?: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description?: string
  thumbnail?: string
  featured_image?: string
  course_type: 'animation' | 'technology'
  level: 'beginner' | 'intermediate' | 'advanced'
  price?: number
  duration_weeks?: number
  status: 'draft' | 'published' | 'archived'
  sort?: number
  date_created?: string
  date_updated?: string
}

export interface CourseWithRelations extends Course {
  modules?: Module[]
  instructors?: Array<{
    instructor_id: Instructor
  }>
  enrollments?: Enrollment[]
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'active' | 'completed' | 'dropped' | 'pending_payment'
  progress_percentage: number
  lessons_completed: number
  current_lesson_id?: string
  enrollment_date?: string
  completion_date?: string
  last_accessed?: string
  certificate_issued: boolean
  date_created?: string
}

export interface EnrollmentWithRelations extends Omit<Enrollment, 'course_id' | 'current_lesson_id'> {
  course_id: CourseWithRelations | string
  current_lesson_id?: Lesson | string | null
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  enrollment_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  watched_percentage: number
  quiz_score?: number
  completion_date?: string
  time_spent_minutes: number
  date_created?: string
}

export interface CampusUser {
  id: string
  user_id: string
  bio?: string
  expertise_areas?: string[]
  learning_goals?: string
  portfolio_url?: string
  experience_level?: 'beginner' | 'some_experience' | 'intermediate' | 'advanced' | 'professional'
  referral_source?: 'social_media' | 'search' | 'friend_referral' | 'existing_client' | 'other'
  notifications_enabled: boolean
  date_joined?: string
}

// Dashboard Stats
export interface LearningStats {
  totalEnrolled: number
  inProgress: number
  completed: number
  certificatesEarned: number
  averageProgress: number
  totalHoursLearned?: number
  currentStreak?: number
}
