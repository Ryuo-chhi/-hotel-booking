# Tests Folder

## Responsibility
Contains unit tests for isolated module behaviors and integration/E2E API scenario tests.

## Structure
- `unit/`: Holds isolated unit test scripts.
  - `auth.service.test.js`: Validates token claims and password hashing.
  - `booking.service.test.js`: Validates stay durations and price calculations.
- `integration/`: Holds API route integration tests.
  - `booking.test.js`: Simulates concurrent booking calls to check locking stability.
  - `auth.test.js`: Checks user registration and route RBAC rules.
