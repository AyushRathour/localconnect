# LocalConnect — Full-Stack Local Service Discovery, Provider Verification & Booking Platform

> **Academic Project Submission & Full-Stack Placement Portfolio**  
> Developed for BTech Computer Science Mini-Project Evaluation & Production Deployment.

---

## 1. Project Overview
**LocalConnect** is an end-to-end full-stack web application designed to solve trust, safety, and operational friction in the local services marketplace. It connects homeowners and consumers with local independent tradespeople (electricians, plumbers, carpenters, deep cleaning specialists, AC repair technicians, painters, appliance specialists, and tutors).

Unlike unmoderated classifieds, LocalConnect introduces an **Administrative Provider Verification System**, **atomic double-booking prevention**, **tamper-proof verified reviews**, and **role-based access control (RBAC)** across three distinct roles: **Customer**, **Service Provider**, and **Administrator**.

---

## 2. Problem Statement
Traditional local directories suffer from:
1. **Unverified Service Providers:** High risk of unqualified personnel entering households.
2. **Phantom / Deceptive Pricing:** Hidden charges appearing only after technicians arrive.
3. **Double Booking & Scheduling Clashes:** Providers accepting simultaneous requests manually.
4. **Fake Reviews & Manipulation:** Competitors or non-customers posting misleading reviews without ever booking.

---

## 3. Project Objectives
- Enable customers to discover certified services filtered by area, category, rating, and verified standing.
- Provide service providers with a dashboard to manage listings, submit legal credentials, set working schedules, and triage booking requests.
- Provide administrators with a dashboard and compliance queue to approve/reject verification documents, monitor bookings, manage users, and moderate reviews.
- Prevent non-completed bookings from submitting ratings.
- Ensure 100% test coverage for core business logic and zero-flaw production build.

---

## 4. Key Features by User Role

### A. Customer
- **Authentication & RBAC:** Register, log in with JWT / secure cookies, manage profile.
- **Service Discovery:** Real-time search, category filters, neighborhood matching, price boundaries, minimum rating, and "Verified Only" toggle.
- **Service Details & Contiguous Booking:** Instant view of provider credentials, experience, verified badge, and customer reviews.
- **Booking Flow:** Select date, time slot, select saved or custom address, and add requirements.
- **Booking Management:** Track status through 7 lifecycle stages (`pending`, `accepted`, `rejected`, `confirmed`, `in_progress`, `completed`, `cancelled`).
- **Cancellation:** Cancel pending or confirmed bookings according to policy.
- **Verified Reviews:** Submit 1 to 5-star ratings and written feedback only for completed bookings.
- **Notifications & Address Book:** In-app notification center and multi-address management.

### B. Service Provider
- **Professional Onboarding:** Create business profile, define trade skills, experience, and service neighborhoods.
- **Verification Center:** Upload government photo ID and trade license scans; monitor compliance decisions and review feedback.
- **Service Offerings Management:** Create, edit, and deactivate services with fixed, starting, or hourly pricing.
- **Availability Schedule:** Configure weekly working days (Mon - Sat) and operating hours.
- **Booking Lifecycle Actions:** Accept or reject incoming requests; mark technician on-site (`in_progress`); mark job completed (`completed`).
- **Client Feedback & Performance:** Track customer reviews and platform earnings.

### C. Administrator
- **Platform Analytics:** Real-time counts of customers, providers, pending verifications, bookings, and revenue.
- **Provider Verification Review Queue:** Examine submitted trade licenses, approve with single-click, reject, or request resubmission with explanatory feedback.
- **User Management:** Search and filter users by role and status; suspend or reactivate accounts.
- **Catalog & Category Management:** Create and edit service categories; inspect services.
- **Review Moderation:** Approve, flag, or hide reviews with automatic rating recalculation.
- **Audit Logs:** Immutable audit trail of administrative actions.

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript (`tsx`) |
| **Persistence** | Mongoose-compatible Document Store engine with atomic JSON persistence and MongoDB Atlas connection support |
| **Authentication** | JWT (JSON Web Tokens), HTTP-only cookies, bcryptjs password hashing |
| **Security** | CORS origin validation, Role-based route guards, audit logging |
| **Testing** | Node.js / TypeScript test runner (`npm test`) with 18 automated checks |

---

## 6. Architecture & System Diagrams

