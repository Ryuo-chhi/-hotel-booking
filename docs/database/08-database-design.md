# 08. Database Design

This document details the relational database schema design, including tables, data types, constraints, indexes, and primary/foreign key mappings.

---

## 1. Schema Overview

The database is built on **MySQL 8.0** and uses **Sequelize** as the ORM. The engine must be configured to use **InnoDB** to guarantee support for transactions, row-level locking, and foreign key constraints.

The design contains five primary tables:
1. `users`
2. `room_types`
3. `rooms`
4. `bookings`
5. `transactions`

---

## 2. Table Definitions

### 2.1: `users`
Stores all account details, credentials, and access roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier for the user. |
| `full_name` | VARCHAR(100) | NOT NULL | Full name of the user. |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | Email used for logging in. |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt). |
| `phone_number` | VARCHAR(20) | NULL | Contact phone number. |
| `role` | ENUM('customer', 'manager', 'admin') | NOT NULL, DEFAULT 'customer' | System access level (RBAC). |
| `created_at` | DATETIME | NOT NULL | Timestamp of record creation. |
| `updated_at` | DATETIME | NOT NULL | Timestamp of last modification. |

* **Indexes**:
  - `idx_users_email` (UNIQUE): On `email` for credential lookup.

---

### 2.2: `room_types`
Defines categories of rooms (e.g. Deluxe, Suite) with rates and capacity.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier for the room type. |
| `name` | VARCHAR(50) | NOT NULL, UNIQUE | E.g., 'Deluxe King', 'Family Suite'. |
| `description` | TEXT | NULL | Details about the room type. |
| `base_rate` | DECIMAL(10, 2) | NOT NULL | Cost per night (mid-week). |
| `max_occupancy` | INT | NOT NULL | Maximum number of guests allowed. |
| `amenities` | JSON | NULL | Array of strings (e.g., `["wifi", "tv"]`). |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp. |
| `updated_at` | DATETIME | NOT NULL | Last modification timestamp. |

---

### 2.3: `rooms`
Represents individual physical rooms in the hotel.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique identifier for the room unit. |
| `room_number` | VARCHAR(10) | NOT NULL, UNIQUE | Room label (e.g., '101', '304-B'). |
| `room_type_id` | INT | FK -> `room_types(id)` | Associated room category. |
| `status` | ENUM('active', 'maintenance') | NOT NULL, DEFAULT 'active' | Operational status of the room. |
| `created_at` | DATETIME | NOT NULL | Record creation timestamp. |
| `updated_at` | DATETIME | NOT NULL | Last modification timestamp. |

* **Indexes**:
  - `idx_rooms_type` : On `room_type_id` for quick joins during searches.

---

### 2.4: `bookings`
Stores reservation records and status.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique booking reference. |
| `user_id` | INT | FK -> `users(id)` | Customer who booked the room. |
| `room_id` | INT | FK -> `rooms(id)` | Assigned physical room. |
| `check_in_date` | DATE | NOT NULL | Arrival date. |
| `check_out_date`| DATE | NOT NULL | Departure date. |
| `total_price` | DECIMAL(10, 2) | NOT NULL | Sum total price computed. |
| `status` | ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') | NOT NULL, DEFAULT 'Pending' | Booking lifecycle state. |
| `created_at` | DATETIME | NOT NULL | Time booking was initiated. |
| `updated_at` | DATETIME | NOT NULL | Last modification timestamp. |

* **Indexes**:
  - `idx_bookings_dates`: Composite index on `(check_in_date, check_out_date)` to accelerate overlap query executions.
  - `idx_bookings_user`: On `user_id` to list customer booking history.

---

### 2.5: `transactions`
Records financial transactions related to bookings.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AUTO_INCREMENT | Unique transaction reference. |
| `booking_id` | INT | FK -> `bookings(id)` | Associated booking. |
| `payment_gateway_ref` | VARCHAR(100) | NULL | Reference key returned by processor (Stripe). |
| `amount` | DECIMAL(10, 2) | NOT NULL | Amount transacted. |
| `status` | ENUM('Pending', 'Paid', 'Failed', 'Refunded') | NOT NULL, DEFAULT 'Pending' | Payment processor outcome. |
| `created_at` | DATETIME | NOT NULL | Creation timestamp. |
| `updated_at` | DATETIME | NOT NULL | Last modification timestamp. |
