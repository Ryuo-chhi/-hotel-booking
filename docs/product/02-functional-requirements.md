# 02. Functional Requirements

This document specifies the core functional capabilities of the Hotel Booking System MVP. Each capability is defined with distinct actions, user roles, inputs, validation criteria, and system responses.

---

## 1. User Authentication & Authorization
The system must support secure signup, login, and authorization checks. For security implementation details, see [15-security-guidelines.md](file:///d:/CADT/Projects/hotel-booking/docs/security/15-security-guidelines.md).

### FR-1.1: Customer Self-Registration
- **Actor**: Guest (Anonymous User)
- **Description**: Allows a guest to register an account to book hotel rooms.
- **Inputs**: Full Name, Email, Password, Phone Number.
- **Validations**:
  - Email must be unique and valid.
  - Password must be a minimum of 8 characters, containing at least one uppercase letter, one lowercase letter, one number, and one special character.
- **System Action**: Hashes the password and saves the user record with the `customer` role.

### FR-1.2: Identity Authentication (Login)
- **Actor**: Registered User (Guest, Customer, Manager, Admin)
- **Inputs**: Email, Password.
- **System Action**: Verifies credentials against the hashed password. On success, issues a secure JSON Web Token (JWT). On failure, returns a generic `401 Unauthorized` error message.

### FR-1.3: User Profile Retrieval
- **Actor**: Authenticated User
- **Description**: Returns profile details for the currently logged-in user.
- **System Action**: Decodes JWT and queries database for corresponding user metadata.

---

## 2. Room Search & Filtering
The discovery service allows users to find available rooms matching their criteria.

### FR-2.1: Dynamic Room Search
- **Actor**: Guest / Customer / Admin
- **Inputs**: Check-in Date, Check-out Date, Guest Count (Adults/Children).
- **Validations**:
  - Check-in Date must be today or in the future.
  - Check-out Date must be after the Check-in Date.
  - Guest Count must be greater than zero.
- **System Action**: Scans database for room types that accommodate the guest count and do not have active booking overlapping with the selected dates. See [07-business-rules.md](file:///d:/CADT/Projects/hotel-booking/docs/business/07-business-rules.md) for details on overlap logic.

### FR-2.2: Search Filtering
- **Actor**: Guest / Customer / Admin
- **Inputs**: Price Min/Max (optional), Room Type (optional - e.g., Deluxe, Suite), Amenities (optional - e.g., Wi-Fi, Pool view).
- **System Action**: Filters active search results dynamically on the backend to avoid sending unnecessary payloads.

---

## 3. Booking Engine Lifecycle
The booking engine governs reservation creation, payment association, status updates, and cancellations.

```
       BOOKING STATE TRANSITIONS
       
      +------------------------+
      |        Pending         |  <-- Room inventory is locked for 10 minutes
      +------------------------+
         |                 |
         | Payment Success | Payment Fails / Timeout
         v                 v
+-----------------+   +-----------------+
|    Confirmed    |   |    Cancelled    |
+-----------------+   +-----------------+
         |                 ^
         | Check-out Done  | Cancelled by Customer
         v                 |
+-----------------+        |
|    Completed    | -------+
+-----------------+
```

### FR-3.1: Reservation Creation
- **Actor**: Customer
- **Inputs**: RoomTypeId, Check-in Date, Check-out Date, Guest Details.
- **System Action**:
  - Initializes booking transaction (with row-level database locking).
  - Calculates total price based on rate rules (see [07-business-rules.md](file:///d:/CADT/Projects/hotel-booking/docs/business/07-business-rules.md)).
  - Registers booking status as `Pending` and starts a 10-minute payment window.

### FR-3.2: Booking Cancellation
- **Actor**: Customer / Hotel Manager
- **Inputs**: Booking ID.
- **System Action**: Updates booking status to `Cancelled` and releases the room lock. If cancellation is triggered by the customer, validates cancellation window constraints (minimum 24 hours prior to check-in).

### FR-3.3: Booking Retrieval
- **Actor**: Customer (for own bookings) / Hotel Manager (for all bookings)
- **Inputs**: Query filters (status, date range).
- **System Action**: Returns paginated list of bookings.

---

## 4. Payment Mocking (Stripe Checkout API)
To support a mock checkout sequence in the MVP:

### FR-4.1: Checkout Initialization
- **Actor**: Customer
- **Inputs**: Booking ID.
- **System Action**: Simulates contact with payment processor (e.g., Stripe) by creating a mock transaction record with a unique transaction reference and generates a redirect URL.

### FR-4.2: Payment Callback Verification
- **Actor**: Webhook / Client Callback
- **Inputs**: Booking ID, Mock Status (Success/Fail).
- **System Action**:
  - If "Success": Updates Booking status to `Confirmed`, updates transaction status to `Paid`.
  - If "Fail" or timeout: Marks Booking status as `Cancelled` and releases room back into inventory.

---

## 5. Administrative Controls
Provides capabilities for administrators and managers to manage rooms and monitor performance.

### FR-5.1: Room and Room Type CRUD
- **Actor**: Hotel Manager / Admin
- **Description**: Manage room metadata (e.g., Suite, Double, Deluxe) and physical rooms.
- **Operations**:
  - Add new Room Types (base rate, capacity, amenities).
  - Add individual room units and assign them to Room Types.
  - Temporarily disable rooms for maintenance.

### FR-5.2: Basic Analytics and Occupancy Reports
- **Actor**: Hotel Manager / Admin
- **Description**: High-level dashboards to monitor MVP operations.
- **Metrics**: Total active bookings, vacancy rates, generated revenue, and popular room types.
