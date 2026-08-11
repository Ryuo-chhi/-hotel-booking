# Phase 3: Room Inventory & Availability Search Plan

This document outlines the detailed implementation plan, features, and responsibilities for Phase 3. Since you will be implementing this phase yourself, this guide serves as your roadmap.

## 🎯 Features

1. **Availability Search Engine (Public/User)**
   - Search for available room types based on `check-in` and `check-out` dates.
   - Filter results by guest capacity constraints.
   - Accurately calculate overlaps to exclude rooms that are already booked for the requested dates.
   - Exclude rooms currently undergoing maintenance.
   - Return an accurate `availableRoomsCount` for each available room type.

2. **Room Inventory Management (Admin)**
   - Create new physical rooms in the system.
   - Update room status (e.g., mark a room for maintenance).
   - Read and list physical room states.

---

## 🛠️ Implementation Plan

Here is the step-by-step technical plan, mapping to the files you need to build:

### 1. Search Validations
- [ ] **File**: `src/validators/room.validator.js`
- Use `express-validator` to define schemas for the search endpoint.
- **Constraints**:
  - Ensure `checkIn` is a valid date and comes before `checkOut`.
  - Ensure `checkOut` is a valid date.
  - Validate `guestCount` is a positive integer.

### 2. Data Access Layer (Repositories)
- [ ] **File**: `src/repositories/room-type.repository.js`
- This is where the heavy lifting happens. Implement the SQL/Sequelize query to find available room types.
- **Key Logic**: Use a `NOT EXISTS` or `LEFT JOIN` approach to filter out rooms that have an active booking overlapping with the requested `checkIn` and `checkOut` dates.

- [ ] **File**: `src/repositories/room.repository.js`
- Implement basic CRUD operations for physical rooms (e.g., `create`, `update`, `findById`).
- Handle reading the physical state of rooms (e.g., checking if a room is in 'maintenance' status).

### 3. Business Logic Layer
- [ ] **File**: `src/services/room.service.js`
- Orchestrate the search functionality by calling the repositories.
- Apply additional business logic, such as filtering out rooms by capacity if not handled entirely in the SQL query.
- Process the repository results to calculate the final `availableRoomsCount` to send to the client.

### 4. Presentation Layer (Controllers)
- [ ] **File**: `src/controllers/room.controller.js`
- **`searchAvailableRoomTypes` handler**: Extract query parameters from the request, invoke the service, and return a clean JSON response.
- **`createRoom` / `updateRoom` handlers**: Handle admin requests to manage the physical room inventory.

### 5. Routing
- [ ] **File**: `src/routes/room.routes.js`
- Mount `GET /api/rooms/search` for the public search endpoint.
- Mount `POST /api/rooms` and `PUT /api/rooms/:id` for admin CRUD operations.
- **Security**: Be sure to attach `verifyToken` and `requireRole('admin')` middlewares to the inventory management routes to protect them.

---

## 🧑‍💻 Responsibilities Checklist

As the developer for this phase, here are your actionable tasks to track your progress:

- [ ] **Scaffolding**: Create the necessary files (`validator`, `repositories`, `service`, `controller`, `routes`) if they don't exist yet.
- [ ] **Validation Implementation**: Write the validation chains in `room.validator.js` and test them with invalid inputs (e.g., check-out before check-in).
- [ ] **Database Querying (Crucial)**: Write the availability query in `room-type.repository.js`. This is often the trickiest part of a booking system. Tip: test the SQL logic directly in a database client first.
- [ ] **Service & Controller Logic**: Wire the flow from the router to the controller, through the service, to the repository, and back.
- [ ] **Route Protection**: Ensure your admin routes in `room.routes.js` are properly secured using the middlewares built in Phase 2.
- [ ] **Self-QA / Verification**:
  - Test searching with dates that overlap with existing mock bookings.
  - Verify that rooms in "maintenance" mode do not show up as available.
  - Verify the `availableRoomsCount` accurately reflects the unbooked rooms.
