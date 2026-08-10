import { refreshToken as refreshTokenModel } from "../models/index.js";

//Create a new token
const create = async (data) => {
  return await refreshTokenModel.create(data);
};

//find Token by Token Hash
const findTokenHash = async (tokenHash) => {
  return await refreshTokenModel.findOne({
    where: { token_hash: tokenHash },
    raw: true,
  });
};
//Revoke specific token
const deleteByTokenHash = async (tokenHash) => {
  return await refreshTokenModel.destroy({ where: { token_hash: tokenHash } });
};
//Revoke all tokens for a user
const deleteAllByUserId = async (userId) => {
  return await refreshTokenModel.destroy({ where: { user_id: userId } });
};

export { create, findTokenHash, deleteAllByUserId, deleteByTokenHash };
