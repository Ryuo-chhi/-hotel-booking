import { user as User } from "../models/index.js";


/**
 * User Repository
 * 
 * Responsibility: Handles basic user CRUD operations using the Sequelize model.
 */

/**
 * Find a user record by email address.
 * 
 * @param {string} email - Search email
 * @returns {Promise<object|null>} Sequelize model user instance or null
 */
const findByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

/**
 * Find a user record by identifier.
 * 
 * @param {number} id - User PK reference
 * @returns {Promise<object|null>} Sequelize model user instance or null
 */
const findById = async (id) => {
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] } // We don't want to send the password back!
  });
};

/**
 * Persist a new user record in the database.
 * 
 * @param {object} data - Model properties
 * @returns {Promise<object>} Created user record instance
 */
const create = async (data) => {
  const { username, email, password, phone_number, role } = data;

  const user = await User.create({
    username,
    email,
    password,
    phone_number,
    role
  });

  return user;
};

/**
 * Update an existing user record.
 * 
 * @param {number} id - User PK reference
 * @param {object} data - Model properties to update
 * @returns {Promise<object>}
 */
const update = async (id, data) => {
  return await User.update(data, { where: { id } });
};

export {
  findByEmail,
  findById,
  create,
  update
};
