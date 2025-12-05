# 🚀 MASTER WINDSURF CASCADE PROMPT - Copy & Paste Ready

**Usage:** Copy the entire prompt below and paste it into Windsurf Cascade AI chat on the right side. This will guide Windsurf to help you build the Nafuna Campus LMS step by step using Directus MCP.

---

```
🎓 NAFUNA CAMPUS LMS PROJECT BRIEFING

I'm building a comprehensive Learning Management System (LMS) for Nafuna Campus 
within my existing AgencyOS application (Nuxt 3 + Directus). The goal is to enable 
students to take animation and technology courses with a campus-specific user role 
and dashboard experience.

═══════════════════════════════════════════════════════════════════════════════

PROJECT ARCHITECTURE:

Technology Stack:
- Frontend: Nuxt 3 (SSR) with Nuxt UI components
- Backend: Directus (headless CMS + API + MCP server)
- Database: Directus-managed (PostgreSQL)
- Authentication: Directus built-in auth with JWT
- Design System: AgencyOS (existing - Teal/Cream/Charcoal, Poppins/Inter fonts)

Current State:
✅ AgencyOS base (Nuxt 3 + Directus) working
✅ Client portal & agency dashboard functional
✅ Directus MCP server enabled
✅ Windsurf + MCP connected and working
✅ Design system in place

Needed:
❌ LMS collections (courses, modules, lessons, instructors, enrollments, etc.)
❌ Campus user role and registration system
❌ Campus dashboard with multi-layer design
❌ Course listing, filtering, and detail pages
❌ Lesson player with progress tracking
❌ Auth middleware for role-based routing

═══════════════════════════════════════════════════════════════════════════════

PHASE 1: DIRECTUS LMS DATABASE STRUCTURE

Using Directus MCP, create these collections with exact fields and relationships:

COLLECTION 1: courses
Fields:
- id (UUID, primary key)
- title (string, required) - e.g., "Motion Graphics Fundamentals"
- slug (string, auto-slugified, URL-safe) - e.g., "motion-graphics-fundamentals"
- description (rich text/WYSIWYG) - course overview
- thumbnail (single image) - for course card (400x300px)
- featured_image (single image) - for course header (1200x400px)
- course_type (select: "animation" | "technology") - badge color varies
- level (select: "beginner" | "intermediate" | "advanced") - difficulty level
- price (decimal, nullable) - can be free (0) or paid ($49, $79, etc.)
- duration_weeks (integer) - estimated duration
- status (select: "draft" | "published" | "archived") - publication status
- instructor_ids (many-to-many with instructors collection) - can have 1+ instructors
- modules (one-to-many with modules collection) - course structure
- enrollment_count (display as count of enrollments, not stored)
- date_created (auto)
- date_updated (auto)
- user_created (auto)

COLLECTION 2: modules
Fields:
- id (UUID, primary key)
- name (string, required) - e.g., "Animation Fundamentals"
- course_id (many-to-one with courses, required) - parent course
- description (text, optional) - brief module description
- order (integer) - sort order within course (1, 2, 3...)
- lessons (one-to-many with lessons collection) - module structure
- date_created (auto)

COLLECTION 3: lessons
Fields:
- id (UUID, primary key)
- title (string, required) - e.g., "Squash & Stretch Principles"
- slug (string, auto-slugified, URL-safe) - for pretty URLs
- module_id (many-to-one with modules, required) - parent module
- order (integer) - sort order within module
- content (rich text/WYSIWYG) - lesson notes, transcript, supplementary text
- video_url (string) - YouTube/Vimeo/custom URL (e.g., https://youtu.be/dQw4w9WgXcQ)
- video_duration_minutes (integer, optional) - for display next to video
- lesson_type (select: "video" | "article" | "interactive" | "assignment") - content type
- attachments (file collection, optional) - downloadable resources
- status (select: "draft" | "published") - only show published to students
- date_created (auto)

COLLECTION 4: instructors
Fields:
- id (UUID, primary key)
- name (string, required) - e.g., "Alex Motion"
- bio (rich text/WYSIWYG) - professional bio
- expertise_areas (tags, multi-select):
  ☐ Animation & Motion Graphics
  ☐ 3D Modeling & Visual Effects
  ☐ Web Development
  ☐ UI/UX Design
  ☐ Video Editing & Production
  ☐ Graphic Design
  ☐ Audio/Music Production
- avatar (single image) - profile picture (200x200px circle)
- credentials (rich text, optional) - certifications, experience
- courses (many-to-many with courses) - courses taught
- date_created (auto)

COLLECTION 5: enrollments
Fields:
- id (UUID, primary key)
- user_id (many-to-one with directus_users, required) - student
- course_id (many-to-one with courses, required) - enrolled course
- status (select: "active" | "completed" | "dropped" | "pending_payment")
- progress_percentage (integer, 0-100) - calculated from lesson_progress
- lessons_completed (integer) - count of completed lessons in course
- current_lesson_id (many-to-one with lessons, nullable) - bookmark
- enrollment_date (datetime, default now()) - when enrolled
- completion_date (datetime, nullable) - when finished
- last_accessed (datetime, auto-update) - tracks last view
- certificate_issued (boolean, default false) - certificate earned?
- date_created (auto)

COLLECTION 6: lesson_progress
Fields:
- id (UUID, primary key)
- user_id (many-to-one with directus_users, required) - student
- lesson_id (many-to-one with lessons, required) - lesson viewed
- enrollment_id (many-to-one with enrollments, required) - which course
- status (select: "not_started" | "in_progress" | "completed")
- watched_percentage (integer, 0-100) - for video tracking
- quiz_score (decimal, nullable) - if lesson has quiz
- completion_date (datetime, nullable) - when marked complete
- time_spent_minutes (integer) - total watch time
- date_created (auto)

COLLECTION 7: campus_users
Fields:
- id (UUID, primary key)
- user_id (many-to-one with directus_users, required, unique) - links to auth user
- bio (text, optional) - student bio
- expertise_areas (tags, multi-select) - skills/interests
- learning_goals (text, optional) - what they want to achieve
- portfolio_url (string, optional, URL format) - personal portfolio link
- experience_level (select: "beginner" | "some_experience" | "intermediate" | "advanced" | "professional")
- referral_source (select: "social_media" | "search" | "friend_referral" | "existing_client" | "other")
- notifications_enabled (boolean, default true)
- date_joined (datetime, default now())

RELATIONSHIPS SUMMARY:
- Courses → Modules (1 to many, on_delete: cascade)
- Modules → Lessons (1 to many, on_delete: cascade)
- Courses ↔ Instructors (many to many, junction table: courses_instructors)
- Enrollments → Users (many to 1)
- Enrollments → Courses (many to 1)
- Lesson_Progress → Users (many to 1)
- Lesson_Progress → Lessons (many to 1)
- Lesson_Progress → Enrollments (many to 1)
- Campus_Users → Directus_Users (1 to 1, on_delete: cascade)

PERMISSIONS:
Create a new role called "campus" in Directus with these permissions:
✅ READ: courses (published only), modules, lessons (published), instructors
✅ READ/CREATE/UPDATE: enrollments (own only), lesson_progress (own only), campus_users (own only)
✅ READ: directus_users (own profile only)
❌ CANNOT: delete anything, modify course structure, upload files to system

After creating collections, populate with sample data:

SAMPLE ANIMATION COURSES:
1. Motion Graphics Fundamentals
   - Level: Beginner, Price: $49
   - 4 modules: Basics, Principles, Techniques, Projects
   - 3-4 lessons per module
   - Include After Effects tutorial videos

2. 3D Modeling & Animation
   - Level: Intermediate, Price: $79
   - 5 modules: Modeling, Rigging, Animation, Rendering, Lighting
   - 3-4 lessons per module
   - Include Blender/Maya tutorial videos

SAMPLE TECHNOLOGY COURSES:
1. Web Development Basics
   - Level: Beginner, Price: $39
   - 4 modules: HTML/CSS, JavaScript, Responsive Design, Deployment
   - 3 lessons per module

2. Full-Stack JavaScript Development
   - Level: Intermediate, Price: $69
   - 5 modules: Node.js, Express, Databases, React, Authentication
   - 3-4 lessons per module

SAMPLE INSTRUCTORS (5 total):
1. Motion Graphics Expert (teaches animation courses)
2. 3D Artist (teaches 3D courses)
3. Full-Stack Developer (teaches tech courses)
4. UI/UX Designer (teaches design courses)
5. Creative Director (teaches overview/mastery courses)

═══════════════════════════════════════════════════════════════════════════════

PHASE 2: CAMPUS REGISTRATION FORM

Create a /campus/register page with multi-stage registration:

STAGE 1 (Immediate - Required):
- Email (text, required, unique, email validation)
- Password (password, required, min 8 chars, strength meter)
- Confirm Password (password, required, must match)
- First Name (text, required, 2-50 chars)
- Last Name (text, required, 2-50 chars)
- Phone (tel, optional, format: +1 (555) 123-4567)

Form behavior:
- Real-time validation (no wait for submit)
- Field-level error messages
- Password strength indicator (weak/fair/strong)
- Green checkmark for valid fields
- Honeypot field "website" (hidden) for spam prevention
- Submit button disabled until all required fields valid
- On submit: create user in directus_users + send verification email

STAGE 2 (Optional - On First Login):
- Profile Picture (image upload, circular 200x200px)
- Bio (textarea, 250 char max, counter)
- Expertise Areas (multi-select checkboxes):
  ☐ Animation & Motion Graphics
  ☐ 3D Modeling & Visual Effects
  ☐ Web Development
  ☐ UI/UX Design
  ☐ Video Editing & Production
  ☐ Graphic Design
  ☐ Audio/Music Production
  
- Learning Goals (textarea, 500 char max, counter, placeholder: "What do you want to achieve?")
- Experience Level (radio buttons):
  ○ Complete Beginner
  ○ Some Experience
  ○ Intermediate
  ○ Advanced
  ○ Professional
  
- Portfolio URL (text, optional, URL validation)
- How Did You Hear About Us (select dropdown):
  ○ Social Media
  ○ Search Engine
  ○ Friend/Referral
  ○ Existing Nafuna Client
  ○ Other
  
- Newsletter Preferences (checkboxes):
  ☐ Course Updates & New Releases
  ☐ Community Messages & Forums
  ☐ Weekly Learning Tips
  ☐ Certification Progress Notifications

Form behavior:
- All fields optional except marked required
- Save button saves to campus_users collection
- Allow "Skip for Now" to access dashboard first
- Stage 2 can be completed/edited in /campus/profile later
- Success message: "Welcome to Nafuna Campus! 🎓"

Styling:
- Use AgencyOS design (Teal primary, Cream background)
- Mobile-first responsive (single column on mobile, centered on desktop max 600px)
- Progress indicator showing "Step 1 of 2"
- Consistent spacing and typography from design system

═══════════════════════════════════════════════════════════════════════════════

PHASE 3: AUTH MIDDLEWARE & ROLE-BASED ROUTING

Create /middleware/auth.ts with this logic:

On page load:
1. Check if user is authenticated (check directus_users JWT token)
2. Fetch user.role from directus_users
3. If role === "campus":
   - Check if campus_users record exists (many campus users might not have this yet)
   - If NOT exist: redirect to /campus/complete-profile (Stage 2)
   - If exists: continue to requested page
   - Set layout to "campus" layout
   - Redirect login → /campus/dashboard
4. Else (role = admin, editor, etc.):
   - Set layout to "client" layout (existing)
   - Redirect login → /client/dashboard (existing)
5. If NOT authenticated:
   - Allow access to /auth/login, /auth/register
   - Redirect other /campus routes → /auth/login

Nuxt Routes:
/campus/
  /register (public, registration form)
  /dashboard (protected, main hub)
  /courses (protected, course listing)
  /course/[slug] (protected, course detail)
  /course/[courseSlug]/module/[moduleName]/lesson/[lessonSlug] (protected, lesson view)
  /my-courses (protected, student's enrolled courses)
  /learning-path (protected, personalized recommendations)
  /certificates (protected, earned certificates)
  /profile (protected, edit campus_users)
  /settings (protected, notification preferences)

/client/
  (keep existing structure, no changes)

═══════════════════════════════════════════════════════════════════════════════

PHASE 4: CAMPUS DASHBOARD (Multi-Layer Design)

Build /campus/dashboard using these layers:

LAYER 1: Welcome & Quick Stats (full width)
- Personalized greeting: "Welcome back, [First Name]! 👋"
- Call-to-action: "Resume Learning" → button links to last accessed lesson
- Quick stats cards (horizontal scroll on mobile):
  ├─ In Progress: [X] courses
  ├─ Completed: [X] courses  
  ├─ This Week: [X] hours learned
  └─ Certificates: [X] earned

LAYER 2: Active Courses (full width, 3 columns desktop / 1 mobile)
- Card layout with hover effects
- Each card shows:
  ├─ Course thumbnail (4:3 aspect ratio, 280px wide)
  ├─ Course title (H4)
  ├─ Instructor name(s)
  ├─ Course type badge (Animation/Technology)
  ├─ Level badge (Beginner/Intermediate/Advanced)
  ├─ Progress bar (0-100%, animated fill)
  ├─ "X hrs / Y hrs total"
  └─ [Resume] button → links to current_lesson_id

LAYER 3: Browse & Filter Courses (full width)
- Sticky filter bar (desktop) or collapsible (mobile):
  ├─ Type toggle: Animation ☑ | Technology ☑
  ├─ Level select: All | Beginner | Intermediate | Advanced
  ├─ Instructor select: [All Instructors dropdown]
  ├─ Pricing: Free & Paid | Free Only | Paid Only
  └─ [Clear Filters] button
  
- Course grid (same card format as Layer 2)
- Real-time filter updates (AJAX)
- Show X results matching filters
- "Browse All Courses" → /campus/courses (full page)

LAYER 4: Learning Analytics (3 column cards on desktop, stack on mobile)
- Card 1: "23 hours total learned this month"
- Card 2: "47 lessons completed"
- Card 3: "3 certificates earned"
- Below: Mini chart "Learning Activity (Last 7 Days)"
  ├─ Bar chart or simple HTML: Mon: 2h | Tue: 3h | Wed: 2h | Thu: 0h | Fri: 4h | Sat: 3h | Sun: 3h
  ├─ Total: 17 hours
  └─ 🔥 5-day learning streak

LAYER 5: Certificates & Achievements (full width grid)
- Grid of earned certificates (max 4 visible)
- Each certificate card shows:
  ├─ Certificate image/preview
  ├─ Course name
  ├─ Date earned
  ├─ [Download PDF] button
  └─ [Share on LinkedIn] button (optional, Phase 2)
- "View All Certificates" → /campus/certificates

Styling:
- Use AgencyOS design system (all colors, fonts, spacing, shadows)
- Responsive grid (1 column mobile, 2 tablet, 3+ desktop)
- Card shadows & hover effects (lift 4px on hover)
- Smooth transitions (200-300ms cubic-bezier)
- Dark mode support (prefers-color-scheme: dark)

═══════════════════════════════════════════════════════════════════════════════

PHASE 5: COURSE & LESSON UI

COURSES PAGE (/campus/courses):
- Full-width course grid (same filter as Layer 3 dashboard)
- Advanced filters (sticky sidebar on desktop, collapsible on mobile)
- Sort options: Newest | Most Popular | Highest Rated | Most Students
- Search bar (search by title, instructor, keywords)
- Course cards show: thumbnail, title, instructor, level, price, [Enroll] button

COURSE DETAIL (/campus/course/[slug]):
2-column desktop layout | 1-column mobile:

LEFT SIDEBAR (collapsible on mobile):
- Course title (H1)
- Instructor(s) with avatars
- Course type badge + Level badge
- Description (first 200 chars, expandable)
- Module & Lesson Tree (collapsible accordion):
  ├─ Module 1 (collapsible)
  │  ├─ ☐ Lesson 1 (12 min)
  │  ├─ ☑ Lesson 2 (10 min) ← Currently viewing
  │  └─ ○ Lesson 3 (8 min)
  └─ Module 2 (collapsible)
     ├─ ○ Lesson 4 (15 min)
     └─ ○ Lesson 5 (12 min)
     
- Completion progress bar
- "Your Progress: 12/27 lessons (44%)"
- [Enroll] or [Resume] button

RIGHT MAIN CONTENT (70% desktop):
- Video player (responsive iframe)
- Lesson title (H2)
- Lesson description/notes (rich text)
- Below video:
  ├─ Duration: "12 minutes"
  ├─ [✓ Mark Complete] checkbox
  ├─ Download button (resources/attachments if any)
  └─ Previous/Next Lesson buttons
  
- Comments/Q&A Section:
  ├─ Recent comments (3 max, expandable)
  ├─ Comments form
  └─ Instructor response badges for answered questions

LESSON PLAYER FEATURES:
- Playback speed (0.75x, 1x, 1.25x, 1.5x, 2x)
- Full-screen support
- Video progress tracking (auto-save watched_percentage)
- Keyboard shortcuts (space=play, →/←=skip, f=fullscreen)
- Quality selector (720p, 1080p if available)
- Picture-in-picture mode (browsers that support)

═══════════════════════════════════════════════════════════════════════════════

PHASE 6: IMPLEMENTATION CHECKLIST

Nuxt Components to Create:
☐ CampusRegistrationForm.vue (Stage 1 + Stage 2 tabs)
☐ CampusDashboard.vue (all 6 layers)
☐ CourseCard.vue (reusable course card)
☐ CourseGrid.vue (grid layout + filter integration)
☐ CourseFilter.vue (filter sidebar)
☐ LessonPlayer.vue (video player + controls)
☐ ModuleLessonTree.vue (collapsible tree structure)
☐ ProgressBar.vue (animated progress bars)
☐ InstructorCard.vue (instructor profile card)
☐ CertificateCard.vue (certificate display)
☐ StatsCard.vue (analytics cards)

Composables/Utils:
☐ useCampusAuth.ts (campus user auth logic)
☐ useCourses.ts (fetch courses with filters)
☐ useEnrollments.ts (user's enrollments + progress)
☐ useLessonProgress.ts (track lesson completion)
☐ useUserRole.ts (determine campus vs client globally)
☐ formatDuration.ts (convert minutes to readable format)

API Routes (/server/api):
☐ /auth/register-campus.post.ts (create campus user)
☐ /courses/index.get.ts (list with filters)
☐ /courses/[slug].get.ts (single course detail)
☐ /enrollments/index.get.ts (user's enrollments)
☐ /enrollments.post.ts (enroll in course)
☐ /lesson-progress/[lessonId].post.ts (mark complete)
☐ /certificates/[enrollmentId].get.ts (generate cert)

═══════════════════════════════════════════════════════════════════════════════

NEXT STEPS:

1. Use Directus MCP (from Windsurf) to create all collections
   Prompt: "@directus Create LMS collections [paste Phase 1 specs]"

2. Verify collections in Directus admin UI

3. Create /campus/register page with registration form

4. Build auth middleware for role detection

5. Create /campus/dashboard with all 6 layers

6. Build course listing and detail pages

7. Build lesson player with progress tracking

8. Test end-to-end: Register → Enroll → Learn → Mark Complete → Certificate

═══════════════════════════════════════════════════════════════════════════════

DESIGN SYSTEM TO USE:

Primary Colors (already in AgencyOS):
- Teal-500: #218085 (buttons, links, primary CTA)
- Teal-600: #1d7480 (hover state)
- Teal-700: #1a6873 (active state)
- Teal-300: #32b8c6 (dark mode lighter)

Accent Colors:
- Orange-500: #a84b2f (technology courses, warnings)
- Purple-500: #6b21a8 (animation courses)
- Green-500: #15803d (success, completed)
- Red-500: #c01531 (errors)

Neutral Scale:
- Cream-50: #fcfcf9 (light background)
- Cream-100: #fffff5 (light surface)
- Charcoal-700: #1f2121 (dark background)
- Charcoal-800: #262828 (dark surface)
- Slate-900: #134252 (dark text)
- Slate-500: #626c71 (secondary text)
- Gray-200: #f5f5f5 (light elements)
- Gray-300: #a7a9a9 (borders, disabled)

Typography (already in use):
- Headings: Poppins font-weight-semibold (550)
- Body: Inter font-weight-normal (400)
- Code: Berkeley Mono or Monaco

Spacing: 8px base grid (8, 16, 24, 32, 48, 64px)
Radius: 8px base (buttons, cards), 12px large components
Transitions: 200-250ms cubic-bezier(0.16, 1, 0.3, 1)
Shadows: Use existing AgencyOS shadow scale

═══════════════════════════════════════════════════════════════════════════════

Let's build this together! Start with Directus MCP to create the collections, 
then we'll build the Nuxt components layer by layer.

What should we tackle first?
```

