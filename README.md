# Vaultly — Personal Finance Tracker

**Roll Number / Project Root / Repository:** `25070521010`  
**Application Name:** Vaultly — Personal Finance Tracker  
**Course Submission:** Full-Stack Academic Engineering Project  
**Author:** 25070521010  

---

## 1. Project Overview & Philosophy

**Vaultly** is a high-performance, dark-editorial personal finance management platform engineered to meet strict academic and architectural standards. It enables users to track, budget, and analyze their capital with architectural precision.

Key highlights:
- **Zero Express.js:** The entire backend is built using Node.js's native `node:http` module.
- **MongoDB Compass Integration:** Connects persistently via the official MongoDB Node.js driver to `personal_finance_tracker`, allowing live inspection in MongoDB Compass.
- **Zero-Float Integer Arithmetic:** All monetary records are stored as integer minor units (paise in INR, 1 INR = 100 paise), preventing IEEE 754 floating-point accumulator drift.
- **Cryptographic Authentication:** Passwords hashed with `crypto.scrypt` using unique 16-byte random salts, timing-safe equality checks, SHA-256 hashed session tokens, and CSRF protection.
- **Multi-Account Double-Entry Balance Model:** Transfers between user accounts adjust balances without inflating income or expense totals.

---

## 2. Mandatory Technical Compliance Matrix

| Requirement | Prescribed Standard | Implemented Specification | Compliance Status |
| :--- | :--- | :--- | :--- |
| **Root & Repo Name** | `25070521010` | Folder root: `25070521010`, repo identifier: `25070521010` | **VERIFIED** |
| **Frontend Stack** | React.js, JavaScript, HTML5, CSS3 | React 18, Vite, Vanilla CSS3 (No Tailwind) | **VERIFIED** |
| **Backend Stack** | Pure Node.js (`node:http`) | Built-in `node:http` HTTP server with modular router | **VERIFIED (Zero Express)** |
| **Database** | MongoDB Community Server / Atlas | Official `mongodb` driver v6, database `personal_finance_tracker` | **VERIFIED** |
| **Database GUI** | MongoDB Compass | Live inspectable via Compass at `mongodb://127.0.0.1:27017` | **VERIFIED** |
| **API Protocol** | REST APIs using native `fetch` | Centralized `fetch` service with CSRF & credentials | **VERIFIED** |
| **Auth Scheme** | Scrypt + Sessions + Google OAuth | Node.js `crypto.scrypt` + SHA-256 sessions + OIDC | **VERIFIED** |
| **Currency Mode** | INR & Indian Numbering | Paired integer paise arithmetic (e.g., `₹1,25,000.00`) | **VERIFIED** |
| **Test Runner** | Native Node.js `node:test` | Automated test suite in `server/src/tests/` (21 tests) | **VERIFIED (21/21 Pass)** |

---

## 3. Architecture & Directory Structure

```
25070521010/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, AppHeader, Modals, EmptyState)
│   │   ├── context/            # Global state (AuthContext, ToastContext)
│   │   ├── layouts/            # PublicLayout & AppLayout
│   │   ├── pages/              # 18 Meaningful Views:
│   │   │   ├── LandingPage.jsx         # Hero, interactive cash-flow sandbox, specs
│   │   │   ├── FeaturesPage.jsx        # Compliance matrix & architecture guide
│   │   │   ├── LoginPage.jsx           # Secure login with demo auto-fill
│   │   │   ├── SignupPage.jsx          # User registration with scrypt notice
│   │   │   ├── ForgotPasswordPage.jsx  # Complete 2-step token recovery flow
│   │   │   ├── PrivacyPage.jsx         # Non-misleading privacy policy
│   │   │   ├── TermsPage.jsx           # Accurate terms of service
│   │   │   ├── NotFoundPage.jsx        # Custom 404 & 403 Access Denied views
│   │   │   ├── DashboardPage.jsx       # Real-time portfolio summary & 6-month trend chart
│   │   │   ├── TransactionsPage.jsx    # Ledger with search, filters, pagination, CSV export
│   │   │   ├── AccountsPage.jsx        # Multi-account balances (Bank, Cash, Wallets)
│   │   │   ├── CategoriesPage.jsx      # Income & Expense taxonomy management
│   │   │   ├── BudgetsPage.jsx         # Monthly spending limits & gauge indicators
│   │   │   ├── GoalsPage.jsx           # Savings targets with contribution tracking
│   │   │   ├── RecurringPage.jsx       # Recurring subscriptions & scheduled payments
│   │   │   ├── AnalyticsPage.jsx       # Spending velocity & top merchant reports
│   │   │   ├── NotificationsPage.jsx   # Dynamic budget & recurring payment alerts
│   │   │   └── SettingsPage.jsx        # Profile, password updates, Compass parameters
│   │   ├── services/           # api.js: centralized native fetch client with CSRF tokens
│   │   ├── styles/             # index.css: dark editorial design system & glassmorphism
│   │   └── utils/              # currency.js (paise formatting) and dates.js
│   ├── index.html              # Sora and Inter Google Fonts
│   ├── package.json
│   └── vite.config.js          # Port 5173 with proxy to backend
├── server/                     # Backend HTTP Engine (Pure Node.js)
│   ├── scripts/
│   │   └── seed.js             # Realistic academic demo data generator
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Environment configuration
│   │   │   └── db.js           # MongoClient pool & automatic index initialization
│   │   ├── controllers/        # Modular business logic:
│   │   │   ├── authController.js
│   │   │   ├── accountController.js
│   │   │   ├── categoryController.js
│   │   │   ├── transactionController.js
│   │   │   ├── budgetController.js
│   │   │   ├── goalController.js
│   │   │   ├── recurringController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── reportController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/         # corsMiddleware, authMiddleware, csrfMiddleware, rateLimitMiddleware
│   │   ├── routes/
│   │   │   ├── router.js       # Pure node:http router (route params, body stream parsing)
│   │   │   └── apiRoutes.js    # API route registry
│   │   ├── tests/              # Automated node:test test suite
│   │   │   ├── crypto.test.js
│   │   │   ├── currency.test.js
│   │   │   └── auth_and_ownership.test.js
│   │   ├── utils/              # crypto.js, currency.js, response.js
│   │   └── server.js           # http.createServer entry point with graceful shutdown
│   ├── .env                    # Local configuration
│   ├── .env.example
│   └── package.json
├── package.json                # Root orchestration scripts
├── .gitignore
└── README.md
```

