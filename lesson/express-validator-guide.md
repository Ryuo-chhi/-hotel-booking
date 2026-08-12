# Learn express-validator: The Easy Way

Welcome to the lesson! Here we will learn how to use `express-validator` to protect your backend from bad data. 

Imagine your backend is an exclusive VIP club, and `express-validator` is the bouncer at the door. If a user tries to send letters when they are supposed to send a number, the bouncer kicks them out before they can even enter your code!

---

## 1. The Bouncers: `body`, `query`, and `param`

Depending on *how* the user sends data, you need to tell `express-validator` where to look:

- **`body()`**: Checks the JSON data a user sends in a `POST` or `PUT` request (e.g., filling out a registration form).
- **`query()`**: Checks the URL query string in a `GET` request (e.g., the `?guests=2` in `/api/rooms/search?guests=2`).
- **`param()`**: Checks the URL parameters (e.g., the `15` in `GET /api/rooms/15`).

---

## 2. Setting the Rules (The Validation Chain)

You tell the bouncer what the rules are by chaining methods together. 

Let's create a rule for a `room_number` when an Admin is creating a new room:
```javascript
import { body } from 'express-validator';

export const createRoomSchema = [
  body('room_number')
    .trim() // Removes accidental spaces at the beginning and end (" 101 " becomes "101")
    .notEmpty().withMessage('You forgot to provide a room number!') // Rule 1: Cannot be empty
    .isString().withMessage('Room number must be text') // Rule 2: Must be text
    .isLength({ min: 1, max: 10 }).withMessage('Room number is too long') // Rule 3: Max 10 chars
];
```

If the user breaks *any* of these rules, the message inside `.withMessage()` is saved as an error.

---

## 2.5 Cheat Sheet: Common Built-in Rules

Before you write custom rules, `express-validator` has many built-in functions you can chain. Here are the most common ones you'll use:

- **`.notEmpty()`**: Fails if the user sends an empty string `""` or doesn't send the field at all.
- **`.isString()`**: Ensures the value is text.
- **`.isInt()` / `.isFloat()`**: Ensures the value is a whole number (like `2`) or a decimal number (like `19.99`).
- **`.isEmail()`**: Checks if it looks like a valid email address.
- **`.isISO8601()`**: Checks if a string is a valid, standard Date format (like `"2024-12-25"` or `"2024-12-25T14:30:00Z"`). This is exactly what you'll use to validate your `checkIn` and `checkOut` dates!
- **`.isIn(['apple', 'banana'])`**: Fails if the value is not exactly one of the items in your array (great for ENUMs like `['admin', 'manager']`).

*Tip: You can find dozens more in the official express-validator documentation, but these 6 will cover 90% of your needs.*

---

## 3. The Ultimate Rule: `.custom()`

When built-in validators aren't enough, `.custom()` lets you write **your own JavaScript function** to validate any field.

### How `.custom()` Works

The function receives 2 arguments:
1. `value`: The value of the field being validated.
2. `{ req }`: An object containing the Express `req` object (so you can read other fields in `req.body`, `req.query`, or `req.params`).

```javascript
.custom((value, { req }) => {
  // Return true if VALID
  // Throw an Error if INVALID
})
```

---

### Rule #1: How to Pass or Fail

- **To PASS validation**: Return `true`.
- **To FAIL validation**: `throw new Error('Your custom error message')`.

---

### 3 Practical Examples

#### Example 1: Comparing two fields (`checkOut` must be after `checkIn`)
```javascript
query('checkOut')
  .isISO8601().withMessage('Invalid check-out date')
  .custom((checkOutValue, { req }) => {
    const checkIn = new Date(req.query.checkIn);
    const checkOut = new Date(checkOutValue);

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }
    return true; // Passed!
  })
```

#### Example 2: Checking date against TODAY (`checkIn` cannot be in the past)
```javascript
query('checkIn')
  .isISO8601().withMessage('Invalid check-in date')
  .custom((checkInValue) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight

    const checkIn = new Date(checkInValue);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }
    return true; // Passed!
  })
```

#### Example 3: Async Database Check (e.g. Checking if Email is unique)
If your custom validator needs to query the database, make it `async`:

```javascript
body('email')
  .isEmail().withMessage('Invalid email format')
  .custom(async (emailValue) => {
    const existingUser = await User.findOne({ where: { email: emailValue } });
    if (existingUser) {
      throw new Error('Email is already registered');
    }
    return true; // Passed!
  })
```

---

## 4. Putting it all together

Once you have your rules (schemas), how do you actually use them in your app?

In your project, there is a helper file called `validate.middleware.js`. It automatically checks if the bouncer found any errors. If there are errors, it immediately sends a `400 Bad Request` error back to the user with all your custom messages.

Here is how you connect the rules to your route:

```javascript
import express from 'express';

// 1. Import your controller (the actual logic)
import { createRoom } from '../controllers/room.controller.js';

// 2. Import your rules (the bouncer)
import { createRoomSchema } from '../validators/room.validator.js';

// 3. Import the validator checker (the manager who throws them out)
import { validate } from '../middlewares/validate.middleware.js';

const router = express.Router();

// 4. Line them up in order! 
// Request -> [Rules] -> [Checker] -> [Controller]
router.post('/rooms', createRoomSchema, validate, createRoom);

export default router;
```

**That's it!** If you understand these 4 steps, you can write validations for any endpoint in your entire API.
