# Implementation Phases Guide & Progress Tracker

This document breaks down the 10-day roadmap into five concrete, executable implementation phases. Each phase defines target files, key service dependencies, code layers to construct, and phase-specific verification guidelines.

---

## 📊 Overall Progress Summary

- [x] **Phase 1: Foundation & Database Architecture** (Completed)
- [x] **Phase 2: Authentication & Role Security** (Completed)
- [ ] **Phase 3: Room Inventory & Availability Search** (Pending)
- [ ] **Phase 4: Atomic Booking Lifecycle** (Pending)
- [ ] **Phase 5: Mock Payments & End-to-End Validation** (Pending)

---

## 🟢 Phase 1: Foundation & Database Architecture (Days 1-2)
*Focuses on environment setup, Sequelize initialization, table migrations, and data seeding.*

```
                 PHASE 1 DATABASE PIPELINE
+----------------+     Sequelize ES6     +--------------------+
|  package.json  | --------------------> |  MySQL Database    |
+----------------+      Models & DB      +--------------------+
                                                   |
                                         Loaded by | Sequelize models
                                                   v
                                         +--------------------+
                                         |  User / Room / Tx  |
                                         +--------------------+
```

### 1.1 Target Files & Layers
- [x] **Configuration**:
  - [package.json](file:///d:/CADT/Projects/hotel-booking/package.json) (install dependencies: `express`, `sequelize`, `mysql2`, `bcryptjs`, `jsonwebtoken`, `@faker-js/faker`)
  - [db.js](file:///d:/CADT/Projects/hotel-booking/src/config/db.js) (setup Sequelize connection pool & environment settings)
  - [jwt.js](file:///d:/CADT/Projects/hotel-booking/src/config/jwt.js) (configure JWT secrets and expiration times)
- [x] **Sequelize Models**:
  - [index.js](file:///d:/CADT/Projects/hotel-booking/src/models/index.js) (Sequelize model index & association bindings)
  - [user.model.js](file:///d:/CADT/Projects/hotel-booking/src/models/user.model.js) (User schema)
  - [room-type.model.js](file:///d:/CADT/Projects/hotel-booking/src/models/room-type.model.js) (RoomType schema)
  - [room.model.js](file:///d:/CADT/Projects/hotel-booking/src/models/room.model.js) (Room schema)
  - [booking.model.js](file:///d:/CADT/Projects/hotel-booking/src/models/booking.model.js) (Booking schema)
  - [transaction.model.js](file:///d:/CADT/Projects/hotel-booking/src/models/transaction.model.js) (Transaction schema)
- [x] **Mock Data & Seeding**:
  - [seed.js](file:///d:/CADT/Projects/hotel-booking/src/seeders/seed.js) (Faker.js mock database seeder script)

### 1.2 Verification Checklist
- [x] Refactor repository from CommonJS to ES6 Modules (`type: "module"`)
- [x] Verify database connection via `sequelize.authenticate()`
- [x] Sync models to MySQL database via `sequelize.sync()`
- [x] Generate mock seed data: `npm run db:seed:faker`
- [x] Verify tables exist and populated in MySQL (`users`, `room_types`, `rooms`, `bookings`, `transactions`)

---

## 🟡 Phase 2: Authentication & Role Security (Days 3-4)
*Implements password security, session token generation (JWT), and authorization route guards.*

### 2.1 Target Files & Layers
- [x] **Route Validation**:
  - [auth.validator.js](file:///d:/CADT/Projects/hotel-booking/src/validators/auth.validator.js) (Express-validator constraints for login and signup schemas)
- [x] **Data Layers**:
  - [user.repository.js](file:///d:/CADT/Projects/hotel-booking/src/repositories/user.repository.js) (`findByEmail`, `create`, `findById`)
  - [auth.service.js](file:///d:/CADT/Projects/hotel-booking/src/services/auth.service.js) (bcrypt password hashing, sign token claims)
  - [auth.controller.js](file:///d:/CADT/Projects/hotel-booking/src/controllers/auth.controller.js) (register, login, profile mapping)
- [x] **Security Middlewares**:
  - [auth.middleware.js](file:///d:/CADT/Projects/hotel-booking/src/middlewares/auth.middleware.js) (`verifyToken`, `requireRole` check)
- [x] **Routing**:
  - [auth.routes.js](file:///d:/CADT/Projects/hotel-booking/src/routes/auth.routes.js) (mount `/register`, `/login`, `/profile`)

### 2.2 Verification Checklist
- [ ] Run unit tests for Auth Service: `npm run test:unit -- src/tests/unit/auth.service.test.js`
- [ ] Test signup payload validations using Postman/Supertest:
  - [ ] Verify that missing fields return `400 Bad Request` with validation error messages.
  - [ ] Verify that successful credentials return `201 Created` with signed token claims.

---

## ⚪ Phase 3: Room Inventory & Availability Search (Days 5-6)
*Constructs the search engine to query available rooms by dates and capacity constraints.*

### 3.1 Target Files & Layers
- [ ] **Search Validations**:
  - [room.validator.js](file:///d:/CADT/Projects/hotel-booking/src/validators/room.validator.js) (check-in check, guest count constraints)
- [ ] **Data Layers**:
  - [room-type.repository.js](file:///d:/CADT/Projects/hotel-booking/src/repositories/room-type.repository.js) (SQL query selecting rooms excluding overlaps)
  - [room.repository.js](file:///d:/CADT/Projects/hotel-booking/src/repositories/room.repository.js) (read physical room state)
  - [room.service.js](file:///d:/CADT/Projects/hotel-booking/src/services/room.service.js) (filter rooms by guest capacities)
  - [room.controller.js](file:///d:/CADT/Projects/hotel-booking/src/controllers/room.controller.js) (`searchAvailableRoomTypes`, `createRoom` handlers)
- [ ] **Routing**:
  - [room.routes.js](file:///d:/CADT/Projects/hotel-booking/src/routes/room.routes.js) (mount search and admin CRUD paths)

### 3.2 Verification Checklist
- [ ] Verify search query logic filters out rooms undergoing maintenance.
- [ ] Verify search query returns correct `availableRoomsCount` when some rooms are pre-booked.

---

## ⚪ Phase 4: Atomic Booking Lifecycle (Days 7-8)
*Develops reservation rules, dynamic price checks, and transactional database row locking to block race conditions.*

### 4.1 Target Files & Layers
- [ ] **Booking Validations**:
  - [booking.validator.js](file:///d:/CADT/Projects/hotel-booking/src/validators/booking.validator.js)
- [ ] **Data Layers**:
  - [booking.repository.js](file:///d:/CADT/Projects/hotel-booking/src/repositories/booking.repository.js) (`createBookingWithTransaction` queries)
  - [booking.service.js](file:///d:/CADT/Projects/hotel-booking/src/services/booking.service.js) (Weekend markups pricing math, database locking transaction wrappers)
  - [booking.controller.js](file:///d:/CADT/Projects/hotel-booking/src/controllers/booking.controller.js) (`createBooking`, `cancelBooking` handlers)
- [ ] **Background Tasks**:
  - [cron.js](file:///d:/CADT/Projects/hotel-booking/src/utils/cron.js) (release hold scheduler)
- [ ] **Routing**:
  - [booking.routes.js](file:///d:/CADT/Projects/hotel-booking/src/routes/booking.routes.js)

### 4.2 Verification Checklist
- [ ] Verify that check-out dates before check-in return `400 Bad Request`.
- [ ] Verify dynamic pricing calculations correctly apply weekend surcharges (20%) and tax rates (10%).
- [ ] Run concurrent booking tests (Supertest) to verify only 1 reservation succeeds for overlapping dates.

---

## ⚪ Phase 5: Mock Payments & End-to-End Validation (Days 9-10)
*Completes mock Stripe checkout callbacks, webhook transaction logging, global error handling, and test suites.*

### 5.1 Target Files & Layers
- [ ] **Payment & Logging Layers**:
  - [transaction.repository.js](file:///d:/CADT/Projects/hotel-booking/src/repositories/transaction.repository.js)
  - [payment.service.js](file:///d:/CADT/Projects/hotel-booking/src/services/payment.service.js) (`processWebhook` updates)
  - [payment.controller.js](file:///d:/CADT/Projects/hotel-booking/src/controllers/payment.controller.js) (checkout, webhook endpoint handlers)
- [ ] **Routing**:
  - [payment.routes.js](file:///d:/CADT/Projects/hotel-booking/src/routes/payment.routes.js)
- [x] **Middlewares**:
  - [error.middleware.js](file:///d:/CADT/Projects/hotel-booking/src/middlewares/error.middleware.js) (global handler catching exceptions)
- [x] **Express Entry**:
  - [app.js](file:///d:/CADT/Projects/hotel-booking/src/app.js) & [server.js](file:///d:/CADT/Projects/hotel-booking/src/server.js)

### 5.2 Verification Checklist
- [ ] Trigger mock stripe success callback (`POST /api/payments/webhook` with `status: "Paid"`):
  - [ ] Verify that transaction status updates to `Paid`.
  - [ ] Verify that booking status transitions to `Confirmed`.
- [ ] Trigger mock stripe failed callback or wait 10 mins:
  - [ ] Verify that transaction status updates to `Failed`.
  - [ ] Verify booking status transitions to `Cancelled` and room is released.
- [ ] Run complete test suite: `npm run test`
