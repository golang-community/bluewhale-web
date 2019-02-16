const { dbUtil, util } = require('../common');
const { Op } = dbUtil;
const { Group, User } = require('../models');
const { groupDal } = require('../dal');

const getUserGroups = async (req, res, next) => {
  const user = req.state.user;
  const where = { [Op.or]: [{ owners: { [Op.like]: `%"${user.username}"%` } }, { openToPublic: true }] };
  const pagedGroups = await groupDal.queryPagedGroups(where, { index: 1, size: 10000000 });
  res.json(pagedGroups.rows);
};

const updateGroup = async (req, res, next) => {
  const user = req.state.user;
  const { body, params } = req;
  const findCount = await dbUtil.count(Group, {
    groupId: params.groupId,
    [Op.or]: [{ owners: { [Op.like]: `%"${user.username}"%` } }, { openToPublic: true }]
  });
  if (findCount <= 0) {
    return next(new Error('非法操作'));
  }
  await groupDal.updateGroup(params.groupId, body, user.userId);
  res.json({ result: true });
};

const getGroupDetail = async (req, res, next) => {
  const user = req.state.user;
  const { params } = req;
  const findGroup = await dbUtil.findOne(Group, {
    groupId: params.groupId,
    [Op.or]: [{ owners: { [Op.like]: `%"${user.username}"%` } }, { openToPublic: true }]
  });
  if (!findGroup) {
    return next(new Error('找不到Group'));
  }
  const x = findGroup.toJSON();
  const resData = {
    ContactInfo: x.contact,
    Description: x.groupDesc,
    ID: x.groupId,
    IsCluster: x.isCluster,
    EditDate: x.modifyTime,
    EditUser: x.modifierId,
    Name: x.groupName,
    OpenToPublic: x.openToPublic,
    Owners: util.safeJSONParse(x.owners),
    Servers: util.safeJSONParse(x.servers)
  };
  res.json(resData);
};

const searchUserList = async (req, res, next) => {
  const { query } = req;
  const q = query.q;
  const pagedUsers = await dbUtil.queryPagedList(User, { username: { [Op.like]: `%${q}%` } });
  const resData = pagedUsers.rows.map(x => ({ UserID: x.username, FullName: x.displayName }));
  res.json(resData);
};

module.exports = {
  getUserGroups,
  updateGroup,
  getGroupDetail,
  searchUserList
};
