# Refresh Tokens Guide & Implementation Plan

This document serves as both a **guide** to help you understand how refresh tokens work, and an **implementation plan** to add them to your `hotel-booking` backend.

## 1. What are Refresh Tokens and Why do we need them?

Right now, your app uses a single JWT (JSON Web Token) to authenticate users. When a user logs in, they get a token (let's say it expires in 1 hour). 
Once that 1 hour passes, the token becomes invalid. If the user is in the middle of booking a hotel, they suddenly get kicked out and have to log in again. As you mentioned, this is **bad UX**.

If we just increase the token expiry to 30 days, we introduce a **security risk**: if a hacker steals the token, they have access to the user's account for 30 days, and JWTs are very hard to revoke before they expire.

**The Solution:** Two Tokens!
1. **Access Token:** Very short lifespan (e.g., 15 minutes). Used to access API endpoints.
2. **Refresh Token:** Long lifespan (e.g., 7 days). Used *only* to get a new Access Token.

### Where do they live?
- **Access Token:** Lives in the client's memory (e.g., a React state variable) or local storage.
- **Refresh Token:** 
  - On the **Server**, it usually lives in the database (so we can revoke it if a user logs out or if an account is compromised).
  - On the **Client (Browser)**, it should ideally live in an `HttpOnly` cookie. This makes it immune to XSS (Cross-Site Scripting) attacks because JavaScript cannot read it. If you are building a Mobile App, it can be stored in secure local storage.

---

## 2. User Review Required

> [!IMPORTANT]
> **Storage Decision:** I am proposing we send the Refresh Token back in an **HttpOnly Cookie** for the web client, while still returning the Access Token in the JSON body. This is the most secure pattern. If you are building a mobile app instead of a web app, let me know, and we can just return both in the JSON body!
> Please click **Proceed** if you agree with this plan, or send me a message if you'd like to adjust the storage strategy.

---

## 3. Proposed Changes (The Guide to Build it)

Here is the step-by-step guide on how we will modify the codebase once you approve this plan.

### Environment & Configuration

#### [MODIFY] `.env` and `src/config/env.js`
We will add new environment variables for the refresh token.
* `JWT_REFRESH_SECRET`
* `JWT_REFRESH_EXPIRES_IN` (e.g., '7d')

### Database Model

#### [MODIFY] `src/models/user.model.js`
We need a place to store the current refresh token in the database so we can validate it.
* Add a `refreshToken` column (type `DataTypes.STRING`, `allowNull: true`).

### Business Logic (Services)

#### [MODIFY] `src/services/auth.service.js`
* Update `registerUser` and `authenticateUser` to generate **both** an Access Token and a Refresh Token.
* Save the newly generated Refresh Token to the user's database record.
* Create a new function `refreshAuth(token)` that:
  1. Verifies the refresh token using `jwt.verify`.
  2. Finds the user by the token in the database.
  3. Generates a new Access Token & Refresh Token pair.
  4. Saves the new Refresh Token to the database.

### Controllers & Routes

#### [MODIFY] `src/controllers/auth.controller.js`
* Update `login` and `register` to attach the Refresh Token to an `HttpOnly` cookie via `res.cookie()`.
* Add a new `refreshToken` controller function that reads the cookie, calls `authService.refreshAuth()`, and sets the new cookie/returns the new access token.
* Add a `logout` controller function that clears the cookie and removes the token from the database.

#### [MODIFY] `src/routes/auth.routes.js`
* Add `POST /api/auth/refresh`
* Add `POST /api/auth/logout`

---

## 4. Verification Plan

Once implemented, we will verify the changes by:
1. Registering/Logging in a user and checking if the `Set-Cookie` header correctly delivers the `refreshToken` and the JSON response contains the short-lived `accessToken`.
2. Making a request to `POST /api/auth/refresh` with the cookie attached to ensure it successfully issues a new `accessToken`.
3. Verifying the database stores the refresh token.
4. Calling `POST /api/auth/logout` to ensure the token is cleared from both the browser cookies and the database.
