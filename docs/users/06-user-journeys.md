# 06. User Journeys

This document details the step-by-step journeys for core user personas interacting with the Hotel Booking System MVP.

---

## 1. Journey 1: Customer Searching and Booking a Room

* **Persona**: Sarah (Customer - Leisure traveler looking for a weekend getaway)
* **Goal**: Find a deluxe room for 2 adults, book it, and complete payment securely.

```
       SARAH'S BOOKING JOURNEY MAP
       
       (1) Search            (2) Select Room         (3) Reserve Room        (4) Payment
   +-------------------+  +-------------------+  +-------------------+  +-------------------+
   | Check-in/out dates|  | Browses options,  |  | Reviews pricing,  |  | Enters payment,   |
   | and guests entered|  | clicks 'Book Now' |  | creates 'Pending' |  | gets confirmation |
   +-------------------+  +-------------------+  +-------------------+  +-------------------+
             |                      |                      |                      |
      GET /room-types/       POST /bookings/        POST /payments/        Webhook/Redirection
         available            (Inventory Lock)          (Stripe)
```

| Step | User Action | System Action | Touchpoints / APIs | Emotion / Friction Point |
| :--- | :--- | :--- | :--- | :--- |
| **1. Search** | Sarah enters dates: Aug 15 - Aug 18, 2 guests, and clicks "Search". | Parses parameters, checks constraints (dates in future), queries DB for available rooms. | `GET /api/room-types/available` | *Neutral*: Needs accurate, fast room listings. |
| **2. Selection** | Sarah reviews available room categories, selects "Deluxe Suite" ($150/night), clicks "Book Now". | Fetches room type details, checks active rates, and routes user to booking preview. | `GET /api/room-types/:id` | *Interested*: Expects clean UI with transparent base pricing. |
| **3. Reservation**| Sarah verifies booking duration (3 nights = $450) and clicks "Confirm Booking". | Begins a database transaction. Acquires row lock. Creates booking record in `Pending` state. Initializes 10-minute hold. | `POST /api/bookings` | *Anxious*: Wants to ensure the room is locked and won't be sold out. |
| **4. Payment** | Sarah is routed to Checkout. She inputs card information and clicks "Pay". | Interfaces with the Payment service. Stripe mock confirms charge. Triggers webhook. Updates status to `Confirmed`. | `POST /api/payments/checkout` | *Friction*: Entering billing info. System must handle transaction failures gracefully. |
| **5. Confirmation**| Redirected back to application showing success confirmation screen. | Sends invoice details, renders receipt details. | `GET /api/bookings/:id` | *Delighted*: Instant booking confirmation, invoice copy downloadable. |

---

## 2. Journey 2: Hotel Manager Managing Room Maintenance

* **Persona**: Marcus (Hotel Manager - Oversees daily operations)
* **Goal**: Temporarily disable Room 301 due to a plumbing issue, preventing guests from booking it.

| Step | User Action | System Action | Touchpoints / APIs | Emotion / Friction Point |
| :--- | :--- | :--- | :--- | :--- |
| **1. Authenticate**| Marcus logs in via staff portal. | Verifies credentials, issues JWT token containing `role: "manager"`. | `POST /api/auth/login` | *Neutral*: Needs fast, secure access to dashboards. |
| **2. Access Rooms**| Marcus clicks "Room Inventory" dashboard link. | Requests active rooms list with their parent Room Types. | `GET /api/rooms` | *Focused*: Needs simple UI showing room status list clearly. |
| **3. Select Room** | Marcus locates Room "301" (Deluxe category) and clicks "Edit Status". | Fetches specific metadata for Room 301. | `GET /api/rooms/301` | *Focused*: Wants to change status with minimal clicks. |
| **4. Toggle Status**| Selects "Maintenance" from the dropdown menu and clicks "Save". | Updates Room database column `status` to `'maintenance'`. | `PATCH /api/rooms/301` | *Relieved*: Action should immediately take the room off search pools. |
| **5. Verification**| Marcus searches for room availability on check-in screen to verify Room 301 is excluded. | Search query filters out Room 301. | `GET /api/room-types/available` | *Satisfied*: Confirmation that room is locked from customers. |
