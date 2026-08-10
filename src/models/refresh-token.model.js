import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const refreshToken = sequelize.define('refresh_tokens', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  token_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }

}, {
  indexes: [
    {
      fields: ['token_hash'],
      name: 'idx_refresh_token_token_hash',
    }
  ]
});

export default refreshToken;