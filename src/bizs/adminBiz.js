const { dbUtil, util } = require('../common');
const { DataDict } = require('../models');

const SYS_CONFIG_FILTER = { dataKey: 'global_sys_config' };

const getPagedUserList = async (req, res, next) => {};

const createNewUser = async (req, res, next) => {};

const updateUserInfo = async (req, res, next) => {};

const getUserInfoById = async (req, res, next) => {};

const deleteUserById = async (req, res, next) => {};

const resetUserPassword = async (req, res, next) => {};

const getSysConfig = async (req, res, next) => {
  const data = await dbUtil.findOne(DataDict, SYS_CONFIG_FILTER);
  let dataValue = util.safeJSONParse(data && data.dataValue);
  if (!dataValue) {
    dataValue = {
      EnablePrivateRegistry: false,
      PrivateRegistry: '',
      TopNews: ''
    };
  }
  res.json(dataValue);
};

const saveSysConfig = async (req, res, next) => {
  const { body } = req;
  const { user } = req.state;
  const hasConfig = (await dbUtil.count(DataDict, SYS_CONFIG_FILTER)) > 0;
  const dataValue = JSON.stringify({
    EnablePrivateRegistry: body.EnablePrivateRegistry,
    PrivateRegistry: body.PrivateRegistry,
    TopNews: body.TopNews
  });
  const now = Date.now();
  if (hasConfig) {
    await dbUtil.update(DataDict, SYS_CONFIG_FILTER, { dataValue, ...dbUtil.fillCommonFileds(user.userId, true) });
  } else {
    await dbUtil.create(DataDict, {
      dataKey: SYS_CONFIG_FILTER.dataKey,
      dataValue,
      ...dbUtil.fillCommonFileds(user.userId)
    });
  }
  res.json({ result: true });
};

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
