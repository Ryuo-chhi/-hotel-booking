/**
 * Room Controller
 * 
 * Responsibility: Handles room availability search, room type configurations, and management updates.
 */

import * as roomService from "../services/room.service.js";

/**
 * Search for available room types based on check-in/out dates and guest count.
 * Route: GET /api/room-types/available
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const searchAvailableRoomTypes = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guestCount } = req.query;
    const availableRoomTypes = await roomService.getAvailableRoomTypes(
      checkIn,
      checkOut,
      guestCount
    );

    res.status(200).json({
      status: "success",
      data: availableRoomTypes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new physical room unit (Manager/Admin only).
 * Route: POST /api/rooms
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.addRoom(req.body);

    res.status(201).json({
      status: "success",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all physical rooms with optional status/type filtering.
 * Route: GET /api/rooms
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getAllRooms(req.query);

    res.status(200).json({
      status: "success",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get physical room details by ID.
 * Route: GET /api/rooms/:id
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);

    res.status(200).json({
      status: "success",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing physical room unit details.
 * Route: PUT /api/rooms/:id
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await roomService.updateRoom(req.params.id, req.body);

    res.status(200).json({
      status: "success",
      data: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update physical room operational status.
 * Route: PATCH /api/rooms/:id/status
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedRoom = await roomService.updateRoomStatus(req.params.id, status);

    res.status(200).json({
      status: "success",
      data: updatedRoom,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a physical room unit.
 * Route: DELETE /api/rooms/:id
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
const deleteRoom = async (req, res, next) => {
  try {
    const result = await roomService.deleteRoom(req.params.id);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export {
  searchAvailableRoomTypes,
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
};
