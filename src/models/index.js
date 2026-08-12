/**
 * Sequelize Models Index
 *
 * Responsibility: Initializes Sequelize connection pool, registers models,
 * and binds associations (hasMany, belongsTo, hasOne).
 */

import sequelize from "../config/db.js";
import user from "./user.model.js";
import bookings from "./booking.model.js";
import rooms from "./room.model.js";
import room_types from "./room-type.model.js";
import transactions from "./transaction.model.js";
import refreshToken from "./refresh-token.model.js";

// User - Booking (One-to-Many)
user.hasMany(bookings, {
  foreignKey: "user_id",
});
bookings.belongsTo(user, {
  foreignKey: "user_id",
});

//room_type - room
room_types.hasMany(rooms, {
  foreignKey: "room_type_id",
});
rooms.belongsTo(room_types, {
  foreignKey: "room_type_id",
});

//Booking - Room (One-to-Many)

rooms.hasMany(bookings, {
  foreignKey: "room_id",
});
bookings.belongsTo(rooms, {
  foreignKey: "room_id",
});

// Booking - Transaction (One-to-one)
bookings.hasOne(transactions, {
  foreignKey: "booking_id",
});
transactions.belongsTo(bookings, {
  foreignKey: "booking_id",
});

// User - RefreshToken (One-to-Many)
user.hasMany(refreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
refreshToken.belongsTo(user, { foreignKey: 'user_id' });

export { sequelize, user, bookings, rooms, room_types, transactions, refreshToken };