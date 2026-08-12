/**
 * Room Service
 *
 * Responsibility: Implements search logic filtering out overlapping bookings,
 * matches guest counts against room capacities, and manages room updates.
 */

import * as roomRepository from "../repositories/room.repository.js";
import * as roomTypeRepository from "../repositories/room-type.repository.js";
import * as errors from "../utils/errors.js";

/**
 * Fetch available room types and calculate estimated total stay price.
 *
 * @param {string} checkIn - Date of arrival (YYYY-MM-DD)
 * @param {string} checkOut - Date of departure (YYYY-MM-DD)
 * @param {number} guests - Capacity count
 * @returns {Promise<Array>} List of available room types with computed prices
 */
const getAvailableRoomTypes = async (checkIn, checkOut, guests) => {
  // 1. Calculate stay duration in nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
  );

  // 2. Query repository for available room types with available room counts
  const availableRoomTypes = await roomTypeRepository.findWithAvailableRooms(
    checkIn,
    checkOut,
    guests,
  );

  // 3. Map each category to calculate estimated total_price
  return availableRoomTypes.map((type) => {
    const plainType = type.get ? type.get({ plain: true }) : type;
    const baseRate = Number(plainType.base_rate) || 0;

    return {
      ...plainType,
      nights,
      total_price: parseFloat((nights * baseRate).toFixed(2)),
    };
  });
};

/**
 * Add a new physical room unit.
 *
 * @param {object} roomData - Physical room details
 * @returns {Promise<object>} Created room record
 */
const addRoom = async (roomData) => {
  const { room_type_id, status, image_url } = roomData;

  if (!room_type_id) {
    throw errors.BadRequestError("Room type ID is required.");
  }

  const roomTypeExists = await roomTypeRepository.findById(room_type_id);
  if (!roomTypeExists) {
    throw errors.NotFoundError(`Room type with ID ${room_type_id} does not exist.`);
  }

  return await roomRepository.create({
    room_type_id,
    image_url,
    status: status || "available",
  });
};

/**
 * Retrieve all physical rooms with optional status/type filtering.
 *
 * @param {object} [options] - Filters (status, room_type_id, limit, offset)
 * @returns {Promise<Array>} List of physical rooms
 */
const getAllRooms = async (options = {}) => {
  return await roomRepository.findAll(options);
};

/**
 * Get physical room details by ID.
 *
 * @param {number} id - Room primary key
 * @returns {Promise<object>} Physical room details
 */
const getRoomById = async (id) => {
  const room = await roomRepository.findById(id);
  if (!room) {
    throw errors.NotFoundError(`Room with ID ${id} not found.`);
  }
  return room;
};

/**
 * Update an existing room unit details.
 *
 * @param {number} id - Room primary key
 * @param {object} updateData - Properties to update
 * @returns {Promise<object>} Updated room details
 */
const updateRoom = async (id, updateData) => {
  const room = await roomRepository.findById(id, false);
  if (!room) {
    throw errors.NotFoundError(`Room with ID ${id} not found.`);
  }

  if (updateData.room_type_id) {
    const roomTypeExists = await roomTypeRepository.findById(updateData.room_type_id);
    if (!roomTypeExists) {
      throw errors.NotFoundError(`Room type with ID ${updateData.room_type_id} does not exist.`);
    }
  }

  await roomRepository.update(id, updateData);
  return await roomRepository.findById(id);
};

/**
 * Update physical room operational status.
 *
 * @param {number} id - Room primary key
 * @param {string} status - New operational status ('available', 'occupied', 'maintenance')
 * @returns {Promise<object>} Updated room details
 */
const updateRoomStatus = async (id, status) => {
  const validStatuses = ["available", "occupied", "maintenance"];
  if (!status || !validStatuses.includes(status)) {
    throw errors.BadRequestError(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  const room = await roomRepository.findById(id, false);
  if (!room) {
    throw errors.NotFoundError(`Room with ID ${id} not found.`);
  }

  await roomRepository.updateStatus(id, status);
  return await roomRepository.findById(id);
};

/**
 * Remove a physical room unit.
 *
 * @param {number} id - Room primary key
 * @returns {Promise<object>} Deletion confirmation
 */
const deleteRoom = async (id) => {
  const room = await roomRepository.findById(id, false);
  if (!room) {
    throw errors.NotFoundError(`Room with ID ${id} not found.`);
  }

  await roomRepository.deleteById(id);
  return { message: "Room deleted successfully", id };
};

export {
  getAvailableRoomTypes,
  addRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
};

