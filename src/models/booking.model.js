/**
 * Booking Model definition
 * 
 * Responsibility: Defines the schema mapping to the 'bookings' table.
 */

import sequelize from '../config/db.js';
import { DataTypes } from 'sequelize';


const bookings = sequelize.define('bookings',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    room_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    check_in_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    check_out_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    total_price:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM("pending","confirmed","cancelled"),
        allowNull: false,
        defaultValue: "pending"
    }

})

export default bookings