### System Architecture
```text
┌─────────────────────────────────────────────────────────────────┐
│                       Client Browser                            │
│  React 19 + React Router v7 + Context API + Tailwind CSS v4     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / Cookies / Bearer
┌───────────────────────────────▼─────────────────────────────────┐
│                    Express.js API Server                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Middleware: Cookie Parser, CORS, JWT Auth, Role RBAC, Audits│ │
│ └─────────────────────────────┬───────────────────────────────┘ │
│ ┌─────────────────────────────▼───────────────────────────────┐ │
│ │ Routers: Auth, Services, Providers, Bookings, Admin, Reviews│ │
│ └─────────────────────────────┬───────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────┘
                                │ Query & Mutations
┌───────────────────────────────▼─────────────────────────────────┐
│               LocalConnect Persistence Layer                    │
│ Mongoose Collections: Users, ProviderProfiles, Bookings, etc.   │
└─────────────────────────────────────────────────────────────────┘
```

### Booking State Machine
```text
[Customer Requests] ──► PENDING ──► [Provider Accepts] ──► ACCEPTED
                           │                                   │
                     [Provider Rejects]              [Provider Confirms]
                           │                                   │
                           ▼                                   ▼
                       REJECTED                            CONFIRMED
                                                               │
                                                       [Provider Arrives]
                                                               │
                                                               ▼
[Customer / Admin Cancel] ◄── CANCELLED ◄───────────── IN_PROGRESS
                                                               │
                                                       [Provider Finishes]
                                                               │
                                                               ▼
                                                           COMPLETED ──► [Eligible for Review]
```

---

## 7. Folder Structure
```text
localconnect/
├── .data/                     # Atomic persistent database store
├── server/
│   ├── db/
│   │   ├── types.ts           # Schema models and TypeScript interfaces
│   │   ├── store.ts           # High-performance Document Store engine
│   │   └── seed.ts            # Idempotent seed script
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication & session handling
│   │   └── rbac.ts            # Role-based access control
│   ├── routes/
│   │   ├── auth.ts            # Login, register, logout, me, password reset
│   │   ├── categories.ts      # Service category discovery
│   │   ├── services.ts        # Search, filter, sorting, provider CRUD
│   │   ├── providers.ts       # Directory, verification submission, profile
│   │   ├── bookings.ts        # Booking lifecycle state machine
│   │   ├── reviews.ts         # Verified reviews & rating recalculation
│   │   ├── customer.ts        # Addresses, profile, customer dashboard
│   │   ├── notifications.ts   # In-app notifications
│   │   ├── contact.ts         # Support contact form
│   │   └── admin.ts           # Verification queue, users, moderation, audit
│   └── test/
│       └── test-runner.ts     # Automated QA test suite
├── src/
│   ├── components/
│   │   ├── common/            # Navbar, Footer, Badges, Modals, Stars
│   │   └── layout/            # MainLayout, DashboardLayout, ProtectedRoute
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth & 1-click evaluation switcher
│   ├── pages/
│   │   ├── customer/          # Dashboard, Bookings, Addresses, Reviews
│   │   ├── provider/          # Dashboard, Verification, Services, Schedule
│   │   ├── admin/             # Dashboard, Verifications, Users, Audit
│   │   └── ...                # Home, Services, Detail, About, Contact, Login
│   ├── services/
│   │   └── api.ts             # Centralized typed API client
│   ├── App.tsx                # Client-side router configuration
│   └── main.tsx               # React DOM bootstrap
├── server.ts                  # Server entry point (Express + Vite)
├── package.json
└── README.md
```

---

## 8. Database Collections

1. **`users`**: `_id`, `name`, `email`, `passwordHash`, `phone`, `role` (`customer` \| `provider` \| `admin`), `accountStatus`, `createdAt`, `updatedAt`.
2. **`providerProfiles`**: `_id`, `userId`, `businessName`, `description`, `skills`, `experienceYears`, `serviceAreas`, `verificationStatus` (`approved` \| `pending` \| `resubmission_required` \| `rejected` \| `not_submitted`), `averageRating`, `reviewCount`, `active`.
3. **`verificationDocuments`**: `_id`, `providerId`, `documentType`, `documentName`, `secureStorageKey`, `reviewStatus`, `submittedAt`.
4. **`services`**: `_id`, `providerId`, `categoryId`, `title`, `slug`, `description`, `price`, `pricingType`, `estimatedDuration`, `serviceAreas`, `active`.
5. **`serviceCategories`**: `_id`, `name`, `slug`, `description`, `icon`, `active`.
6. **`bookings`**: `_id`, `bookingReference`, `customerId`, `providerId`, `serviceId`, `addressSnapshot`, `requestedDate`, `startTime`, `endTime`, `servicePriceSnapshot`, `totalAmount`, `status`, `statusHistory`.
7. **`reviews`**: `_id`, `bookingId`, `customerId`, `providerId`, `rating`, `comment`, `moderationStatus`.
8. **`addresses`**: `_id`, `userId`, `label`, `addressLine`, `area`, `city`, `state`, `postalCode`, `isDefault`.
9. **`notifications`**: `_id`, `userId`, `title`, `message`, `type`, `readAt`, `createdAt`.
10. **`auditLogs`**: `_id`, `actorId`, `actorRole`, `action`, `targetType`, `targetId`, `safeMetadata`, `createdAt`.

