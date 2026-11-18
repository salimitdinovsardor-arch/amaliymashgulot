# 🎓 EduHub — Next-Generation Modern Educational Platform

**EduHub** is a production-grade, secure, and modern educational SaaS web platform engineered with React (Vite), Tailwind CSS, Node.js, Express, MongoDB, and enterprise-grade JWT HttpOnly authentication with refresh token rotation.

---

## 🌟 Key Features

### 🔐 Enterprise Authentication & Security
- **Secure HttpOnly Cookie Storage**: Access and refresh tokens are stored exclusively in HttpOnly cookies, rendering the application immune to token theft via XSS (never stored in `localStorage`).
- **Short-Lived Access Tokens**: 3-minute access token lifespan for minimal attack exposure.
- **Refresh Token Rotation & Revocation**: 7-day refresh tokens that automatically rotate on every renewal. Any attempt to reuse a revoked token triggers instant global session invalidation.
- **Bcrypt Password Encryption**: Industry-standard cryptographic salting and hashing.
- **Rate Limiting & Helmet**: Global API rate limiting plus stricter brute-force protection on authentication endpoints, paired with HTTP security headers.
- **Input Sanitization & NoSQL Injection Protection**: Strict input validation using `express-validator` and recursive sanitization of dangerous MongoDB query keys (`$` and `.`).

### 💻 Modern Frontend Experience
- **Vite & React 18**: Instant development startup and optimized production builds.
- **Tailwind CSS Design System**: Custom SaaS palette, modern rounded cards, fluid micro-interactions, responsive grids, and full Dark Mode support.
- **8 Core Pages**:
  1. `Home`: Hero showcase, metrics, feature grid, course previews, and interactive CTA.
  2. `Register`: Comprehensive validation (name, email, password, confirm password) with instant feedback.
  3. `Login`: Secure authentication with automated redirection to protected destinations.
  4. `Dashboard`: Live metrics (enrolled courses, in progress, certificates, avg progress), active course progress bars, real-time activity timeline, streak tracker, and quick enroll.
  5. `Profile`: Public identity, verified badge, and editable academic profile with live backend sync.
  6. `Courses`: Catalog with real-time category filtering, search query filtering, syllabus previews, and enrollment.
  7. `Settings`: Secure password changer, notification preferences, and cryptographic token status indicators.
  8. `404 Not Found`: Friendly fallback page with return navigation.
- **Axios Interceptor for Silent Token Refresh**: Automatically detects 401 token expirations and silently renews access tokens using the refresh cookie before retrying failed requests without user interruption.
- **Toast Notification Engine**: Animated inline and floating notifications for success, error, warning, and info states.

---

## 📁 Project Architecture

