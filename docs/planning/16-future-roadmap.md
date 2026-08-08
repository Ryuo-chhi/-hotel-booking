# 16. Future Roadmap

This document outlines the post-MVP evolution of the Hotel Booking System, describing feature extensions, performance upgrades, and architectural transitions.

---

## 1. Feature Enhancements (Phase 2 & 3)

### 1.1: Customer Loyalty & Rewards System
- **Objective**: Improve customer retention.
- **Description**: Add a rewards points system where customers earn points for every booking. Accumulated points can be used to redeem discounts or free nights.
- **Implementation**: Create a `loyalty_programs` table tracked via the User model and add calculation hooks inside `BookingService`.

### 1.2: Advanced Notification Engine
- **Objective**: Automated messaging throughout the booking lifecycle.
- **Description**: Send real-time notifications for booking confirmations, check-in reminders, and payment receipts via email, SMS, and WhatsApp (integrating Twilio or SendGrid).
- **Implementation**: Introduce an event-driven pattern in Express (using Node events) or integrate a messaging queue (e.g. RabbitMQ or BullMQ).

### 1.3: Dynamic Pricing Machine Learning Engine
- **Objective**: Automate rate calculations based on occupancy trends and market demand.
- **Description**: Transition from simple weekend markups to dynamic pricing algorithms. The system adjusts room rates based on real-time occupancy rates, local event calendars, search volume, and competitor pricing.

---

## 2. Technical & Scaling Roadmap

As transaction volume grows, the system architecture must scale to handle higher concurrent traffic.

```
                  PROPOSED PHASE 2 ARCHITECTURE
                                            
                    +--------------------+  
                    |   Load Balancer    |  
                    +--------------------+  
                               |            
                +--------------+--------------+
                |                             |
                v                             v
       +------------------+          +------------------+
       |   API Node A     |          |   API Node B     |
       +------------------+          +------------------+
                |                             |
                +--------------+--------------+
                               |
                               v
                     +--------------------+
                     |    Redis Cache     | (Session / Search caching)
                     +--------------------+
                               |
                               v
                +--------------+--------------+
                |                             | (Read/Write Split)
                v                             v
       +------------------+          +------------------+
       |   MySQL Master   | -------->|   MySQL Replica  |
       |  (Write Operations) |          | (Read Operations)|
       +------------------+          +------------------+
```

### 2.1: Caching Layer with Redis
- **Goal**: Accelerate room searches and ease database load.
- **Implementation**: Cache available room searches (e.g. `GET /api/room-types/available`) in Redis with a short time-to-live (TTL) of 60 seconds. Invalidate the cache whenever a new booking is confirmed.

### 2.2: Database Read/Write Split
- **Goal**: Increase query throughput.
- **Implementation**: Set up database replicas. Direct write queries (creates, edits, deletes, transactions) to the MySQL Master instance, and route read queries (searches, profile requests, historical reports) to Read Replicas.

### 2.3: Transition to Microservices
- **Goal**: Support specialized scaling and domain independence.
- **Implementation**: Split the monolithic Express app into decoupled microservices:
  - **Auth Service**: Manages accounts and authorization.
  - **Search Service**: High-performance room lookup (can use Elasticsearch).
  - **Booking Service**: Coordinates state transitions and reservations.
  - **Payment Service**: Handles credit card checkouts and transaction logging.
