/**
 * Room Type Repository
 * 
 * Responsibility: Queries Room Types along with remaining occupancy counts for availability searches.
 */

/**
 * Search for room types that can accommodate guests and have remaining active inventory.
 * 
 * @param {string} checkIn - Date of arrival
 * @param {string} checkOut - Date of departure
 * @param {number} guests - Capacity count
 * @returns {Promise<Array>} List of room types with count of available rooms
 */
const findWithAvailableRooms = async (checkIn, checkOut, guests) => {
  // Stub
};

export default {
  findWithAvailableRooms
};
