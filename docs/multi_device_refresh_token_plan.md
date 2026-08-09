# Multi-Device Refresh Token & Migration Plan

This plan is a **step-by-step self-guided tutorial** for you to upgrade your application from a single-session `refreshToken` column on the `users` table to a separate `refresh_tokens` table using **Sequelize CLI Migrations**.

---

## 🎯 Goal
Upgrade the architecture to **Option 3**:
* Store tokens in a dedicated `refresh_tokens` table (`id`, `user_id`, `token_hash`, `device_name`, `expires_at`).
* Support **multi-device logins** (phone, laptop, tablet simultaneously).
* **Hash Refresh Tokens** (`SHA-256`) before saving to the DB so tokens aren't stored in plain text.
* Learn and use `sequelize-cli` database migrations!

---

## 🚀 Step-by-Step Implementation Guide

### Step 1: Create Database Migration using Sequelize CLI

Run the following command in your terminal to generate a new migration file:

```bash
npx sequelize-cli migration:generate --name create-refresh-tokens-table
```

This creates a file in `migrations/XXXXXX-create-refresh-tokens-table.cjs` (or `.js`).

Open that file and define the `up` and `down` migration methods:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      device_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  }
};
```

#### Run the Migration:
Execute the migration to create the table in MySQL:

```bash
npx sequelize-cli db:migrate
```

---

### Step 2: Define the Sequelize Model & Associations

#### 1. Create `src/models/refresh-token.model.js`:
```javascript
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
});

export default refreshToken;
```

#### 2. Update `src/models/index.js` to set up relationships:
```javascript
import user from './user.model.js';
import refreshToken from './refresh-token.model.js';
// ... import other models

// Define associations
user.hasMany(refreshToken, { foreignKey: 'user_id', onDelete: 'CASCADE' });
refreshToken.belongsTo(user, { foreignKey: 'user_id' });

export {
  sequelize,
  user,
  refreshToken,
  // ...
};
```

#### 3. Clean up `src/models/user.model.js`:
Remove the `refreshToken` column from the user model definition.

---

### Step 3: Create Refresh Token Repository

Create `src/repositories/refresh-token.repository.js`:

```javascript
import { refreshToken as RefreshTokenModel } from "../models/index.js";

const create = async (data) => {
  return await RefreshTokenModel.create(data);
};

const findByTokenHash = async (tokenHash) => {
  return await RefreshTokenModel.findOne({ where: { token_hash: tokenHash } });
};

const deleteByTokenHash = async (tokenHash) => {
  return await RefreshTokenModel.destroy({ where: { token_hash: tokenHash } });
};

const deleteAllByUserId = async (userId) => {
  return await RefreshTokenModel.destroy({ where: { user_id: userId } });
};

export {
  create,
  findByTokenHash,
  deleteByTokenHash,
  deleteAllByUserId
};
```

---

### Step 4: Update Business Logic (`src/services/auth.service.js`)

We will use Node's built-in `crypto` module to hash the refresh token before saving it to the DB.

```javascript
import crypto from "node:crypto";
import * as refreshTokenRepository from "../repositories/refresh-token.repository.js";

// Helper function to hash tokens
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

#### Update `registerUser` & `authenticateUser`:
```javascript
// Generate refresh token string
const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

// Save hashed token to refresh_tokens table
const tokenHash = hashToken(refreshToken);
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

await refreshTokenRepository.create({
  user_id: user.id,
  token_hash: tokenHash,
  device_name: deviceName || 'Unknown Device',
  expires_at: expiresAt
});
```

#### Update `refreshAuth`:
```javascript
const refreshAuth = async (token) => {
  if (!token) throw errors.UnauthorizedError("No refresh token provided");

  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret);
    const tokenHash = hashToken(token);

    // Find token record in database
    const tokenRecord = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!tokenRecord || new Date() > new Date(tokenRecord.expires_at)) {
      if (tokenRecord) await refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw errors.UnauthorizedError("Invalid or expired refresh token");
    }

    // Delete used token (Rotation)
    await refreshTokenRepository.deleteByTokenHash(tokenHash);

    // Issue new Access Token & Refresh Token
    const newAccessToken = jwt.sign({ id: decoded.id }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
    const newRefreshToken = jwt.sign({ id: decoded.id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

    // Save new hashed token
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.create({
      user_id: decoded.id,
      token_hash: newTokenHash,
      device_name: tokenRecord.device_name,
      expires_at: expiresAt
    });

    return { token: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw errors.UnauthorizedError("Invalid refresh token");
  }
};
```

#### Update `logoutUser`:
```javascript
const logoutUser = async (token) => {
  if (token) {
    const tokenHash = hashToken(token);
    await refreshTokenRepository.deleteByTokenHash(tokenHash);
  }
};
```

---

### Step 5: Update Controller & Pass `User-Agent`

In `src/controllers/auth.controller.js`:
Pass `req.headers['user-agent']` as `deviceName` to `registerUser` and `authenticateUser`:

```javascript
const deviceName = req.headers['user-agent'] || 'Unknown Device';
const { user, token, refreshToken } = await authService.authenticateUser(email, password, deviceName);
```

---

## 🧪 Verification & Testing Steps

1. Run `npx sequelize-cli db:migrate` and check MySQL (`SHOW TABLES;` and `DESCRIBE refresh_tokens;`).
2. Log in using Postman from device A $\rightarrow$ Check `refresh_tokens` table in MySQL. You will see 1 row with a hashed token.
3. Log in using Postman from device B (or change User-Agent) $\rightarrow$ Check `refresh_tokens` table. You will see 2 rows! (Multi-device active).
4. Call `POST /api/auth/refresh` $\rightarrow$ Verify old token row is replaced by new token row.
5. Call `POST /api/auth/logout` $\rightarrow$ Verify only the current device's token row is deleted.

---

## 🙋‍♂️ Need Help?
Follow these steps one by one. If you get stuck at any step or run into a CLI migration error, just paste the error here and I'll help you debug!
