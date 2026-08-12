/**
 * Room Repository
 *
 * Responsibility: Executes query builders to select physical rooms and manage operational status.
 */

import { rooms, room_types, bookings, sequelize } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Find an active physical room unit of a specific room type that is available for the given dates.
 * Leverages a database transaction with write-locks.
 *
 * @param {number} roomTypeId - Category criteria
 * @param {string} checkIn - Date of arrival
 * @param {string} checkOut - Date of departure
 * @param {object} transaction - Sequelize transaction context
 * @returns {Promise<object|null>} Available Room model instance or null
 */
const findAvailableRoomInType = async (roomTypeId, checkIn, checkOut, transaction) => {
  return await rooms.findOne({
    where: {
      room_type_id: roomTypeId,
      status: "available",
      "$bookings.id$": null, // Ensures NO matching overlapping booking was found
    },
    include: [{
      model: bookings,
      required: false, // LEFT OUTER JOIN
      where: {
        status: { [Op.ne]: "cancelled" },
        check_in_date: { [Op.lt]: checkOut },
        check_out_date: { [Op.gt]: checkIn },
      },
      attributes: [], // Don't load booking data
    }],
    subQuery: false, // Prevents Sequelize from placing LIMIT inside a subquery
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : false,
  });
};

/**
 * Find a physical room unit by primary key.
 *
 * @param {number} id - Room primary key
 * @param {boolean} [includeRoomType=true] - Whether to join room_type model
 * @returns {Promise<object|null>} Room instance or null
 */
const findById = async (id, includeRoomType = true) => {
  return await rooms.findByPk(id, {
    include: includeRoomType
      ? [{ model: room_types, attributes: ["id", "name", "base_rate", "max_occupancy"] }]
      : [],
  });
};

/**
 * Fetch all rooms with optional filtering and pagination.
 *
 * @param {object} [options] - Filter criteria
 * @param {string} [options.status] - Filter by room status ('available', 'occupied', 'maintenance')
 * @param {number} [options.room_type_id] - Filter by room type ID
 * @param {number} [options.limit] - Limit results for pagination
 * @param {number} [options.offset] - Offset results for pagination
 * @returns {Promise<Array>} List of rooms
 */
const findAll = async (options = {}) => {
  const where = {};
  if (options.status) where.status = options.status;
  if (options.room_type_id) where.room_type_id = options.room_type_id;

  return await rooms.findAll({
    where,
    limit: options.limit,
    offset: options.offset,
    include: [{ model: room_types, attributes: ["id", "name"] }],
    order: [["id", "ASC"]],
  });
};

/**
 * Find all rooms belonging to a specific room type category.
 *
 * @param {number} roomTypeId - Room type primary key
 * @returns {Promise<Array>} List of matching room instances
 */
const findByRoomTypeId = async (roomTypeId) => {
  return await rooms.findAll({
    where: { room_type_id: roomTypeId },
  });
};

/**
 * Count rooms by operational status ('available', 'occupied', 'maintenance').
 *
 * @param {string} status - Room operational status
 * @returns {Promise<number>} Number of matching rooms
 */
const countByStatus = async (status) => {
  return await rooms.count({
    where: { status },
  });
};

/**
 * Add a new physical room unit.
 *
 * @param {object} data - Room properties
 * @param {object} [transaction] - Sequelize transaction context
 * @returns {Promise<object>} Created room instance
 */
const create = async (data, transaction = null) => {
  return await rooms.create(data, { transaction });
};

/**
 * Update an existing room unit by ID.
 *
 * @param {number} id - Room primary key
 * @param {object} data - Properties to update
 * @param {object} [transaction] - Sequelize transaction context
 * @returns {Promise<number>} Number of affected rows
 */
const update = async (id, data, transaction = null) => {
  const [affectedRows] = await rooms.update(data, {
    where: { id },
    transaction,
  });
  return affectedRows;
};

/**
 * Update room operational status.
 *
 * @param {number} id - Room primary key
 * @param {string} status - New status ('available', 'occupied', 'maintenance')
 * @param {object} [transaction] - Sequelize transaction context
 * @returns {Promise<number>} Number of affected rows
 */
const updateStatus = async (id, status, transaction = null) => {
  return await update(id, { status }, transaction);
};

/**
 * Delete a room unit by ID.
 *
 * @param {number} id - Room primary key
 * @returns {Promise<number>} Number of destroyed rows
 */
const deleteById = async (id) => {
  return await rooms.destroy({ where: { id } });
};

export {
  findAvailableRoomInType,
  findById,
  findAll,
  findByRoomTypeId,
  countByStatus,
  create,
  update,
  updateStatus,
  deleteById,
};

