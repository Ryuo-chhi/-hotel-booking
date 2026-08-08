/**
 * User Model definition
 * 
 * Responsibility: Defines the schema mapping to the 'users' table,
 * including password exclusion in default scopes.
 */

import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const users= sequelize.define('users',{
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password:{
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role:{
    type: DataTypes.ENUM('admin','manager','staff','customer'),
    allowNull: false,
  }
})

export default users