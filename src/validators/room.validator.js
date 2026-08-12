/**
 * Room Request Validator schemas
 *
 * Responsibility: Outlines Express-Validator structures to validate room search and CRUD parameters.
 */

import { body, query } from "express-validator";

const searchSchema = [
  query("checkIn")
    .notEmpty()
    .withMessage("Check-in date is required.")
    .isISO8601()
    .withMessage("Check-in date must be a valid date.")
    .custom((checkInValue) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset time to midnight
      const checkInDate = new Date(checkInValue);
      // If checkInValue is YYYY-MM-DD, parsing with 'T00:00:00' forces local time parsing:
      const checkInDateLocal = new Date(`${checkInValue}T00:00:00`);
      checkInDateLocal.setHours(0, 0, 0, 0);

      return true; //passed
    }),
  query("checkOut")
    .notEmpty()
    .withMessage("Check-out date is required.")
    .isISO8601()
    .withMessage("Check-out date must be a valid date.")
    .custom((checkOutValue, { req }) => {
      const checkOutDate = new Date(checkOutValue);
      const checkInDate = new Date(req.query.checkIn);

      if (checkOutDate <= checkInDate) {
        throw new Error("Check-out date must be after check-in date.");
      }
      return true; //passed
    }),
  query("guestCount")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Guest count must be at least 1.")
    .toInt(),
];

const createRoomSchema = [
  body("room_type_id")
    .notEmpty()
    .withMessage("Room type ID is required.")
    .isInt({ min: 1 })
    .withMessage("Room type ID must be a positive integer.")
    .toInt(),
  body("image_url")
    .optional()
    .isURL()
    .withMessage("Image URL must be a valid URL format."),
  body("status")
    .optional()
    .isIn(["available", "occupied", "maintenance"])
    .withMessage("Status must be one of: available, occupied, maintenance."),
];

export { searchSchema, createRoomSchema };
