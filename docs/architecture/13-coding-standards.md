# 13. Coding Standards

This document establishes the coding conventions, formatting standards, and software engineering practices for the Hotel Booking System MVP.

---

## 1. Naming Conventions

The codebase uses standard JavaScript casing conventions:

- **Variables, Properties, and Functions**: `camelCase` (e.g., `checkInDate`, `calculateTotalPrice()`).
- **Classes and Constructor Functions**: `PascalCase` (e.g., `BookingService`, `UserRepository`).
- **Database Tables and Columns**: `snake_case` (e.g., `room_types`, `max_occupancy`).
- **Sequelize Models**: `PascalCase` matching singular name (e.g., `Booking`, `RoomType`).
- **Files**: `kebab-case` or `dot-notation` based on role:
  - Controllers: `auth.controller.js`
  - Routes: `auth.routes.js`
  - Repositories: `user.repository.js`
  - Models: `user.model.js`

---

## 2. Code Formatting & Linting

### Prettier Configurations
A consistent code style is maintained via Prettier using the following settings:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### ESLint Rules
- Require `const` over `let` wherever variables are not reassigned.
- Disallow unused variables (`no-unused-vars`).
- Restrict import nesting depths to improve code structure.

---

## 3. Async Control Flow & Error Handling

### Avoiding Try-Catch Bloat in Controllers
Controllers must avoid nesting individual `try/catch` statements. Instead, use an `asyncHandler` wrapper utility that automatically forwards caught errors to the global error middleware.

* **Pattern**:
  ```javascript
  // src/utils/helpers.js
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  ```

* **Usage**:
  ```javascript
  // src/controllers/auth.controller.js
  const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const session = await authService.authenticateUser(email, password);
    res.status(200).json({ success: true, data: session });
  });
  ```

### Custom Error Framework
Always throw specific operational error subclasses defined in `src/utils/errors.js` rather than raw Error objects.

* **Error Types**:
  - `BadRequestError(message)` (returns HTTP `400`)
  - `UnauthorizedError(message)` (returns HTTP `401`)
  - `ForbiddenError(message)` (returns HTTP `403`)
  - `NotFoundError(message)` (returns HTTP `404`)
  - `ConflictError(message)` (returns HTTP `409`)

---

## 4. Sequelize & SQL Guidelines

### Strict Transaction Encapsulation
Services modifying multiple rows or requiring reads with locks must run within a Sequelize transaction. Passing the transaction context (`t`) as a parameter ensures operations are completed atomically.

```javascript
// Example Service Method
const booking = await sequelize.transaction(async (t) => {
  const room = await roomRepository.findAvailableRoomInType(roomTypeId, checkIn, checkOut, t);
  if (!room) throw new NotFoundError('No rooms available');

  return await bookingRepository.createBookingWithTransaction({
    userId,
    roomId: room.id,
    checkIn,
    checkOut,
    totalPrice
  }, t);
});
```

### Raw Queries
- Avoid writing raw SQL queries. Always use the Sequelize query API (`findAll`, `findOne`, `create`, `update`, `destroy`).
- If custom complex SQL is absolutely required (e.g. for reporting performance), queries must use parameter bindings (`replacements`) to prevent SQL injection.
- Ensure all models define proper timestamps (`createdAt`, `updatedAt`).
