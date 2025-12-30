## 📅 2025-12-30: Fixed Campus Login Infinite Loop

**Status**: ✅ RESOLVED

## 📅 2025-12-31: Critical Bug - Client Redirects to Campus
**Issue:** Client users are being redirected to `/campus` instead of `/portal` upon login.
**Status**: 🔴 INVESTIGATING
**Suspected Cause**: LoginForm.vue or Login API returning incorrect redirect path, or Role Guard Logic mishap.

---

### 🛑 The Problem
Users attempting to log in to the Campus portal were experiencing:
1.  **Infinite Redirection Loops**: Bouncing between `/campus` and `/auth/signin`.
2.  **Immediate Logout**: Being "kicked out" to the login page immediately after a successful sign-in.
3.  **404 Errors**: Being redirected to a non-existent `/campus/login` page.

### 🔍 Root Cause Analysis
Investigating the issue revealed three compounding factors:

1.  **Cookie Race Condition (The "Kicked Out" Bug)**:
    *   *Mechanism*: The server-side middleware (`01.role-guard.global.ts`) relies strictly on the `user_role_id` cookie to permit access.
    *   *Failure*: When a user logged in, `useDirectusAuth` would set the user state in Javascript memory but often failed to set the *cookie* fast enough before the router navigated to the protected page.
    *   *Result*: The middleware saw no cookie → assumed "Unauthenticated" → redirected back to Login.

2.  **Middleware Strictness (The "Loop" Bug)**:
    *   *Mechanism*: The middleware was checking *only* the cookie.
    *   *Failure*: If the cookie was missing (common on first load or after clear storage), it rejected the user immediately, even if the Directus Client SDK had a valid session in `localStorage`.

3.  **Broken Redirect Target**:
    *   The code was hardcoded to redirect unauthenticated campus users to `/campus/login`, a route that did not exist, causing confusion and 404s.

### 🛠️ The Solution (Why it Works)

We implemented a **"Belt and Suspenders"** approach to session management:

#### 1. Reliability Patch in Middleware (`middleware/01.role-guard.global.ts`)
We updated the guard to be smarter. It no longer fails immediately if the cookie is missing. Instead, it performs a **Client-Side Rescue**:
*   **Step A**: Checks Cookie (Standard).
*   **Step B (New)**: If Cookie is missing, it checks `localStorage.getItem('user_role_id')`.
*   **Step C (New)**: If that fails, it checks the active Directus SDK user state.
*   **Why this works**: If the cookie is late/missing, the redundancy of LocalStorage/SDK State proves the user is logged in, allowing access and *healing* the missing cookie instantly.

#### 2. Explicit Cookie Sync (`useDirectusAuth.ts`)
We modified the `fetchUser` function to **force-write the cookie** every time user data is fetched from the server.
*   **Why this works**: This ensures that even if you refresh the page or restart the browser, the critical `user_role_id` cookie is freshly stamped and available for the server middleware.

#### 3. Corrected Routing
*   Redirects updated to point to `/auth/signin` (which exists).
*   Added "Create Account" link to the login form to bridge the gap to registration.

### 🧪 Validation
This fix has been verified by:
*   Logging in as a Campus user → Success.
*   Refreshing the Dashboard → Session persists (No logout).
*   Navigating Deep (e.g. to Courses) → Session persists.
*   Logging Out → Session cleanly destroyed.

---

## 📅 2025-12-30: Campus Dashboard & LMS Improvements

### Updates Made
- **Logout Button**: Added to Dashboard Header and Sidebar for easy access.
- **Video Player**: Fixed regex to support all YouTube URL formats (`youtu.be`, `youtube.com/embed`, `watch?v=`).
- **Course Cards**: Fixed thumbnail error handling to support both File Objects and ID strings.
- **Registration**: Added link to Registration page from standard Login form.
