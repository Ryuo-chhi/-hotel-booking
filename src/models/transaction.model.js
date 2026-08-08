/**
 * Transaction Model definition
 * 
 * Responsibility: Defines the schema mapping to the 'transactions' table.
 */

import sequelize from '../config/db.js';
import { DataTypes } from "sequelize";

const transactions = sequelize.define('transactions',{
  id:{
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id:{
    type: DataTypes.INTEGER,
    allowNull: false
  },  
  amount:{
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  payment_method:{
    type: DataTypes.ENUM('cash','credit card','aba'),
    allowNull: false
  },
  payment_status:{
    type: DataTypes.ENUM('pending','completed','failed'),
    allowNull: false,
    defaultValue: 'pending'
  }
})

export default transactions;
