# 15. Security Guidelines

This document details the security principles, middleware configurations, encryption configurations, and threat mitigation practices for the Hotel Booking System MVP.

---

## 1. Authentication & Token Management (JWT)

To ensure secure, stateless request authentication, the system implements JSON Web Tokens (JWT).

```
         JWT AUTHENTICATION SEQUENCE
         
Client                    API Server               MySQL DB
  |                           |                       |
  |--- POST /auth/login ----->|                       |
  |    (email/password)       |--- verify credentials |
  |                           |<-- credentials OK ----|
  |<-- Return Signed JWT -----|                       |
  |                           |                       |
  |--- GET /auth/profile ---->|                       |
  |    (Header: Bearer JWT)   |--- decode & verify    |
  |                           |    (Signature checking)
  |<-- Return JSON Profile ---|                       |
```

### JWT Security Guidelines
- **Token Type**: HMAC SHA-256 (`HS256`).
- **Secret Management**: The signature secret must be loaded from `process.env.JWT_SECRET` and have a minimum length of 64 characters. It must never be committed to git.
- **Expiration**:
  - Access Token: Expiress in **1 hour** (`1h`).
  - Refresh Token (future feature): Expires in **7 days** (`7d`).
- **Storage**: The client should store the JWT access token in memory.

---

## 2. Password Hashing & Credentials

All user passwords must be hashed using the **bcryptjs** algorithm before storage.

- **Hash Cost**: Set to `12` rounds to resist brute-force attacks while maintaining acceptable server CPU load times.
- **Verification Rule**: Never write custom comparison functions. Always use `bcrypt.compare(candidatePassword, hashedPassword)`.
- **Credential Leak Protection**: The Sequelize User model must define a default scope that excludes the `password` field from queries, ensuring passwords are not returned in API responses.
  ```javascript
  // src/models/user.model.js
  // Default scope setup
  defaultScope: {
    attributes: { exclude: ['password'] }
  }
  ```

---

## 3. Threat Mitigation Strategies

### 3.1: SQL Injection (SQLi)
- **Constraint**: raw sql queries are banned in the MVP.
- **ORM Protections**: Rely exclusively on Sequelize query builders which parameterize query arguments automatically.
- **Raw Query Escape**: If raw queries must be used (e.g. specialized DB operations), always use `replacements` to escape user input:
  ```javascript
  // Good: Parameterized Bindings
  sequelize.query('SELECT * FROM bookings WHERE id = :id', {
    replacements: { id: req.params.id },
    type: QueryTypes.SELECT
  });
  ```

### 3.2: CORS Setup
Allow requests only from verified clients. Configure CORS middleware using:
```javascript
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours preflight cache
};
app.use(cors(corsOptions));
```

### 3.3: Rate Limiting
To prevent Denial of Service (DoS) and brute-force password cracking attempts, configure rate limiters inside `src/middlewares/rate-limiter.middleware.js`:
- **Auth Limiter**: Applied to `/api/auth/login` and `/api/auth/register`. Capped at `5` attempts per 15 minutes per IP address.
- **Global API Limiter**: Applied globally to all routes. Capped at `100` requests per 15 minutes per IP address.

---

## 4. Role-Based Access Control (RBAC) Middleware

Permissions are validated using an Express middleware that checks the role claim on the decoded JWT payload.

```javascript
// src/middlewares/auth.middleware.js (Reference Interface)
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Attached by verifyToken middleware

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ACCESS',
          message: 'You do not have permission to perform this action.'
        }
      });
    }
    next();
  };
};
```
