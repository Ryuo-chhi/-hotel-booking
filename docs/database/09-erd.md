# 09. Entity Relationship Diagram (ERD)

This document visualizes the database relations, tables, primary/foreign keys, and cardinalities of the Hotel Booking System database using a Mermaid.js diagram.

---

## 1. Mermaid.js Entity-Relationship Diagram

```mermaid
erDiagram
    users {
        int id PK
        varchar full_name
        varchar email UK
        varchar password
        varchar phone_number
        enum role "customer, manager, admin"
        datetime created_at
        datetime updated_at
    }

    room_types {
        int id PK
        varchar name UK
        text description
        decimal base_rate
        int max_occupancy
        json amenities
        datetime created_at
        datetime updated_at
    }

    rooms {
        int id PK
        int room_type_id FK
        text image_url
        enum status "available, occupied, maintenance"
        datetime created_at
        datetime updated_at
    }


    bookings {
        int id PK
        int user_id FK
        int room_id FK
        date check_in_date
        date check_out_date
        decimal total_price
        enum status "Pending, Confirmed, Completed, Cancelled"
        datetime created_at
        datetime updated_at
    }

    transactions {
        int id PK
        int booking_id FK
        varchar payment_gateway_ref
        decimal amount
        enum status "Pending, Paid, Failed, Refunded"
        datetime created_at
        datetime updated_at
    }

    users ||--o{ bookings : "creates"
    room_types ||--|{ rooms : "defines"
    rooms ||--o{ bookings : "receives"
    bookings ||--|| transactions : "settles"
```

---

## 2. Cardinality Descriptions

1. **Users to Bookings (`one-to-many`)**: A user can create zero or many bookings over time; a booking must belong to exactly one user.
2. **Room Types to Rooms (`one-to-many`)**: A room type definition (e.g. Deluxe Suite) can describe many individual rooms; an individual room belongs to exactly one room type.
3. **Rooms to Bookings (`one-to-many`)**: A physical room can be assigned to multiple non-overlapping bookings; a booking is assigned to exactly one physical room.
4. **Bookings to Transactions (`one-to-one`)**: A booking initiates exactly one checkout transaction; a transaction is mapped back to exactly one booking record.
