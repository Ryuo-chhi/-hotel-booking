# 10. API Specification

This document details the REST API specifications for the Hotel Booking System MVP. All endpoints consume and return JSON payloads.

---

## 1. Global Standards & Envelope Formats

### Success Response Envelope
All successful requests return a `2xx` status and match this format:
```json
{
  "success": true,
  "data": {}
}
```

### Error Response Envelope
All failed requests return a `4xx` or `5xx` status and match this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error explanation",
    "details": []
  }
}
```

---

## 2. Authentication API (`/api/auth`)

### 2.1: Register User
* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Authentication**: None
* **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "phoneNumber": "+1234567890"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 42,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```
* **Errors**: `400 Bad Request` (Validation errors or email already exists).

### 2.2: Login / Authenticate
* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 42,
        "email": "jane@example.com",
        "role": "customer"
      }
    }
  }
  ```
* **Errors**: `401 Unauthorized` (Invalid credentials).

### 2.3: Get Profile Details
* **Method**: `GET`
* **Path**: `/api/auth/profile`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 42,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer",
      "phoneNumber": "+1234567890"
    }
  }
  ```

---

## 3. Search & Rooms API (`/api/room-types`, `/api/rooms`)

### 3.1: Search Room Availability
* **Method**: `GET`
* **Path**: `/api/room-types/available`
* **Query Parameters**:
  - `checkIn` (YYYY-MM-DD, required)
  - `checkOut` (YYYY-MM-DD, required)
  - `guests` (Integer, required)
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Deluxe King",
        "description": "Spacious room with king-size bed and city view.",
        "baseRate": "150.00",
        "maxOccupancy": 2,
        "amenities": ["wifi", "tv", "mini-bar"],
        "availableRoomsCount": 5
      }
    ]
  }
  ```

### 3.2: Create Room (Admin/Manager Only)
* **Method**: `POST`
* **Path**: `/api/rooms`
* **Headers**: `Authorization: Bearer <token>` (Staff JWT)
* **Request Body**:
  ```json
  {
    "roomNumber": "101",
    "roomTypeId": 1
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 12,
      "roomNumber": "101",
      "roomTypeId": 1,
      "status": "active"
    }
  }
  ```

---

## 4. Booking API (`/api/bookings`)

### 4.1: Create Booking (Initiate Hold)
* **Method**: `POST`
* **Path**: `/api/bookings`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "roomTypeId": 1,
    "checkInDate": "2026-08-15",
    "checkOutDate": "2026-08-18"
  }
  ```
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 108,
      "userId": 42,
      "roomId": 5,
      "checkInDate": "2026-08-15",
      "checkOutDate": "2026-08-18",
      "totalPrice": 450.00,
      "status": "Pending",
      "expiresAt": "2026-08-01T21:33:14Z"
    }
  }
  ```

### 4.2: Cancel Booking
* **Method**: `POST`
* **Path**: `/api/bookings/:id/cancel`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "bookingId": 108,
      "status": "Cancelled"
    }
  }
  ```
* **Errors**: `400 Bad Request` (If cancelled less than 24h prior to check-in).

---

## 5. Payments Mock API (`/api/payments`)

### 5.1: Initial Checkout session
* **Method**: `POST`
* **Path**: `/api/payments/checkout`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "bookingId": 108
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "redirectUrl": "https://checkout.stripe.mock/pay/cs_12345",
      "transactionId": 89
    }
  }
  ```

### 5.2: Mock Payment Webhook (Processor Callback Simulation)
* **Method**: `POST`
* **Path**: `/api/payments/webhook`
* **Request Body**:
  ```json
  {
    "bookingId": 108,
    "status": "Paid",
    "stripeReference": "ch_mock_991823"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "bookingId": 108,
      "bookingStatus": "Confirmed",
      "transactionStatus": "Paid"
    }
  }
  ```
