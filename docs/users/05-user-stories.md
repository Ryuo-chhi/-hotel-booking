# 05. User Stories

This document presents agile user stories for the Hotel Booking System MVP, including clear descriptions and acceptance criteria.

---

## 1. Authentication & User Accounts

### US-1.1: Customer Registration
* **As a** Guest (unauthenticated visitor)
* **I want to** register an account using my email and a secure password
* **So that** I can access the system, book rooms, and track my booking history.
* **Acceptance Criteria**:
  - The system must validate email uniqueness and formatting.
  - The password must comply with complexity rules (8+ chars, uppercase, lowercase, number, special char).
  - Upon successful registration, the database must store the customer password as a bcrypt hash.
  - Returns a success status code (`201 Created`) with a clean JSON profile payload (no password returned).

### US-1.2: Identity Authentication
* **As a** Registered User
* **I want to** log in with my email and password
* **So that** I can retrieve my secure session token.
* **Acceptance Criteria**:
  - The system returns a JWT token if credentials match.
  - The system returns `401 Unauthorized` for invalid credentials.
  - The token must contain claims for `userId`, `email`, and `role`.

---

## 2. Search & Availability

### US-2.1: Available Room Search
* **As a** Guest or Customer
* **I want to** search for available rooms by specifying my check-in date, check-out date, and guest count
* **So that** I can see which room types can accommodate my party during those dates.
* **Acceptance Criteria**:
  - Search fields must validate that Check-in Date is in the future.
  - Result list must exclude room types that do not have capacity for the requested guest count.
  - Result list must only list room types where active inventory exists (i.e. not fully booked or undergoing maintenance).

---

## 3. Booking & Checkout Lifecycle

### US-3.1: Reserving a Room
* **As a** Customer
* **I want to** select a room type and create a booking
* **So that** the system holds the room for me while I submit payment.
* **Acceptance Criteria**:
  - Creating a booking sets the booking state to `Pending`.
  - The system locks the inventory immediately.
  - A 10-minute expiry timer is initialized. If payment is not verified within 10 minutes, the booking is automatically transitioned to `Cancelled` and the room is released back to inventory.
  - Users receive a calculation breakdown including room rates, duration, tax, and final amount.

### US-3.2: Paying for a Booking
* **As a** Customer
* **I want to** proceed to checkout and mock a credit card payment
* **So that** my booking is finalized.
* **Acceptance Criteria**:
  - The user triggers checkout, redirecting to a mock Stripe integration.
  - A successful payment callback updates the booking status to `Confirmed` and writes a transaction record.
  - A failed payment callback sets the booking status to `Cancelled` and releases the room lock.

### US-3.3: Cancelling a Reservation
* **As a** Customer
* **I want to** cancel my booking
* **So that** I can release the room.
* **Acceptance Criteria**:
  - A user can only cancel bookings with status `Confirmed` or `Pending`.
  - Cancellations must be requested at least 24 hours prior to the check-in date (the cancellation threshold).
  - Once cancelled, the system updates the booking status to `Cancelled` and releases the room immediately.

---

## 4. Hotel Administration

### US-4.1: Managing Room Inventory
* **As a** Hotel Manager
* **I want to** create and update room types and individual room configurations
* **So that** the web platform accurately reflects what rooms are available.
* **Acceptance Criteria**:
  - The user must prove they have the `manager` or `admin` role via their JWT.
  - Managers can update base rates, capacity limits, descriptions, and amenities.
  - Managers can mark a specific room as `maintenance` to dynamically pull it from active searches.
