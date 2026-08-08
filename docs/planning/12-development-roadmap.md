# 12. Development Roadmap

This document outlines the 10-day roadmap for developing the Hotel Booking System MVP, highlighting key milestones, dependencies, and daily deliverables.

---

## 1. Roadmap Overview & Timeline

```
                     10-DAY ROADMAP TIMELINE
  Day 1-2      Day 3-4      Day 5-6      Day 7-8      Day 9       Day 10
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
|  Setup,  | | Auth,    | | Search,  | | Booking, | | Stripe   | | Testing, |
|  DB &    | | Users,   | | Rooms    | | Lock     | | Mock     | | Audit &  |
|  Models  | | RBAC     | | Query    | | Engine   | | Checkout | | Deploy   |
+----------+ +----------+ +----------+ +----------+ +----------+ +----------+
```

---

## 2. Day-by-Day Implementation Tasks

### Day 1: Project Initialization & DB Setup
- **Tasks**:
  - Initialize NPM project and configure dependencies (`express`, `sequelize`, `mysql2`, `dotenv`, `bcryptjs`, `jsonwebtoken`).
  - Create database schema migrations for tables: `users`, `room_types`, `rooms`, `bookings`, `transactions`.
  - Set up Sequelize configuration inside [database.js](file:///d:/CADT/Projects/hotel-booking/config/database.js).
- **Deliverables**: Database connectivity verified with models compiling successfully.

### Day 2: Models & Base Seeders
- **Tasks**:
  - Implement models inside `src/models/` and verify associations.
  - Implement base seeders for room types (Standard, Deluxe, Suite) and individual physical rooms.
  - Run database migrations and seeders locally.
- **Deliverables**: Local database populated with mock rooms and test accounts.

### Day 3: Authentication & Identity
- **Tasks**:
  - Set up validation middleware and schema schemas using `express-validator`.
  - Build `UserRepository` and `AuthService` logic.
  - Implement registration (`/api/auth/register`) and login (`/api/auth/login`) API endpoints.
- **Deliverables**: Secure registration and token-based login.

### Day 4: Auth Middleware & Profile API
- **Tasks**:
  - Implement JWT authentication verification middleware and RBAC role gates inside `src/middlewares/auth.middleware.js`.
  - Build `/api/auth/profile` route returning the logged-in user profile details.
  - Write unit tests verifying token claims and expiration logic.
- **Deliverables**: Secure endpoints guarded by role-based access checks.

### Day 5: Room Inventory & Admin Panel CRUD
- **Tasks**:
  - Build Repository and Service files for Room Type and Room entities.
  - Implement Room Type and Room CRUD operations under `/api/rooms` and `/api/room-types`, restricted to the manager role.
- **Deliverables**: Managers can add new rooms and toggle maintenance states.

### Day 6: Availability Search Engine
- **Tasks**:
  - Implement the search algorithm in `RoomTypeRepository` to calculate date exclusions.
  - Create `/api/room-types/available` endpoint accepting check-in, check-out, and guest counts.
  - Add search criteria filters (price ranges, specific room types).
- **Deliverables**: Real-time room availability lookup based on check-in and check-out dates.

### Day 7: Booking Engine & Transaction Safety
- **Tasks**:
  - Build `BookingRepository` and `BookingService`.
  - Implement `POST /api/bookings` endpoint using row-level transactional locks (`FOR UPDATE`) to prevent double-bookings.
  - Calculate pricing breakdown dynamically, applying weekend markups and tax rates.
- **Deliverables**: Secure reservations with temporary status set to `Pending`.

### Day 8: Expiry Cron & Cancellation
- **Tasks**:
  - Create the background cron routine in `src/utils/cron.js` to release expired `Pending` bookings after 10 minutes.
  - Build cancellation handler `/api/bookings/:id/cancel` validating the 24-hour business rule constraint.
- **Deliverables**: Auto-release of unpaid rooms and policy-compliant booking cancellation.

### Day 9: Mock Stripe Checkout & Payment API
- **Tasks**:
  - Implement checkout sequence (`POST /api/payments/checkout`) generating a redirect session token.
  - Implement webhook handler (`POST /api/payments/webhook`) simulating Stripe payment success or failure notifications.
- **Deliverables**: End-to-end checkout flow updating bookings to `Confirmed`.

### Day 10: Testing, Security Hardening, & Walkthrough
- **Tasks**:
  - Run the complete integration test suite verifying booking race conditions.
  - Install Helmet middleware and verify API rate-limiting rules.
  - Generate the onboarding verification guide and walkthrough details.
- **Deliverables**: Production-ready code, documentation, and test logs.
