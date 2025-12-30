# Windsurf Cascade Comprehensive Prompt: Nafuna Campus LMS System

**Project Context:** Building a comprehensive Learning Management System (LMS) for Nafuna Campus within AgencyOS (Nuxt 3 + Directus) with role-based authentication, multi-layer UI design, and specialized registration flows for animation and technology courses.

---

## 🎯 PHASE 1: DIRECTUS DATA STRUCTURE & SETUP

### Task 1: Create Core LMS Collections

Create the following collections in Directus with the specified fields and relationships:

#### 1. **courses** collection
- **Fields:**
  - `id` (UUID, primary key)
  - `title` (string, required)
  - `slug` (string, auto-slugified from title, URL-safe)
  - `description` (rich text/WYSIWYG editor)
  - `thumbnail` (single image file)
  - `featured_image` (single image file)
  - `course_type` (select: "animation" OR "technology")
  - `level` (select: "beginner" | "intermediate" | "advanced")
  - `price` (decimal, nullable - can be free)
  - `duration_weeks` (integer)
  - `status` (select: "draft" | "published" | "archived")
  - `instructor_ids` (many-to-many relationship with instructors)
  - `modules` (one-to-many relationship with modules collection)
  - `enrollment_count` (computed field, count of enrollments)
  - `date_created` (auto)
  - `user_created` (auto)

#### 2. **modules** collection
- **Fields:**
  - `id` (UUID, primary key)
  - `name` (string, required)
  - `course_id` (many-to-one with courses)
  - `description` (text, optional)
  - `order` (integer for sorting)
  - `lessons` (one-to-many with lessons collection)
  - `date_created` (auto)

#### 3. **lessons** collection
- **Fields:**
  - `id` (UUID, primary key)
  - `title` (string, required)
  - `slug` (string, auto-slugified)
  - `module_id` (many-to-one with modules)
  - `order` (integer for sorting)
  - `content` (rich text/WYSIWYG editor)
  - `video_url` (string, supports YouTube/Vimeo/custom URLs)
  - `video_duration_minutes` (integer, optional)
  - `lesson_type` (select: "video" | "article" | "interactive" | "assignment")
  - `attachments` (file collection)
  - `status` (select: "draft" | "published")
  - `date_created` (auto)

#### 4. **instructors** collection
- **Fields:**
  - `id` (UUID, primary key)
  - `name` (string, required)
  - `bio` (rich text/WYSIWYG)
  - `expertise_areas` (tags or multi-select: "animation" | "motion_graphics" | "3d_modeling" | "web_development" | "ui_ux_design" | "video_editing")
  - `avatar` (single image)
  - `credentials` (rich text)
  - `courses` (many-to-many with courses)
  - `date_created` (auto)

#### 5. **enrollments** collection
- **Fields:**
  - `id` (UUID, primary key)
  - `user_id` (many-to-one with directus_users)
  - `course_id` (many-to-one with courses)
  - `status` (select: "active" | "completed" | "dropped" | "pending_payment")
  - `progress_percentage` (integer, 0-100)
  - `lessons_completed` (integer)
  - `current_lesson_id` (many-to-one with lessons, nullable)
  - `enrollment_date` (datetime, auto set to now)
  - `completion_date` (datetime, nullable)
  - `last_accessed` (datetime, auto update)
  - `certificate_issued` (boolean)
  - `date_created` (auto)

#### 6. **lesson_progress** collection (tracking user progress per lesson)
- **Fields:**
  - `id` (UUID, primary key)
  - `user_id` (many-to-one with directus_users)
  - `lesson_id` (many-to-one with lessons)
  - `enrollment_id` (many-to-one with enrollments)
  - `status` (select: "not_started" | "in_progress" | "completed")
  - `watched_percentage` (integer, for video lessons)
  - `quiz_score` (decimal, nullable)
  - `completion_date` (datetime, nullable)
  - `time_spent_minutes` (integer)
  - `date_created` (auto)

#### 7. **campus_users** collection (extends directus_users)
- **Fields:**
  - `id` (UUID, primary key)
  - `user_id` (many-to-one with directus_users, required)
  - `role` (select: "campus_user" - this is the identifier)
  - `bio` (text, optional)
  - `expertise_areas` (tags: "animation" | "motion_graphics" | "3d" | "web_dev" | "ui_ux" | "video_editing")
  - `learning_goals` (text, optional)
  - `portfolio_url` (string, optional)
  - `notification_preferences` (JSON or separate table)
  - `date_joined` (auto)

### Task 2: Update Directus Users & Add Role

