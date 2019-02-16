const { dbUtil, util } = require('../common');
const { Op } = dbUtil;
const { Group, User } = require('../models');

const queryPagedGroups = async (where, pagingInfo) => {
  const pagedGroups = await dbUtil.queryPagedList(Group, where, pagingInfo, {
    sort: [['create_time', 'ASC']]
  });
  pagedGroups.rows = pagedGroups.rows.map(x1 => {
    var x = x1.toJSON();
    return {
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
  });
  return pagedGroups;
};

const updateGroup = async (groupId, body, userId) => {
  const updateData = {
    groupName: body.Name,
    groupDesc: body.Description,
    openToPublic: body.OpenToPublic,
    isCluster: body.IsCluster,
    owners: JSON.stringify(body.Owners) || '',
    servers: JSON.stringify(body.Servers) || '',
    contact: body.ContactInfo,
    ...dbUtil.fillCommonFileds(userId, true)
  };
  return await dbUtil.update(Group, { groupId }, updateData);
};

const getGroupDetail = async where => {
  const findGroup = await dbUtil.findOne(Group, where);
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
  return resData;
};

module.exports = {
  queryPagedGroups,
  updateGroup,
  getGroupDetail
};
