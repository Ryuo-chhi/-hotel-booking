# 04. User Roles and RBAC Matrix

This document defines the Role-Based Access Control (RBAC) model for the Hotel Booking System MVP. It defines user capabilities, restrictions, and the permissions required to access specific backend API scopes.

---

## 1. Actor Definitions

### Guest (Anonymous User)
- **Definition**: Any unauthenticated public visitor accessing the frontend application.
- **Goal**: Browse room types, check pricing, search availability, and register a new account.
- **Constraints**: Cannot lock rooms, initiate checkouts, or view user-specific details.

### Customer (Authenticated User)
- **Definition**: An authenticated user who has signed up.
- **Goal**: Browse and search rooms, book rooms, check out, view active/historical bookings, cancel reservations, and manage their profile details.
- **Constraints**: Can only view or edit their own records. Cannot modify room prices, create new rooms, or view bookings of other users.

### Hotel Manager (Staff User)
- **Definition**: An authenticated internal user responsible for hotel operations.
- **Goal**: View guest booking lists, edit room configurations, manage room prices, adjust statuses (e.g., mark a room out of service), and access basic reports.
- **Constraints**: Cannot perform destructive actions like purging the database, changing global system settings, or promoting users to Admin.

### System Administrator
- **Definition**: Superuser with complete read/write authorization across all tables, models, and environments.
- **Goal**: Maintain system health, manage staff promotions (assigning the Manager role), review system audit logs, and perform migrations or data patches.

---

## 2. RBAC Permissions Matrix

The table below maps roles to specific system actions:

| Action / Capability | Guest | Customer | Manager | Admin | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Register Account** | Yes | No | No | No | Handled by auth route |
| **Authenticate / Login** | Yes | Yes | Yes | Yes | Generates JWT payload |
| **Search Availability** | Yes | Yes | Yes | Yes | Read-only access |
| **Create Booking** | No | Yes | No | Yes | Restricts customer to own ID |
| **Cancel Own Booking** | No | Yes | Yes | Yes | Validates 24h business rule |
| **Cancel Any Booking** | No | No | Yes | Yes | Internal operations only |
| **View Own Bookings** | No | Yes | Yes | Yes | Filters by `userId` |
| **View All Bookings** | No | No | Yes | Yes | Global query, supports filters |
| **Manage Room Types** | No | No | Yes | Yes | Create, Update, Delete room configurations |
| **Manage Rooms** | No | No | Yes | Yes | CRUD on individual room numbers |
| **Promote User to Manager**| No | No | No | Yes | Restrictive control to Admin |
| **Access Financial Reports**| No | No | Yes | Yes | Dynamic query on revenue |

---

## 3. JWT Payload Structure
Role membership is embedded directly into the JWT token to enable stateless role validation inside backend controllers and middlewares.

Example claims:
```json
{
  "userId": 124,
  "email": "customer@email.com",
  "role": "customer",
  "iat": 1690900000,
  "exp": 1690986400
}
```

For middleware validation logic, see [15-security-guidelines.md](file:///d:/CADT/Projects/hotel-booking/docs/security/15-security-guidelines.md) and the codebase template folder `src/middlewares/auth.js`.
