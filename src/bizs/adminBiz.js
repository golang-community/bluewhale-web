const getPagedUserList = async (req, res, next) => {};

const createNewUser = async (req, res, next) => {};

const updateUserInfo = async (req, res, next) => {};

const getUserInfoById = async (req, res, next) => {};

const deleteUserById = async (req, res, next) => {};

const resetUserPassword = async (req, res, next) => {};

const getSysConfig = async (req, res, next) => {};

const saveSysConfig = async (req, res, next) => {};

const getPagedGroupList = async (req, res, next) => {};

const createGroup = async (req, res, next) => {};

const updateGroup = async (req, res, next) => {};

const deleteGroup = async (req, res, next) => {};

module.exports = {
  // User
  getPagedUserList,
  createNewUser,
  updateUserInfo,
  getUserInfoById,
  deleteUserById,
  resetUserPassword,
  // 配置
  getSysConfig,
  saveSysConfig,
  // Group
  getPagedGroupList,
  createGroup,
  updateGroup,
  deleteGroup
};
