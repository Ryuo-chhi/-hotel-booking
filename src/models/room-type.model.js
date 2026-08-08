/**
 * Room Type Model definition
 * 
 * Responsibility: Defines the schema mapping to the 'room_types' table.
 */

import sequelize from '../config/db.js';
import { DataTypes } from "sequelize";

const room_types = sequelize.define("room_types", {
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    base_rate:{
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    max_occupancy:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amenities:{
      type: DataTypes.JSON,
      allowNull: false,
    }


})

export default room_types