In `directus_users` system collection:
- Add a `role` field if not exists (maps to directus_roles)
- Create role: **"campus"** with permissions:
  - ✅ Read courses, modules, lessons (published only)
  - ✅ Read instructors
  - ✅ Create/Read/Update own enrollments
  - ✅ Create/Read/Update own campus_users record
  - ✅ Read/Update own lesson_progress
  - ❌ Cannot delete anything
  - ❌ Cannot modify course structure

---

## 🎯 PHASE 2: USER AUTHENTICATION & ROLE-BASED ROUTING

### Task 1: Extend Nuxt Auth Middleware

Update or create `/middleware/auth.ts`:

```typescript
Key functionality needed:
- On login, detect user role (check directus_users.role)
- If role === "campus":
  - Create/fetch campus_users record
  - Redirect to /campus/dashboard
  - Set layout to campus layout
- Else (client/admin):
  - Redirect to /client/dashboard OR /admin
  - Set layout to client/agency layout
- Store user type in pinia store for global access
```

### Task 2: Nuxt Routes Structure

```
/campus/
  /dashboard (main campus hub)
  /courses (course catalog)
  /course/[slug] (course detail)
  /my-courses (student's enrolled courses)
  /my-courses/[courseSlug]/module/[moduleName]/lesson/[lessonSlug]
  /learning-path (personalized recommendations)
  /profile
  /certificates
  /settings

/client/
  (existing client portal - no changes, maintains current structure)

/auth/
  /register (NEW - campus registration form)
  /login (existing, enhanced to detect role)
  /forgot-password (existing)
```

---

## 🎯 PHASE 3: CAMPUS REGISTRATION FORM DESIGN

### Suggested Registration Fields (Progressive Profiling - 2 Stages)

#### **Stage 1: Account Essentials** (Required - immediate signup)
```
- Email (required, unique)
- Password (required, strength indicator)
- Confirm Password (required)
- First Name (required)
- Last Name (required)
- Phone Number (optional)
```

#### **Stage 2: Learning Profile** (Optional - on first login / onboarding)
```
- Profile Picture / Avatar (image upload)
- Bio / About You (textarea, 250 chars max)
- Expertise Areas (multi-select checkboxes):
  ☐ Animation & Motion Graphics
  ☐ 3D Modeling & Visual Effects
  ☐ Web Development
  ☐ UI/UX Design
  ☐ Video Editing & Production
  ☐ Graphic Design
  ☐ Audio/Music Production
  
- Learning Goals (textarea, 500 chars max)
  "What do you want to achieve in Nafuna Campus?"
  
- Experience Level (select):
  ○ Complete Beginner
  ○ Some Experience
  ○ Intermediate
  ○ Advanced
  ○ Professional
  
- Portfolio URL (text, optional, URL validation)

- How did you hear about Nafuna Campus? (select):
  ○ Social Media
  ○ Search Engine
  ○ Friend/Referral
  ○ Existing Nafuna Client
  ○ Other

- Notifications Preference (checkboxes):
  ☐ Course Updates & New Releases
  ☐ Community Messages
  ☐ Weekly Learning Tips
  ☐ Certification Progress
```

### Form Validation & UX Enhancements

- **Client-side validation:** Real-time feedback for all fields
- **Email verification:** Send verification link (integrate with Directus or send via n8n)
- **Password strength meter:** Visual indicator
- **Mobile-first design:** Stack vertically, optimize for touch
- **Progress indicator:** Show multi-step form progress
- **Save & Continue:** Allow users to complete Stage 2 later
- **CAPTCHA or honeypot field:** Prevent bot signup

---

## 🎯 PHASE 4: CAMPUS DASHBOARD (Multi-Layer Design)

### Design Architecture: Layered UI (similar to Client Portal)

Using **AgencyOS design principles**, structure the campus dashboard in layers:

#### **Layer 1: Hero/Welcome Section**
- Personalized greeting: "Welcome back, [First Name]! 👋"
- Quick stats cards (horizontal scroll on mobile):
  - **In Progress:** X courses
  - **Completed:** X courses
  - **Progress This Week:** X%
  - **Certificates Earned:** X
  
- Call-to-action: "Continue Learning" button → latest in-progress lesson

#### **Layer 2: Active Courses / Learning Path**
- Card-based layout (3 columns on desktop, 1 on mobile)
- Each course card shows:
  - Course thumbnail/featured image
  - Course title
  - Instructor name(s)
  - Progress bar (0-100%)
  - Current module + lesson breadcrumb
  - Time estimate for completion
  - "Resume" button (links to last accessed lesson)

