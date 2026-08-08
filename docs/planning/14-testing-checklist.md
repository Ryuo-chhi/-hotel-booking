# 14. Testing Checklist

This document provides a structured verification and testing checklist for the Hotel Booking System MVP, outlining key unit and integration test cases.

---

## 1. Testing Framework Configuration

The project uses the following testing stack:
- **Test Runner**: Jest (`^29.6.0`)
- **API Assertions**: Supertest (`^6.3.3`)
- **Database Sandbox**: Dedicated test database (`hotel_booking_test`) configured in `.env.test`.

---

## 2. Test Execution Commands

To execute tests on the command line:
- Run all tests: `npm run test`
- Run unit tests only: `npm run test:unit`
- Run integration tests only: `npm run test:integration`
- Generate test coverage reports: `npm run test:coverage`

---

## 3. Detailed Testing Checklists

### 3.1: Unit Test Checklist (Service Layer)

- [ ] **Auth Service Tests**
  - Verify that password hashing converts plain text into a bcrypt hash.
  - Verify that matching credentials returns a valid JWT session.
  - Verify that non-matching credentials throws an `UnauthorizedError`.

- [ ] **Pricing Calculation Logic**
  - Verify that a standard 3-night mid-week stay calculates base rate $\times$ 3.
  - Verify that weekend markups (Friday/Saturday nights) apply a 20% surcharge correctly.
  - Verify that a 10% tax rate is correctly applied to the final calculated subtotal.

- [ ] **Date Validation Rules**
  - Verify that check-out before check-in triggers a validation error.
  - Verify that check-in dates in the past are rejected.
  - Verify that booking durations exceeding 30 nights are rejected.

---

### 3.2: Integration Test Checklist (API Layer)

- [ ] **Concurrency & Overlap Engine**
  - **Scenario**: Simulate two concurrent customers attempting to book the exact same room type for overlapping dates.
  - **Expected Result**: One request succeeds with `201 Created` and sets booking status to `Pending`. The other request fails with `409 Conflict` (or returns no availability) without causing database deadlocks.

- [ ] **RBAC Authorization Safeguards**
  - Verify that an anonymous guest cannot access admin configuration APIs (`POST /api/rooms` returns `401 Unauthorized`).
  - Verify that a customer role cannot update room types (`PATCH /api/room-types/:id` returns `403 Forbidden`).
  - Verify that a manager can update room statuses and list all customer booking records.

- [ ] **Booking Expiration Cron**
  - Verify that running the expiration cron job transition unpaid bookings older than 10 minutes from `Pending` to `Cancelled`.
  - Verify that released rooms immediately reappear as available in room search queries.

- [ ] **Cancellation Window Enforcement**
  - Verify that cancelling a reservation 48 hours prior to check-in succeeds.
  - Verify that cancelling a reservation 12 hours prior to check-in is rejected with a `400 Bad Request`.
