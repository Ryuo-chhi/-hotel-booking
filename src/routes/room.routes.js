/**
 * Room and Room Type Routes
 *
 * Responsibility: Maps room queries and manager modifications to controllers.
 */

import express from "express";
import * as roomController from "../controllers/room.controller.js";
import {
  searchSchema,
  createRoomSchema,
} from "../validators/room.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Search Endpoint
router.get(
  "/available",
  searchSchema,
  validate,
  roomController.searchAvailableRoomTypes,
);

// Protected Admin/Manager Inventory Endpoints
router.use(authenticate);

router.get("/", authorize(["admin", "manager"]), roomController.getAllRooms);
router.get(
  "/:id",
  authorize(["admin", "manager"]),
  roomController.getRoomById,
);
router.post(
  "/",
  authorize(["admin", "manager"]),
  createRoomSchema,
  validate,
  roomController.createRoom,
);
router.put(
  "/:id",
  authorize(["admin", "manager"]),
  roomController.updateRoom,
);
router.patch(
  "/:id/status",
  authorize(["admin", "manager"]),
  roomController.updateRoomStatus,
);
router.delete("/:id", authorize(["admin"]), roomController.deleteRoom);

export default router;
