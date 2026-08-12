# Phase 3: Room Inventory & Availability Search Implementation Plan

This document serves as the comprehensive implementation guide, architecture reference, and progress tracking roadmap for **Phase 3: Room Inventory & Availability Search Engine**.

---

## 🎯 Phase Objectives

1. **Public Availability Search Engine**
   - Search for available room categories based on requested `checkIn` and `checkOut` dates.
   - Filter results based on `guestCount` capacity.
   - Accurately calculate stay duration (`nights`) and total estimated price (`nights * baseRate`).
   - Exclude physical rooms with active overlapping bookings or `'maintenance'` status.
   - Return aggregated `availableRoomsCount` per room type.

2. **Room Inventory Management System (Admin/Manager)**
   - Create physical room units associated with a room type.
   - List physical rooms with status and category filtering.
   - Update room attributes and operational states (`'available'`, `'occupied'`, `'maintenance'`).
   - Delete obsolete room units.

---

## 📊 Overall Progress Dashboard

- [x] **Data Access Layer (Repositories)** — _Completed_
  - [x] `src/repositories/room.repository.js` (CRUD, status counts, transaction locks)
  - [x] `src/repositories/room-type.repository.js` (Availability aggregate queries, `findById`)
- [x] **Business Logic Layer (Services)** — _Completed_
  - [x] `src/services/room.service.js` (Date calculations, price computation, validation)
- [x] **Validation Layer** — _Completed_
  - [x] `src/validators/room.validator.js` (Search & CRUD validation chains)
- [x] **Presentation Layer (Controllers)** — _Completed_
  - [x] `src/controllers/room.controller.js` (HTTP request handlers)
- [x] **Routing & Security Layer** — _Completed_
  - [x] `src/routes/room.routes.js` (Endpoint mapping & RBAC middleware)

---

## 🏗️ Detailed Architectural & Implementation Specifications

### 1. Data Access Layer (Repositories)

#### A. Room Repository (`src/repositories/room.repository.js`)

_Responsibility: Direct database queries on the physical `rooms` table._

| Function                  | Signature                                      | Description / SQL Behavior                                                                |    Status    |
| :------------------------ | :--------------------------------------------- | :---------------------------------------------------------------------------------------- | :----------: |
| `findAvailableRoomInType` | `(roomTypeId, checkIn, checkOut, transaction)` | `LEFT JOIN` bookings filtering `$bookings.id$ IS NULL` with `FOR UPDATE` transaction lock | ✅ Completed |
| `findById`                | `(id, includeRoomType = true)`                 | `findByPk` with optional join on `room_types`                                             | ✅ Completed |
| `findAll`                 | `(options = {})`                               | List rooms with optional `status`, `room_type_id`, `limit`, `offset`                      | ✅ Completed |
| `findByRoomTypeId`        | `(roomTypeId)`                                 | Find all physical room units under a room category                                        | ✅ Completed |
| `countByStatus`           | `(status)`                                     | Aggregate count by `'available'`, `'occupied'`, or `'maintenance'`                        | ✅ Completed |
| `create`                  | `(data, transaction = null)`                   | Insert new room record                                                                    | ✅ Completed |
| `update`                  | `(id, data, transaction = null)`               | Update room attributes                                                                    | ✅ Completed |
| `updateStatus`            | `(id, status, transaction = null)`             | Semantic helper to update operational status                                              | ✅ Completed |
| `deleteById`              | `(id)`                                         | Destroy room record                                                                       | ✅ Completed |

#### B. Room Type Repository (`src/repositories/room-type.repository.js`)

_Responsibility: Category aggregation and occupancy search queries._

| Function                 | Signature                     | Description / SQL Behavior                                                                                                        |    Status    |
| :----------------------- | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------: |
| `findWithAvailableRooms` | `(checkIn, checkOut, guests)` | 2-step query: (1) Find busy room IDs in date range, (2) Group `room_types` and `COUNT(rooms.id)` excluding busy/maintenance rooms | ✅ Completed |
| `findById`               | `(id)`                        | Fetch room type by primary key                                                                                                    | ✅ Completed |

---

### 2. Business Logic Layer (`src/services/room.service.js`)

_Responsibility: Input verification, date calculations, stay price computation, and throwing operational errors._

```
                           [Client Request]
                                  │
                                  ▼
                     [room.controller.js]
                                  │
                                  ▼
                      [room.service.js]
                     ┌────────────┴────────────┐
                     ▼                         ▼
          [room.repository.js]    [room-type.repository.js]
```

#### Functions to Implement in `room.service.js`:

- [x] **`getAvailableRoomTypes(checkIn, checkOut, guests)`**
  - **Validation:** Ensure valid date strings and `checkOut > checkIn`.
  - **Calculation:** Compute `nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))`.
  - **Repository Call:** Invoke `roomTypeRepository.findWithAvailableRooms(checkIn, checkOut, guests)`.
  - **Transformation:** Append `total_price = parseFloat((nights * base_rate).toFixed(2))` to each returned category.