#### **Layer 3: Recommended / Browse Courses**
- Filter section (sticky on scroll):
  - By Type: Animation | Technology | All
  - By Level: Beginner | Intermediate | Advanced | All
  - By Instructor: [dropdown]
  - Free vs Paid toggle
  
- Course grid (same card format as Layer 2)
- Filtering updates grid in real-time (AJAX)

#### **Layer 4: My Learning Stats / Analytics**
- Horizontal scroll cards:
  - **Total Hours Learned**
  - **Lessons Completed**
  - **Avg. Lesson Duration**
  - **Current Streak** (days of learning)
  - **Certificates Earned**
  
- Mini chart: Learning activity last 7 days (simple bar or line chart)

#### **Layer 5: Community / Social Features** (Phase 2)
- Tabs: Discussions | Announcements | Instructors
- Recent posts from course communities
- Direct message shortcut to instructors

#### **Layer 6: Certificates & Achievements**
- Grid of earned certificates (badge-style cards)
- "Download Certificate" button for each
- "Share on LinkedIn" integration

---

## 🎯 PHASE 5: COURSE DETAIL & LESSON VIEW

### Course Detail Page Structure

```
[Desktop Layout - 2 Column]
LEFT SIDEBAR (30%):
  - Course title
  - Instructor(s) with avatars
  - Course type badge (Animation/Technology)
  - Level badge (Beginner/Intermediate/Advanced)
  - Module & Lesson Tree (collapsible):
    - Module 1
      ☐ Lesson 1
      ☑ Lesson 2 (currently viewing)
      ○ Lesson 3
  - Completion bar
  - "Download Resources" button

MAIN CONTENT (70%):
  - Video player (responsive, full width)
  - Below video:
    - Lesson title
    - Lesson description/notes
    - Attachments (downloadable files)
    - "Mark as Complete" checkbox
    - Previous/Next lesson navigation
    - Comments/Q&A section (community)

[Mobile Layout - Single Column]
  - Video player
  - Lesson info
  - Collapsible sidebar (hamburger menu)
```

---

## 🎯 PHASE 6: ANIMATION & TECHNOLOGY COURSE SPECIFICS

### Animation Courses - Unique Features
- **Lesson types:** Video tutorials, motion graphics demonstrations, rendering showcases
- **Interactive elements:** Before/after sliders for animation comparisons
- **Assignments:** Submit project files (.ae, .blend, .fbx for review)
- **Resources:** Download project files, plugins, presets
- **Showcase:** Portfolio pieces from students
- **Instructor demos:** Step-by-step screen recordings

### Technology Courses - Unique Features
- **Code snippets:** Syntax-highlighted code blocks with copy button
- **Interactive code editor:** Integrated code sandbox (optional)
- **Assignments:** Coding challenges with auto-grading (via n8n?)
- **Resources:** GitHub repos, documentation links, API keys
- **Live sessions:** Links to scheduled live coding sessions
- **Quiz modules:** Knowledge checks with immediate feedback
- **Certificate requirements:** Completion + quiz pass (e.g., 80% score)

---

## 🎯 PHASE 7: DESIGN SYSTEM & COLOR PALETTE

### Apply Existing AgencyOS Design System

Use the established design tokens from client portal:
- **Primary color:** Teal/Teal-500 (same as client portal)
- **Accent colors:** Orange, Purple (course type badges)
- **Neutral background:** Cream-50 (light) / Charcoal-700 (dark mode)
- **Typography:** Poppins (headings), Inter (body text)
- **Spacing:** Use existing spacing scale (8px, 16px, 24px, 32px)
- **Shadows:** Consistent with existing design
- **Border radius:** 8px (base), 12px (large components)

### Animation & Motion Principles
- **Transitions:** 200-250ms easing (cubic-bezier)
- **Micro-interactions:** Hover states on buttons/cards
- **Progress animations:** Smooth bar fill on course progress
- **Load animations:** Skeleton screens for content
- **Page transitions:** Fade or slide animations between lessons

---

## 🎯 PHASE 8: TECHNICAL IMPLEMENTATION TASKS

### Nuxt 3 Components to Create

