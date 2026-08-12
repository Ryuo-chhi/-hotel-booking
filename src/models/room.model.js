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
  image_url:{
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'
  },
  status:{
    type: DataTypes.ENUM('available','occupied','maintenance'),
    allowNull: false,
    defaultValue: 'available'
  }
})


export default rooms;