- [x] **`addRoom(roomData)`**
  - **Validation:** Check `roomData.room_type_id` exists via `roomTypeRepository.findById`. Throw `NotFoundError` (404) if missing.
  - **Execution:** Create room with default `status: 'available'`.

- [x] **`getAllRooms(options)`**
  - Delegate query directly to `roomRepository.findAll(options)`.

- [x] **`getRoomById(id)`**
  - Fetch room via `roomRepository.findById(id)`. Throw `NotFoundError` (404) if null.

- [x] **`updateRoom(id, updateData)`**
  - Verify room existence. If `updateData.room_type_id` is passed, verify target room type exists. Update and return updated record.

- [x] **`updateRoomStatus(id, status)`**
  - Validate `status` is one of `['available', 'occupied', 'maintenance']`. Throw `BadRequestError` (400) if invalid. Update status.

- [x] **`deleteRoom(id)`**
  - Verify room exists, then call `roomRepository.deleteById(id)`.

---

### 3. Validation Layer (`src/validators/room.validator.js`)

_Responsibility: Express-validator schema rules for API endpoints._

- **`searchSchema`**:
  - `checkIn`: Required, `isISO8601()`, custom validator checking checkIn is today or in the future.
  - `checkOut`: Required, `isISO8601()`, custom validator checking `checkOut > checkIn`.
  - `guestCount`: Optional, `isInt({ min: 1 })`.

- **`createRoomSchema`**:
  - `room_type_id`: Required, `isInt({ min: 1 })`.
  - `status`: Optional, `isIn(['available', 'occupied', 'maintenance'])`.

---

### 4. Presentation Layer (`src/controllers/room.controller.js`)

_Responsibility: Extract HTTP headers/query/body, call service methods, and return standard JSON responses._

| Route Endpoint          |  Method  |    Access     | Controller Handler         | Success HTTP Status |
| :---------------------- | :------: | :-----------: | :------------------------- | :-----------------: |
| `/api/rooms/available`  |  `GET`   |    Public     | `searchAvailableRoomTypes` |      `200 OK`       |
| `/api/rooms`            |  `GET`   | Admin/Manager | `getAllRooms`              |      `200 OK`       |
| `/api/rooms/:id`        |  `GET`   | Admin/Manager | `getRoomById`              |      `200 OK`       |
| `/api/rooms`            |  `POST`  | Admin/Manager | `createRoom`               |    `201 Created`    |
| `/api/rooms/:id`        |  `PUT`   | Admin/Manager | `updateRoom`               |      `200 OK`       |
| `/api/rooms/:id/status` | `PATCH`  | Admin/Manager | `updateRoomStatus`         |      `200 OK`       |
| `/api/rooms/:id`        | `DELETE` |     Admin     | `deleteRoom`               |      `200 OK`       |

---

### 5. Routing & Security Layer (`src/routes/room.routes.js`)

_Responsibility: Binding Express endpoints, validation middlewares, and RBAC security._

```javascript
import express from "express";
import * as roomController from "../controllers/room.controller.js";
import {
  searchSchema,
  createRoomSchema,
} from "../validators/room.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Search Endpoint
router.get(
  "/available",
  searchSchema,
  validate,
  roomController.searchAvailableRoomTypes,
);

// Protected Admin/Manager Inventory Endpoints
router.use(authenticate);

router.get("/", authorize(["admin", "manager"]), roomController.getAllRooms);
router.get(
  "/:id",
  authorize(["admin", "manager"]),
  roomController.getRoomById,
);
router.post(
  "/",
  authorize(["admin", "manager"]),
  createRoomSchema,
  validate,
  roomController.createRoom,
);
router.put(
  "/:id",
  authorize(["admin", "manager"]),
  roomController.updateRoom,
);
router.patch(
  "/:id/status",
  authorize(["admin", "manager"]),
  roomController.updateRoomStatus,
);
router.delete("/:id", authorize(["admin"]), roomController.deleteRoom);

export default router;
```

---

## 📋 Step-by-Step Task Checklist for Implementation

- [x] **Repository Setup**: Fully implement `room.repository.js` and `room-type.repository.js`.
- [x] **Service Signatures**: Prepare `room.service.js` with stub signatures and JSDoc annotations.
- [x] **Service Implementation**: Implement function bodies in `room.service.js` (date math, price calculations, error throwing).
- [x] **Validator Implementation**: Complete schema definitions in `room.validator.js`.
- [x] **Controller Implementation**: Implement request handlers in `room.controller.js`.
- [x] **Route Binding**: Wire routes in `room.routes.js` with auth/role middlewares.
- [x] **Integration Verification**: Run API request tests for search and inventory management.