---

## 📋 HOW TO USE THIS PROMPT

### Quick Start:
1. **Copy** the entire prompt above (everything between the triple backticks)
2. **Open Windsurf** IDE
3. **Click** the Cascade chat panel on the right
4. **Paste** the prompt into the chat input
5. **Press Enter** to submit

### Expected Workflow:
- Windsurf will use Directus MCP to create collections automatically
- You'll see Directus database changes happening in real-time
- Ask follow-up questions in Cascade as needed
- Build Nuxt components layer by layer

### Key Windsurf Commands:
```
@directus [request anything about your Directus instance]
@web [search the web if you need current info]
@editor [open specific files in the editor]

Examples:
@directus Create all LMS collections from Phase 1
@directus Show me the courses collection schema
@directus Create sample animation courses with lessons
@directus Update enrollment table with new fields
```

---

## 📞 SUPPORT RESOURCES

- **Directus Docs:** https://directus.io/docs
- **Nuxt 3 Docs:** https://nuxt.com/docs
- **Windsurf Docs:** https://windsurf.com/docs
- **Your Project Files:** 
  - Windsurf Campus LMS Prompt: `Windsurf-Campus-LMS-Prompt.md`
  - Design Reference: `Design-UX-Reference.md`

---

**Last Updated:** December 1, 2025
**Ready to Launch:** December 1, 2025
**Estimated Timeline:** 3-4 weeks from start to beta launch