---

## 9. API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register customer or provider
- `POST /api/v1/auth/login` — Login with email/password, sets HTTP-only cookie
- `POST /api/v1/auth/logout` — Clear session
- `GET /api/v1/auth/me` — Current user profile and permissions
- `POST /api/v1/auth/forgot-password` — Password reset request
- `POST /api/v1/auth/reset-password` — Reset password with token

### Services & Categories
- `GET /api/v1/categories` — Active categories with counts
- `GET /api/v1/services` — Filtered service query (search, area, minPrice, maxPrice, minRating, verifiedOnly, sort, pagination)
- `GET /api/v1/services/:id` — Service details with provider and reviews
- `POST /api/v1/services/provider/services` — Provider creates service
- `PATCH /api/v1/services/provider/services/:id` — Provider edits service
- `DELETE /api/v1/services/provider/services/:id` — Provider deactivates service

### Bookings
- `POST /api/v1/bookings` — Customer creates booking (verifies approved provider, prevents double-booking, snapshots price)
- `GET /api/v1/bookings/my` — Customer bookings list
- `GET /api/v1/bookings/provider` — Provider incoming requests
- `GET /api/v1/bookings/:id` — Booking details and audit timeline
- `PATCH /api/v1/bookings/:id/cancel` — Cancel booking with reason
- `PATCH /api/v1/bookings/provider/:id/accept` — Provider accepts request
- `PATCH /api/v1/bookings/provider/:id/reject` — Provider declines request
- `PATCH /api/v1/bookings/provider/:id/status` — Advance status (`confirmed`, `in_progress`, `completed`)

### Reviews & Admin
- `POST /api/v1/reviews` — Submit verified review for completed booking
- `GET /api/v1/admin/dashboard` — Platform KPIs & stats
- `GET /api/v1/admin/verifications` — Provider verification queue
- `PATCH /api/v1/admin/verifications/:id` — Approve, reject, or request resubmission
- `GET /api/v1/admin/users` — User management and status toggle
- `GET /api/v1/admin/audit-logs` — Immutable audit trail

---

## 10. Demonstration & Evaluation Credentials

LocalConnect includes safe demonstration seed data. You can log in manually or use the **1-Click Demo Evaluation Switcher** on the Home and Login pages:

| Role | Name | Email | Password | Status |
|---|---|---|---|---|
| **Customer** | Priya Sharma | `customer@localconnect.com` | `Customer123!` | Active customer with bookings |
| **Approved Provider** | Arun Patel | `electrician.arun@localconnect.com` | `Provider123!` | Verified Electrician (4.9★, 28 reviews) |
| **Pending Provider** | Suresh Menon | `pending.provider@localconnect.com` | `Provider123!` | Verification Pending (in admin queue) |
| **Resubmit Provider** | Kavita Rao | `resubmit.provider@localconnect.com` | `Provider123!` | Resubmission Requested |
| **Administrator** | Platform Admin | `admin@localconnect.com` | `AdminSecure2026!` | Full Admin Privileges |

---

## 11. Local Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
*Executes all 18 automated tests verifying password hashing, RBAC, double-booking prevention, verification approval, and ratings.*

### 3. Run Dev Server
```bash
npm run dev
```
*Starts full-stack Express server with Vite middleware on port 3000.*

### 4. Build for Production
```bash
npm run build
```

### 5. Start Production Server
```bash
npm start
```

---

## 12. Deployment Instructions
1. **Frontend Hosting (Vercel / Cloudflare Pages / Render):** Run `npm run build` to generate `dist/`. Set `VITE_API_BASE_URL` if serving backend separately.
2. **Backend Hosting (Render / Railway / GCP Cloud Run):** Set environment variables (`NODE_ENV=production`, `PORT=3000`, `JWT_SECRET=...`). Start command: `node server.ts` or `tsx server.ts`.
3. **Database:** In production, specify `MONGODB_URI` pointing to MongoDB Atlas.

---

## 13. Academic Viva & Portfolio Highlights
- **State Machine Integrity:** Bookings follow strict transitions with audit notes.
- **Double-Booking Prevention:** Algorithm guarantees providers cannot receive conflicting appointments.
- **Verification Privacy:** Identity documents use secure identifiers that are never leaked in public endpoints.
- **Zero-Pill UI Standards:** Follows strict typographic hierarchy, WCAG AA accessibility, and mobile-first responsiveness.