1. **`CampusRegistrationForm.vue`** - Multi-stage registration (Stage 1 + optional Stage 2)
2. **`CampusDashboard.vue`** - Main dashboard with all 6 layers
3. **`CourseCard.vue`** - Reusable course card component
4. **`LessonPlayer.vue`** - Video player with controls, progress tracking
5. **`ModuleLessonTree.vue`** - Collapsible tree of modules/lessons
6. **`ProgressBar.vue`** - Visual progress indicator
7. **`InstructorCard.vue`** - Instructor profile card
8. **`CertificateCard.vue`** - Certificate display/download
9. **`CourseFilter.vue`** - Advanced filter sidebar
10. **`LearningStatsCard.vue`** - Stats display component

### Composables to Create

1. **`useCampusAuth.ts`** - Campus user authentication logic
2. **`useCourses.ts`** - Fetch courses with filtering
3. **`useEnrollments.ts`** - User enrollments & progress
4. **`useLessonProgress.ts`** - Track lesson completion
5. **`useUserRole.ts`** - Determine user role (campus vs client) globally

### API Routes (`/server/api`)

1. **`/auth/register-campus.post.ts`** - Campus user registration
2. **`/courses/index.get.ts`** - Fetch all courses (with filters)
3. **`/courses/[slug].get.ts`** - Fetch single course detail
4. **`/enrollments/index.get.ts`** - Get user's enrollments
5. **`/enrollments.post.ts`** - Enroll in course
6. **`/lesson-progress/[lessonId].post.ts`** - Mark lesson complete
7. **`/certificates/[enrollmentId].get.ts`** - Generate/download certificate

### Database Queries to Optimize

1. **Course listing with progress:** Fetch courses + enrollment status + progress %
2. **Course detail with tree:** Fetch course + all modules + all lessons (nested query)
3. **User dashboard:** Enrollments + progress + stats (single optimized query)

---

## 🎯 PHASE 9: DIRECTUS MCP PROMPTS (Windsurf Cascade)

### Prompt 1: Initialize LMS Database
```
@directus Create all LMS collections as specified:
- courses (with fields: title, slug, description, thumbnail, featured_image, course_type, level, price, duration_weeks, status, instructor_ids, modules)
- modules (with: name, course_id, description, order, lessons)
- lessons (with: title, slug, module_id, order, content, video_url, video_duration_minutes, lesson_type, attachments, status)
- instructors (with: name, bio, expertise_areas, avatar, credentials, courses)
- enrollments (with: user_id, course_id, status, progress_percentage, lessons_completed, current_lesson_id, enrollment_date, completion_date, last_accessed, certificate_issued)
- lesson_progress (with: user_id, lesson_id, enrollment_id, status, watched_percentage, quiz_score, completion_date, time_spent_minutes)
- campus_users (with: user_id, role="campus_user", bio, expertise_areas, learning_goals, portfolio_url, notification_preferences)

Set up all relationships (one-to-many, many-to-many) correctly.
Create "campus" role with appropriate read/write permissions.
```

### Prompt 2: Add Animation Courses
```
@directus Create 3 sample animation courses:
1. "Motion Graphics Fundamentals" - beginner, $49
   - 4 modules with 3 lessons each
   - Content about After Effects basics, animation principles, motion design theory
   
2. "3D Modeling & Animation" - intermediate, $79
   - 5 modules with 4 lessons each
   - Content about Blender, modeling, rigging, rendering
   
3. "Advanced Character Animation" - advanced, $99
   - 6 modules with 5 lessons each
   - Content about character setup, realistic movement, special effects

For each course:
- Add YouTube video URLs to lessons
- Assign 1-2 instructors from sample instructor data
- Mark lessons as published
```

### Prompt 3: Add Technology Courses
```
@directus Create 3 sample technology courses:
1. "Web Development Basics" - beginner, $39
   - 4 modules: HTML/CSS, JavaScript, Responsive Design, Deployment
   - 3 lessons per module
   
2. "Full-Stack JavaScript Development" - intermediate, $69
   - 5 modules: Node.js, Express, Databases, React/Vue, Authentication
   - 4 lessons per module
   
3. "UI/UX Design Principles" - beginner, $49
   - 4 modules: Design Thinking, Wireframing, Prototyping, User Testing
   - 3 lessons per module

Create code snippet examples and interactive project assignments for each.
```

### Prompt 4: Generate Instructors
```
@directus Create 5 sample instructors:
1. Animation Expert - expertise: animation, motion graphics, 3d modeling
2. Motion Graphics Specialist - expertise: motion graphics, video editing, animation
3. Full-Stack Developer - expertise: web development, javascript, databases
4. UI/UX Designer - expertise: ui ux design, web design, prototyping
5. Creative Director - expertise: all (teaches overview courses)

For each:
- Add professional bio
- Upload avatar images
- Assign to relevant courses
```

---