```
amaliymashgulot/
├── .env.example               # Root environment template
├── .env                       # Environment variables
├── package.json               # Root scripts
├── index.js                   # Application entry point
├── README.md                  # Complete documentation
│
├── backend/                   # Node.js & Express API Server
│   ├── config/
│   │   ├── db.js              # MongoDB connection & hybrid engine
│   │   └── memoryDb.js        # High-performance In-Memory MongoDB engine fallback
│   ├── controllers/
│   │   ├── authController.js  # Register, login, refresh, logout, profile, change-password
│   │   └── courseController.js# Courses CRUD, enrollment, progress, dashboard metrics
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT protect & role authorization guards
│   │   ├── errorMiddleware.js # 404 handler and global exception handler
│   │   ├── rateLimiter.js     # Global API & sensitive auth route rate limiters
│   │   └── validateMiddleware.js# express-validator schemas & NoSQL sanitization
│   ├── models/
│   │   ├── User.js            # User Mongoose schema & methods
│   │   ├── RefreshToken.js    # Refresh token rotation registry with TTL
│   │   ├── Course.js          # Course schema, instructor, modules & syllabus
│   │   └── Activity.js        # Real-time learner activity logs
│   ├── routes/
│   │   ├── authRoutes.js      # All 7 authentication endpoints
│   │   └── courseRoutes.js    # Course browsing, enrollment & dashboard routes
│   ├── utils/
│   │   ├── generateTokens.js  # Access (3m) & Refresh (7d) JWT signing
│   │   ├── cookieOptions.js   # Production-safe HttpOnly cookie configurations
│   │   └── seedData.js        # Default engineering courses seeder
│   ├── test-auth.js           # 14-point automated integration test suite
│   ├── run-suite.js           # Test runner
│   ├── server.js              # Express server setup & static bundle serving
│   ├── package.json
│   └── .env.example
│
└── frontend/                  # React + Vite + Tailwind CSS Client
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Header with branding, navigation & theme toggle
    │   │   ├── Sidebar.jsx        # Dashboard sidebar with active indicators
    │   │   ├── TopNav.jsx         # Dashboard topbar, search, notifications & menu
    │   │   ├── Footer.jsx         # Modern platform footer
    │   │   ├── StatCard.jsx       # Metric card with icons & trends
    │   │   ├── CourseCard.jsx     # Course card with progress and action buttons
    │   │   ├── ActivityItem.jsx   # Timeline item
    │   │   ├── Toast.jsx          # Notification toasts
    │   │   ├── LoadingSpinner.jsx # Fluid loading states
    │   │   └── ProtectedRoute.jsx # Client-side route authentication guard
    │   ├── context/
    │   │   ├── AuthContext.jsx    # User session, login, register, logout, profile
    │   │   └── ThemeContext.jsx   # Dark / Light mode provider & persistence
    │   ├── hooks/
    │   │   ├── useAuth.js         # Hook for consuming AuthContext
    │   │   └── useTheme.js        # Hook for consuming ThemeContext
    │   ├── layouts/
    │   │   ├── MainLayout.jsx     # Public layout (Navbar + Page + Footer)
    │   │   └── DashboardLayout.jsx# Protected layout (Sidebar + TopNav + Page)
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page
    │   │   ├── Register.jsx       # Registration with validation
    │   │   ├── Login.jsx          # Login with credentials
    │   │   ├── Dashboard.jsx      # Metrics, active courses & activities
    │   │   ├── Profile.jsx        # User identity & editable details
    │   │   ├── Courses.jsx        # Catalog with search & filter
    │   │   ├── Settings.jsx       # Change password & preferences
    │   │   └── NotFound.jsx       # 404 page
    │   ├── services/
    │   │   ├── api.js             # Axios instance with refresh interceptor
    │   │   ├── authService.js     # Auth API endpoints
    │   │   └── courseService.js   # Courses API endpoints
    │   ├── App.jsx                # Router & Provider tree
    │   ├── main.jsx               # React entry point
    │   └── index.css              # Tailwind directives & custom scrollbars
    ├── index.html
    ├── vite.config.js             # Vite proxy configuration
    ├── tailwind.config.js         # Color tokens & typography
    └── package.json
```

---

## ⚙️ Environment Configuration

Create or verify `.env` file in the root and/or `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/eduhub
JWT_ACCESS_SECRET=your_jwt_access_secret_key_32chars_long_min_12345
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_32chars_long_min_67890
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note on MongoDB**: If a local or Atlas MongoDB URI is reachable, EduHub automatically connects to it and operates on real Mongoose collections. If an external MongoDB service is not currently running on `localhost:27017`, EduHub gracefully activates its built-in in-memory MongoDB engine, guaranteeing that registration, login, token rotation, and course operations work instantly without crashing or blocking.

---

## 🚀 How to Run

### Option 1: Unified Development (Both Backend & Frontend)

From the project root:

```bash
# Terminal 1: Start Backend API (Port 5000)
npm run server

# Terminal 2: Start Frontend (Port 5173 with Vite hot reload)
npm run client
```

### Option 2: Production Single-Server Mode

The frontend is pre-built into `frontend/dist`. You can serve both the React application and the API server from a single command:

```bash
npm start
```
Visit `http://localhost:5000` in your browser.

---

## 🧪 Automated Verification Suite

Run the full end-to-end API test suite:

```bash
npm run test:api
```

This automated suite tests:
1. `GET /api/health` — Service readiness
2. `GET /api/courses` — Course catalog & seed verification
3. `POST /api/auth/register` — Account registration & bcrypt hashing
4. Duplicate registration prevention (400 validation error)
5. `GET /api/auth/me` — Protected authentication via HttpOnly cookies
6. `POST /api/auth/refresh` — JWT refresh token rotation
7. `PUT /api/auth/profile` — Profile updates & activity logging
8. `POST /api/courses/:id/enroll` — Course enrollment
9. `PUT /api/courses/:id/progress` — Progress update & completion handling
10. `GET /api/courses/stats/dashboard` — Metric calculations
11. `PUT /api/auth/change-password` — Password updating & token revocation
12. `POST /api/auth/login` — Sign in with updated credentials
13. `POST /api/auth/logout` — Revocation & cookie clearing
14. Unauthorized route rejection after logout (401 code `NO_TOKEN`)

