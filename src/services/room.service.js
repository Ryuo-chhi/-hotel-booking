/**
 * Room Service
 * 
 * Responsibility: Implements search logic filtering out overlapping bookings,
 * matches guest counts against room capacities, and manages room updates.
 */

/**
 * Fetch available room types and their current pricing.
 * 
 * @param {string} checkIn - Date of arrival
 * @param {string} checkOut - Date of departure
 * @param {number} guests - Capacity count
 * @returns {Promise<Array>} List of available room types
 */
const getAvailableRoomTypes = async (checkIn, checkOut, guests) => {
  // Stub
};

/**
 * Add a new physical room unit.
 * 
 * @param {object} roomData - Physical room details
 * @returns {Promise<object>} Created room record
 */
const addRoom = async (roomData) => {
  // Stub
};

export default {
  getAvailableRoomTypes,
  addRoom
};
