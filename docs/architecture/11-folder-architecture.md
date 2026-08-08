# 11. Folder Architecture

This document defines the folder structure and architecture for the Hotel Booking System MVP. It lists the files, their responsibilities, and expected API exports for each file.

---

## 1. Directory Tree Representation

```
hotel-booking/
├── config/
│   └── database.js
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── room.controller.js
│   │   └── payment.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── room.service.js
│   │   └── payment.service.js
│   ├── repositories/
│   │   ├── user.repository.js
│   │   ├── booking.repository.js
│   │   ├── room.repository.js
│   │   ├── room-type.repository.js
│   │   └── transaction.repository.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.model.js
│   │   ├── room-type.model.js
│   │   ├── room.model.js
│   │   ├── booking.model.js
│   │   └── transaction.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── room.routes.js
│   │   └── payment.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── rate-limiter.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── booking.validator.js
│   │   └── room.validator.js
│   ├── utils/
│   │   ├── errors.js
│   │   ├── helpers.js
│   │   └── cron.js
│   └── tests/
│       ├── unit/
│       └── integration/
├── migrations/
├── seeders/
└── package.json
```

---

## 2. Directory Responsibilities and File Definitions

### 2.1: `src/config/`
Responsible for loading, validating, and exporting environment variables and configuration objects.
* **`env.js`**: Parse `process.env` and export unified configuration objects.
  - *Exports*: Object with keys `db`, `jwt`, `server`, `stripe`.
* **`jwt.js`**: Key configurations for signing and verifying tokens.
  - *Exports*: `{ secret, expiresAt, refreshSecret }`.

### 2.2: `src/controllers/`
Route controllers which inspect request data (body, queries), call service methods, and format standard API responses.
* **`auth.controller.js`**: User onboarding and authentication endpoints.
  - *Exports Class `AuthController`*: `register(req, res, next)`, `login(req, res, next)`, `profile(req, res, next)`.
* **`booking.controller.js`**: Manage reservations, availability slots, and cancellations.
  - *Exports Class `BookingController`*: `createBooking(req, res, next)`, `cancelBooking(req, res, next)`, `getBookings(req, res, next)`.
* **`room.controller.js`**: Endpoint actions for Room CRUD and availability searches.
  - *Exports Class `RoomController`*: `searchAvailableRoomTypes(req, res, next)`, `createRoom(req, res, next)`.
* **`payment.controller.js`**: Mock payments, transaction logs, and Stripe webhook listener.
  - *Exports Class `PaymentController`*: `checkout(req, res, next)`, `webhook(req, res, next)`.

### 2.3: `src/services/`
The business logic layer. Services manage ACID transactions, implement business rules, and connect repositories.
* **`auth.service.js`**: Password hashing, JWT token signature creation, and registration logic.
  - *Exports Class `AuthService`*: `registerUser(data)`, `authenticateUser(email, password)`.
* **`booking.service.js`**: Rules check, total price calculations, transaction locks, and room selection.
  - *Exports Class `BookingService`*: `initiateBooking(userId, roomTypeId, checkIn, checkOut)`, `cancelBooking(bookingId, userId, role)`.
* **`room.service.js`**: Handles room availability algorithms and room configurations.
  - *Exports Class `RoomService`*: `getAvailableRoomTypes(checkIn, checkOut, guests)`, `addRoom(roomData)`.
* **`payment.service.js`**: Resolves payment verification states and releases room holds on cancellation.
  - *Exports Class `PaymentService`*: `initializePayment(bookingId)`, `processWebhook(bookingId, status, txRef)`.

### 2.4: `src/repositories/`
Data access layer isolating database interactions. Extends or wraps Sequelize models.
* **`user.repository.js`**: Direct MySQL access queries for Users.
  - *Exports Class `UserRepository`*: `findByEmail(email)`, `create(data)`, `findById(id)`.
* **`booking.repository.js`**: Manage booking records and transaction locks.
  - *Exports Class `BookingRepository`*: `createBookingWithTransaction(bookingData, t)`, `findOverlappingBookings(roomId, checkIn, checkOut)`, `findById(id)`.
* **`room.repository.js`**: Find individual physical rooms.
  - *Exports Class `RoomRepository`*: `findAvailableRoomInType(roomTypeId, checkIn, checkOut, t)`, `create(data)`.
* **`room-type.repository.js`**: Fetch room type pricing and descriptions.
  - *Exports Class `RoomTypeRepository`*: `findWithAvailableRooms(checkIn, checkOut, guests)`.
* **`transaction.repository.js`**: Write and read payment records.
  - *Exports Class `TransactionRepository`*: `create(data)`, `updateStatusByBookingId(bookingId, status, ref)`.

### 2.5: `src/models/`
Sequelize model definitions specifying table configurations.
* **`index.js`**: Initializes connection pool and relations (belongsTo, hasMany).
  - *Exports*: `{ sequelize, Sequelize, User, RoomType, Room, Booking, Transaction }`.
* **`user.model.js`**: Maps the `users` table schema.
  - *Exports*: Function defining User model.
* **`room-type.model.js`**: Maps the `room_types` table schema.
  - *Exports*: Function defining RoomType model.
* **`room.model.js`**: Maps the `rooms` table schema.
  - *Exports*: Function defining Room model.
* **`booking.model.js`**: Maps the `bookings` table schema.
  - *Exports*: Function defining Booking model.
* **`transaction.model.js`**: Maps the `transactions` table schema.
  - *Exports*: Function defining Transaction model.

### 2.6: `src/routes/`
Express routers mapping URL patterns to controller methods.
* **`index.js`**: Merges sub-routers.
  - *Exports*: Standard Express Router.
* **`auth.routes.js`**: Maps `/api/auth` endpoints.
* **`booking.routes.js`**: Maps `/api/bookings` endpoints.
* **`room.routes.js`**: Maps `/api/rooms` and `/api/room-types` routes.
* **`payment.routes.js`**: Maps `/api/payments` endpoints.

### 2.7: `src/middlewares/`
Re-usable filter blocks executed prior to controllers.
* **`auth.middleware.js`**: JWT signature checks and role check guards.
  - *Exports*: `verifyToken(req, res, next)`, `requireRole(allowedRoles)`.
* **`error.middleware.js`**: Capture errors and return obfuscated responses.
  - *Exports*: `errorHandler(err, req, res, next)`.
* **`rate-limiter.middleware.js`**: Express-rate-limit instances configuration.
  - *Exports*: `apiLimiter`, `authLimiter`.

### 2.8: `src/validators/`
Express-validator schema validations sanitizing HTTP inputs before controller access.
* **`auth.validator.js`**: Validate signup/login schemas.
* **`booking.validator.js`**: Validate dates.
* **`room.validator.js`**: Validate search parameters.

### 2.9: `src/utils/`
Standard helpers and utilities.
* **`errors.js`**: Custom error classes (`AppError`, `NotFoundError`, `ConflictError`).
* **`helpers.js`**: Date formatting and math calculations.
* **`cron.js`**: Background tasks cleaning expired pending bookings.
  - *Exports*: `startCronJobs()`.
