/**
 * Room Type Repository
 * 
 * Responsibility: Queries Room Types along with remaining occupancy counts for availability searches.
 */

import { room_types, rooms, bookings, sequelize } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Search for room types that can accommodate guests and have remaining active inventory.
 * 
 * @param {string} checkIn - Date of arrival (YYYY-MM-DD)
 * @param {string} checkOut - Date of departure (YYYY-MM-DD)
 * @param {number} guests - Number of guests requested
 * @returns {Promise<Array>} List of room types with count of available rooms
 */
const findWithAvailableRooms = async (checkIn, checkOut, guests) => {
  // ---------------------------------------------------------------------------
  // STEP 1: Find all physical room IDs that are ALREADY booked during this date range.
  // ---------------------------------------------------------------------------
  const busyBookings = await bookings.findAll({
    attributes: ["room_id"], // Only select the room_id column
    where: {
      status: { [Op.ne]: "cancelled" },     // Ignore cancelled bookings (status != 'cancelled')
      check_in_date: { [Op.lt]: checkOut }, // Booking starts BEFORE checkOut
      check_out_date: { [Op.gt]: checkIn },  // AND booking ends AFTER checkIn
    },
    raw: true, // Returns raw plain objects instead of Sequelize Model instances
  });

  // Extract array of busy room IDs (e.g. [101, 104])
  const bookedRoomIds = busyBookings.map((b) => b.room_id);

  // ---------------------------------------------------------------------------
  // STEP 2: Build search criteria for Room Types (e.g. max_occupancy >= guests)
  // ---------------------------------------------------------------------------
  const whereClause = {};
  if (guests) {
    whereClause.max_occupancy = { [Op.gte]: Number(guests) }; // Filter room types that fit guests
  }

  // ---------------------------------------------------------------------------
  // STEP 3: Query Room Types and calculate availableRoomsCount for each category
  // ---------------------------------------------------------------------------
  return await room_types.findAll({
    where: whereClause,

    // `attributes.include` keeps all room_type fields (name, price, amenities, description)
    // AND adds one extra calculated property called `availableRoomsCount` to each result.
    attributes: {
      include: [
        [
          // SQL equivalent: COUNT(rooms.id) AS availableRoomsCount
          sequelize.fn("COUNT", sequelize.col("rooms.id")),
          "availableRoomsCount",
        ],
      ],
    },

    // JOIN with physical rooms table
    include: [
      {
        model: rooms,
        attributes: [], // Set to empty array [] so individual room columns are not included in final output
        required: true,  // INNER JOIN: Only return room types that have at least 1 matching available room
        where: {
          status: "available", // Room status must be 'available'
          // Exclude any rooms found in STEP 1 that have overlapping bookings
          ...(bookedRoomIds.length > 0 && { id: { [Op.notIn]: bookedRoomIds } }),
        },
      },
    ],

    // GROUP BY room_type ID so COUNT(rooms.id) aggregates total rooms per room type category
    group: ["room_types.id"],
  });
};

/**
 * Find a room type by primary key.
 *
 * @param {number} id - Room type primary key
 * @returns {Promise<object|null>} Room type instance or null
 */
const findById = async (id) => {
  return await room_types.findByPk(id);
};

export {
  findWithAvailableRooms,
  findById
};

