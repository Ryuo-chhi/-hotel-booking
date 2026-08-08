# 07. Business Rules

This document specifies the business rules governing system actions, calculations, constraints, and data integrity checks in the Hotel Booking System MVP.

---

## 1. Booking & Date Constraints
All booking attempts must satisfy the following date validations:

### BR-1.1: Date Logic Validations
- **Rule**: Check-in Date must be greater than or equal to `TODAY` (local time of the hotel).
- **Rule**: Check-out Date must be at least 1 day after the Check-in Date.
- **Rule**: The maximum duration of a single booking is capped at **30 consecutive nights**.
- **Exception**: Attempting to book dates outside this window must immediately fail validation and return a `400 Bad Request` with a descriptive message.

### BR-1.2: Guest Capacity Matching
- **Rule**: A room type cannot be booked if the guest count (Adults + Children) exceeds the `max_occupancy` capacity defined for that Room Type.

---

## 2. Cancellation and Refund Policy

### BR-2.1: Cancellation Window
- **Rule**: Customers can cancel a `Confirmed` booking up to **24 hours prior** to the check-in time (defined as 14:00 PM local hotel time on the check-in date).
- **Example**: If Check-in Date is Aug 15:
  - Check-in time is Aug 15, 14:00 PM.
  - The final time to cancel is Aug 14, 13:59 PM.
- **Enforcement**: If a cancellation request comes in past this window, the system must reject it with a `400 Bad Request` ("Cancellations must be made at least 24 hours prior to check-in").

### BR-2.2: Mock Payment Refunds
- **Rule**: Upon a valid cancellation, the system triggers a refund action against the mock payment gateway, sets booking status to `Cancelled`, and sets transaction status to `Refunded`.

---

## 3. Dynamic Pricing & Billing Calculations

### BR-3.1: Rate Formula
- **Rule**: The total price is computed using the base rate of the Room Type, weekend markups, and taxes.
- **Formula**:
  $$\text{Total Price} = \left( \sum_{d \in \text{Nights}} \text{Rate}(d) \right) \times (1 + \text{Tax Rate})$$
  Where:
  - $\text{Rate}(d) = \text{base\_rate} \times 1.2$ if $d$ falls on a Friday or Saturday night (Weekend Markup).
  - $\text{Rate}(d) = \text{base\_rate}$ for Sunday through Thursday.
  - $\text{Tax Rate} = 0.10$ (10% state occupancy tax).

---

## 4. Room Allocation & Concurrency Control
To prevent double-bookings, the system utilizes a strict transactional reservation system.

### BR-4.1: Atomic Allocation (Race Conditions)
- **Rule**: When a customer requests a booking, the system must verify availability and write the pending booking atomically within a write-lock database transaction.
- **Mechanism**:
  ```sql
  -- Pseudocode representation of Sequelize transaction lock
  SELECT id, status FROM rooms
  WHERE room_type_id = :roomTypeId
    AND status = 'active'
    AND id NOT IN (
      SELECT DISTINCT room_id FROM bookings
      WHERE status IN ('Pending', 'Confirmed', 'Completed')
        AND (check_in_date < :checkOutDate AND check_out_date > :checkInDate)
    )
  FOR UPDATE;
  ```
- **Action**: If a room is found, lock that row, create the Booking record tied to that `room_id`, and commit. If no rooms are returned, abort transaction and return a "Sold Out" response.

### BR-4.2: Expiry of Unpaid Bookings
- **Rule**: A booking initialized in a `Pending` state is reserved for exactly **10 minutes**.
- **Action**: A background cron job runs every 5 minutes checking for bookings where:
  - `status = 'Pending'`
  - `createdAt` is older than 10 minutes from `NOW()`.
- **System Response**: Clears the reservation status to `Cancelled` and releases the room lock.
- **Reference**: For implementation of the background cleaning routine, see [11-folder-architecture.md](file:///d:/CADT/Projects/hotel-booking/docs/architecture/11-folder-architecture.md) under the utils/cron description.
