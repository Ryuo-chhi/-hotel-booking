# 03. Non-Functional Requirements

This document defines the quality attributes, design constraints, and technical benchmarks required of the Hotel Booking System MVP.

---

## 1. Scalability & Performance

### NFR-1.1: API Latency Targets
- **Requirement**: The system must achieve a sub-200ms latency for 95% (p95) of all read API requests (e.g., room search, profile lookups) under a concurrent load of up to 100 requests per second.
- **Implementation**:
  - Implement indexes on foreign keys and frequently queried fields (e.g., `bookings(check_in_date, check_out_date)`).
  - Use database connection pooling with Sequelize (minimum: 5 connections, maximum: 30 connections) to avoid connection overhead.

### NFR-1.2: Concurrency & Lock Resolution
- **Requirement**: The inventory allocation process must handle concurrent booking attempts for the same room without database deadlocks or double-booking.
- **Implementation**:
  - Leverage database transactions (`Sequelize.transaction`) combined with row-level locks (`SELECT ... FOR UPDATE` via `lock: transaction.LOCK.UPDATE`).
  - Cap query duration limits for locking requests to 3000ms. If a lock cannot be acquired within 3 seconds, abort and return a busy error status.

---

## 2. Availability & Reliability

### NFR-2.1: Target Uptime
- **Requirement**: The API service must aim for 99.9% availability over any 30-day calendar period.
- **Implementation**:
  - Design the Express.js server to be completely stateless, allowing it to run behind a load balancer (e.g., NGINX or AWS ALB) across multiple nodes.
  - Implement dynamic environment configurations to make sure the app recovers instantly on crash restarts.

### NFR-2.2: Fault Tolerance
- **Requirement**: System failures (e.g., payment processor downtime, MySQL connection dropouts) must be handled gracefully without corrupting data or exposing raw system stack traces.
- **Implementation**:
  - Establish a global Express error-handling middleware that catches all unhandled exceptions, logs them with detailed stacks internally, and returns a clean, obfuscated JSON payload (`{ "message": "An internal server error occurred" }`) to the client.
  - Implement repository retry logic for database connection drops (retry up to 3 times with exponential backoff).

---

## 3. Security Requirements
For concrete security configurations and JWT lifecycles, refer to [15-security-guidelines.md](file:///d:/CADT/Projects/hotel-booking/docs/security/15-security-guidelines.md).

### NFR-3.1: Data Encryption
- **Requirement**: All customer passwords must be stored using cryptographically secure hashing. Sensitive data in transit must be protected.
- **Implementation**:
  - Hash passwords using `bcryptjs` with a cost factor of `12` rounds prior to persisting to the database.
  - Require transport layer security (HTTPS) on all API endpoints.

### NFR-3.2: Injection and Attack Mitigation
- **Requirement**: The application must be hardened against SQL injection, Cross-Site Scripting (XSS), and Denial of Service (DoS) attacks.
- **Implementation**:
  - Utilize Sequelize parameterized queries to prevent SQL injection. Avoid raw queries unless parameterized.
  - Use Helmet middleware to set HTTP headers protecting against common vulnerabilities.
  - Implement rate limiting (max 100 requests per 15 minutes per IP address) for general API endpoints, and a stricter limit (max 5 requests per 15 minutes per IP address) for login/registration routes.

---

## 4. Maintainability & Code Quality
Refer to [13-coding-standards.md](file:///d:/CADT/Projects/hotel-booking/docs/architecture/13-coding-standards.md) for style specifics.

### NFR-4.1: Test Coverage
- **Requirement**: Core business logic (Services and Repositories) must have a minimum of 80% test coverage before the MVP launch.
- **Implementation**:
  - Write unit tests using Jest to validate pricing, date range overlaps, and state validations in the Service layer.

### NFR-4.2: Structured Logging
- **Requirement**: Application logs must be structured, categorizing issues by severity level (info, warn, error).
- **Implementation**:
  - Use `winston` for writing files locally and printing to standard output.
  - Ensure zero logs print plain-text user passwords or authorization tokens.
