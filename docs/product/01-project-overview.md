# 01. Project Overview

## 1. Introduction & Business Vision
The **Hotel Booking System MVP** is a production-ready, high-performance web application designed to streamline hotel room discovery, availability tracking, booking lifecycle management, and secure checkouts. By offering an intuitive interface for guests and a robust administrative control panel for hotel managers, this platform aims to maximize room occupancy, minimize double-booking incidents through transaction isolation, and provide high availability.

### Business Value Proposition
- **High Booking Conversion**: A frictionless search-to-checkout user journey.
- **Zero Double-Bookings**: Rigid inventory control utilizing database transaction locks.
- **Scale-Ready Foundations**: A clean architecture that accommodates future enhancements like loyalty points, multi-tenant hotel networks, and machine-learning-driven dynamic pricing.

---

## 2. Scope of the 10-Day MVP
The MVP is scoped to a high-tempo 10-day engineering phase, focusing strictly on core value-delivery paths.

```
       10-DAY MVP SCOPE
+-----------------------------+
|  User Authentication & RBAC |  <-- Guest, Customer, Hotel Manager, Admin
+-----------------------------+
|  Room Search & Filtering    |  <-- Date, capacity, price, real-time status
+-----------------------------+
|  Booking Lifecycle Engine   |  <-- Pending, Confirmed, Cancelled, Completed
+-----------------------------+
|  Stripe Mock Payment        |  <-- Transaction safety & invoice generation
+-----------------------------+
|  Basic Admin Dashboard      |  <-- Room management & occupancy reports
+-----------------------------+
```

### Out-of-Scope for MVP (Deferred to Phase 2)
- Multi-hotel chains (MVP targets a single hotel with multiple room types).
- Real-time customer chat or support ticketing.
- Advanced analytics engines and marketing email campaigns.
- Native mobile applications (MVP is web-responsive).

---

## 3. Technology Stack & Rationale

We have selected a battle-tested, standard enterprise JavaScript stack to ensure rapid delivery, type safety (via JSDoc/ESLint), and simple deployment topologies.

| Tier | Technology | Selected Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `^18.2.0` | Component-driven architecture, virtual DOM for reactive UI, large ecosystem. |
| **Backend** | Express.js | `^4.18.2` | Minimalist, unopinionated web framework, ideal for building high-throughput APIs. |
| **Database** | MySQL | `8.0` | Enterprise-grade relational database supporting ACID transactions, complex joins, and row-level locking. |
| **ORM** | Sequelize | `^6.37.0` | Promise-based Node.js ORM, simplified migration schemas, and powerful transaction wrappers. |
| **Auth** | JWT | `^9.0.0` | Stateless authentication, allowing scale-out backend service nodes. |

---

## 4. Architectural Pattern: Controller-Service-Repository

To prevent spaghetti code and maintain a clean separation of concerns, the backend is organized into three distinct layers:

```
+------------------+     HTTP Request
|  Express Router  | -------------------+
+------------------+                    |
         |                              v
+------------------+            +---------------+
|    Controller    | ---------> |  Validators   | (Payload schema validation)
+------------------+            +---------------+
         |
         v
+------------------+
|     Service      | (Core business logic, transaction boundaries)
+------------------+
         |
         v
+------------------+
|    Repository    | (Data Access Object, raw Sequelize abstraction)
+------------------+
         |
         v
+------------------+
| Sequelize Model  | (Database schema representation)
+------------------+
```

### Why This Design Pattern?
1. **Separation of Concerns**: Controllers only handle HTTP details (status codes, headers). Services contain the business logic. Repositories handle database querying.
2. **Mockability & Testability**: Since database queries are isolated in Repositories, Services can be unit-tested easily by mocking repository methods without running database engines.
3. **Flexibility**: If we decide to swap Sequelize for another tool (e.g., Prisma or raw SQL), we only rewrite the Repository layer. The Service layer remains completely untouched.

---

## 5. Blueprint Cross-References
To navigate this blueprint, refer to the following related documents:
- For database schemas and fields, see [08-database-design.md](file:///d:/CADT/Projects/hotel-booking/docs/database/08-database-design.md).
- For API endpoints and response payloads, see [10-api-specification.md](file:///d:/CADT/Projects/hotel-booking/docs/api/10-api-specification.md).
- For security controls, see [15-security-guidelines.md](file:///d:/CADT/Projects/hotel-booking/docs/security/15-security-guidelines.md).
- For project folder structure, see [11-folder-architecture.md](file:///d:/CADT/Projects/hotel-booking/docs/architecture/11-folder-architecture.md).
