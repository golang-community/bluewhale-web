const { dbUtil, util } = require('../common');
const { DataDict, User, Group } = require('../models');
const { groupDal } = require('../dal');
const { Op } = dbUtil;

const SYS_CONFIG_FILTER = { dataKey: 'global_sys_config' };

const _convertUserForResponse = user => {
  return {
    Avatar: user.userAvatar,
    Department: user.department,
    EditDate: user.modifyTime,
    EditUser: '',
    Email: user.email,
    FullName: user.displayName,
    IsAdmin: user.isAdmin,
    UserID: user.username,
    id: user.id
  };
};

const getPagedUserList = async (req, res, next) => {
  const { query } = req;
  const pageSize = Math.max(1, util.ensureNumber(query.pageSize, 10)); // 每页记录数，最小为 1
  const pageIndex = Math.max(1, util.ensureNumber(query.pageIndex, 1)); // 当前查询页数，最小为1
  const where = {};
  if (query.q) {
    where[Op.or] = [{ username: { [Op.like]: `%${query.q}%` } }, { displayName: { [Op.like]: `%${query.q}%` } }];
  }
  const pagingData = await dbUtil.queryPagedList(
    User,
    where,
    { size: pageSize, index: pageIndex },
    {
      sort: [['id', 'ASC']],
      attrs: { exclude: 'password' }
    }
  );
  const resData = {
    pageIndex,
    pageSize,
    total_rows: pagingData.count,
    rows: pagingData.rows.map(x => {
      const item = x.toJSON();
      return _convertUserForResponse(item);
    })
  };
  res.json(resData);
};

const createNewUser = async (req, res, next) => {
  const { body } = req;
  const { user } = req.state;
  const newUser = {
    department: body.Department,
    email: body.Email,
    displayName: body.FullName,
    isAdmin: body.IsAdmin,
    password: util.md5Crypto(body.Password || '123456'),
    username: body.UserID,
    ...dbUtil.fillCommonFileds(user.userId)
  };
  await dbUtil.create(User, newUser);
  res.json({ result: true });
};

const updateUserInfo = async (req, res, next) => {
  const { params, body } = req;
  const { user } = req.state;
  const updateData = {
    displayName: body.FullName,
    department: body.Department,
    email: body.Email,
    isAdmin: body.IsAdmin,
    ...dbUtil.fillCommonFileds(user.userId, true)
  };
  const affectedCount = await dbUtil.update(User, { id: params.userId }, updateData);
  if (affectedCount === 0) {
    return next(new Error('操作失败，可能是未找到用户'));
  }
  res.json({ result: true });
};

const getUserInfoById = async (req, res, next) => {
  const { params } = req;
  const user = await dbUtil.findOne(User, { id: params.userId });
  if (!user) {
    return next(new Error('未找到用户'));
  }
  res.json(_convertUserForResponse(user));
};

const deleteUserById = async (req, res, next) => {
  const { params } = req;
  const affectedCount = await dbUtil.deleteAll(User, { id: params.userId });
  if (affectedCount === 0) {
    return next(new Error('操作失败，可能是未找到用户'));
  }
  res.json({ result: true });
};

const resetUserPassword = async (req, res, next) => {
  const { params } = req;
  const { user } = req.state;
  const updateData = {
    password: util.md5Crypto('123456'),
    ...dbUtil.fillCommonFileds(user.userId, true)
  };
  const affectedCount = await dbUtil.update(User, { id: params.userId }, updateData);
  if (affectedCount === 0) {
    return next(new Error('操作失败，可能是未找到用户'));
  }
  res.json({ result: true });
};

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

const getAllGroups = async (req, res, next) => {
  const pagedGroups = await groupDal.queryPagedGroups({}, { index: 1, size: 10000000 });
  res.json(pagedGroups.rows);
};

const createGroup = async (req, res, next) => {};

const updateGroup = async (req, res, next) => {};

const deleteGroup = async (req, res, next) => {
  const { params } = req;
  const affectedCount = await dbUtil.deleteAll(Group, { groupId: params.groupId });
  if (affectedCount === 0) {
    return next(new Error('操作失败，可能是未找到Group'));
  }
  res.json({ result: true });
};

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
  getAllGroups,
  createGroup,
  updateGroup,
  deleteGroup
};