## 🎯 PHASE 10: IMPLEMENTATION ROADMAP

### Week 1: Foundation
- [ ] Create Directus collections (Phase 1)
- [x] Set up Directus users & campus role (Phase 2)
- [ ] Create registration form UI (Phase 3)
- [x] Set up auth middleware for role detection (Phase 2) - **COMPLETED** (See `DEV_NOTES.md` for fix details)

### Week 2: Dashboard & Course Display
- [ ] Build campus dashboard with 6 layers (Phase 4)
- [ ] Create course grid & filtering system (Phase 4)
- [ ] Build course detail page (Phase 5)
- [ ] Build lesson player & navigation (Phase 5)

### Week 3: Progress Tracking & Polish
- [ ] Implement lesson progress tracking (Phase 6)
- [ ] Build certificate generation (Phase 6)
- [ ] Add animations & micro-interactions (Phase 7)
- [ ] Mobile responsiveness testing & optimization

### Week 4: Testing & Launch
- [ ] End-to-end testing (auth flow, enrollment, progress)
- [ ] Performance optimization
- [ ] Integration with n8n for email notifications
- [ ] Launch to beta users

---

## 🎯 WINDSURF CASCADE MASTER PROMPT

### Use this comprehensive prompt in Windsurf Cascade:

```
I'm building a comprehensive Learning Management System (LMS) for Nafuna Campus 
using Nuxt 3 + Directus. This system will serve animation and technology courses 
with role-based authentication, where users register as "campus" users and get 
routed to /campus/dashboard, while clients stay on /client/dashboard.

CURRENT STATE:
- AgencyOS is my Nuxt 3 + Directus base
- I have MCP enabled in Directus and Windsurf
- I'm using an existing design system (Teal primary, Cream/Charcoal neutrals, Poppins/Inter typography)

NEEDED:
1. Directus Collections: Extend database with courses, modules, lessons, instructors, enrollments, lesson_progress, campus_users collections with specified relationships

2. Campus Registration Form: 
   - Stage 1 (required): Email, Password, Name, Phone
   - Stage 2 (optional): Avatar, Bio, Expertise Areas (animation/tech options), Learning Goals, Experience Level, Portfolio URL, Referral source, Notification preferences
   - Mobile-first design, real-time validation, progress indicator

3. Campus Dashboard (Multi-layer Design):
   - Layer 1: Personalized welcome + quick stats
   - Layer 2: Active courses with progress tracking
   - Layer 3: Recommended/browse courses with advanced filters (type, level, instructor)
   - Layer 4: Learning analytics (hours, lessons, streaks, certificates)
   - Layer 5: Community features (phase 2)
   - Layer 6: Certificates & achievements

4. Course Detail & Lesson View:
   - 2-column layout (desktop): module tree sidebar + video player + notes
   - Mobile: collapsible sidebar
   - Lesson progress tracking
   - Next/previous navigation

5. Auth Middleware:
   - Detect user role (campus vs client)
   - Route to correct dashboard
   - Set appropriate permissions

DESIGN CONSTRAINTS:
- Use existing AgencyOS design tokens (colors, typography, spacing, shadows)
- Apply animation principles (200-250ms transitions, smooth progress bars)
- Mobile-first responsive design
- Dark/light mode support

COURSE CONTENT:
- Animation courses: After Effects, 3D modeling, character animation
- Technology courses: Web dev, full-stack JavaScript, UI/UX design
- Each course: multiple modules, modules have lessons, lessons have video URLs + content

Help me build this step-by-step using Directus MCP to manage database changes.
First, let's create the Directus collections, then build the Nuxt components.
```

---

## 📋 NEXT STEPS

1. **Copy this prompt** and paste into Windsurf Cascade
2. **Start with Phase 1** - Let Windsurf create Directus collections via MCP
3. **Verify collections** in Directus admin
4. **Proceed to Phase 2-3** - Auth middleware & registration form
5. **Build dashboard** in phases 4-5
6. **Test and iterate** with sample data

---

## 🔗 REFERENCE RESOURCES

- **Directus Docs:** https://directus.io/docs
- **Nuxt 3 Docs:** https://nuxt.com/docs
- **AgencyOS Template:** Study existing client portal structure for design parity
- **LMS Best Practices:** Mobile-first, adaptive learning paths, microlearning, gamification
- **Design Trends:** Personalization, collaboration, real-time analytics, voice technology

---

**Last Updated:** December 1, 2025
**Created for:** Nafuna Campus LMS Development
**Base:** AgencyOS (Nuxt 3 + Directus)