---

## 4. How to Inspect via MongoDB Compass

1. Open **MongoDB Compass**.
2. Connect to the local MongoDB server:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Locate the database named:
   ```
   personal_finance_tracker
   ```
4. You will see the active collections:
   - `users`: stores normalized emails, scrypt password hashes, and random salts.
   - `sessions`: stores SHA-256 session token hashes with automatic TTL expiry indexes.
   - `accounts`: stores accounts (HDFC Bank, SBI Savings, Cash Wallet, UPI) and starting balances.
   - `categories`: stores custom & default income/expense taxonomy.
   - `transactions`: stores financial movements in integer `amountPaise`.
   - `budgets`: stores monthly category limits (`limitPaise`).
   - `savings_goals`: stores target amounts and accumulated savings.
   - `recurring_transactions`: stores recurring schedules and next due dates.

---

## 5. How to Run Locally

### Prerequisites
- Node.js v20+
- MongoDB Community Server (running locally on port 27017)
- MongoDB Compass (for database inspection)

### Installation
From the project root (`25070521010`):

```bash
# 1. Install server dependencies
cd server
npm install --no-package-lock

# 2. Install client dependencies
cd ../client
npm install --no-package-lock
cd ..
```

### Running Tests
Execute the automated test suite using Node.js's built-in `node:test` runner:
```bash
npm --prefix server test
```
*Output: 21 tests passed across crypto, currency arithmetic, and multi-user data isolation.*

### Populating Demo Data
Run the safe academic demo seed script:
```bash
npm --prefix server run seed
```
This populates:
- **Email:** `demo@vaultly.app`
- **Password:** `Vaultly2026!`

### Starting the Application
Start the backend and frontend servers:

```bash
# In terminal 1 (Backend - Port 5000):
npm --prefix server run dev

# In terminal 2 (Frontend - Port 5173):
npm --prefix client run dev
```

Visit the application in your browser at:
```
http://localhost:5173/
```

---

## 6. Security & Financial Precision Implementation

1. **Password Hashing:**
   Implemented via Node.js `crypto.scrypt` with a unique 16-byte random salt generated per user. Verification uses `crypto.timingSafeEqual` to eliminate timing attack vectors.
2. **Session Storage:**
   Sessions reside in MongoDB. The database stores only a SHA-256 hash of the session token. The raw token is stored in an `HttpOnly`, `SameSite=Lax` browser cookie.
3. **Double-Submit CSRF Protection:**
   State-changing requests (`POST`, `PUT`, `DELETE`, `PATCH`) require an `X-CSRF-Token` header matching the authenticated session's cryptographic CSRF token.
4. **Rate Limiting:**
   In-memory sliding window rate limiter protects `/api/auth/*` from brute-force login attempts (30 attempts per 15 minutes) and API endpoints from abuse.
5. **Zero Floating-Point Inaccuracies:**
   All transaction amounts, account balances, budget limits, and savings goals are stored as exact integers in paise (e.g., `₹1,250.50` = `125050` paise).
6. **Transparent Recurring Processing:**
   Recurring schedules forecast upcoming payment dates. When a user clicks "Post Now", an authentic ledger transaction is recorded in MongoDB and the schedule automatically advances to the next period.

---

## 7. Submission Verification Checklist

- [x] Project root folder: `25070521010`
- [x] Website name: `Vaultly — Personal Finance Tracker`
- [x] Pure Node.js `node:http` backend (Zero Express.js)
- [x] Persistent MongoDB Community Server database (`personal_finance_tracker`)
- [x] Verified inspectable in MongoDB Compass
- [x] REST APIs over native `fetch`
- [x] Scrypt password hashing + session cookies + Google OAuth implementation
- [x] Integer minor units (paise in INR)
- [x] 18 meaningful public & authenticated views
- [x] Responsive dark editorial & glassmorphic design
- [x] Automated test suite passed (21/21 tests)
- [x] Demo dataset seeded and verified in browser
