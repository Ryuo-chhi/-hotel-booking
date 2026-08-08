/**
 * Room Model definition
 * 
 * Responsibility: Defines the schema mapping to the 'rooms' table.
 */

import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const rooms = sequelize.define('rooms',{
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  room_type_id:{
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status:{
    type: DataTypes.ENUM('available','occupied','maintenance'),
    allowNull: false,
    defaultValue: 'available'
  }
})

export default rooms;
