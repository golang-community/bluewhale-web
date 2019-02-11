const { util } = require('../common');
const { SysLog, User } = require('../models');

const getSysLogs = async (req, res) => {
  const { query } = req;
  const pageSize = Math.max(1, util.ensureNumber(query.pageSize, 10)); // 每页记录数，最小为 1
  const pageIndex = Math.max(1, util.ensureNumber(query.pageIndex, 1)); // 当前查询页数，最小为1
  const where = {};
  if (query.Group) {
    where.groupId = query.Group;
  }
  if (query.Server) {
    where.server = query.Server;
  }
  if (query.Type) {
    where.type = query.Type;
  }
  const order = [['create_time', 'DESC']];
  const pagingData = await SysLog.findAndCountAll({
    where,
    order,
    limit: pageSize,
    offset: (pageIndex - 1) * pageSize,
    include: [{ model: User, as: 'creator', required: false }]
  });
  const resData = {
    pageIndex,
    pageSize,
    rows: pagingData.rows.map(x => {
      const item = x.toJSON();
      const itemCreator = item.creator || {};
      return {
        LogId: item.id,
        Group: item.groupId,
        Server: item.server,
        Type: item.type,
        Content: item.content,
        UserId: itemCreator.username,
        FullName: itemCreator.displayName,
        InDate: item.createTime
      };
    }),
    total_rows: pagingData.count
  };
  res.json(resData);
};

const createLog = async (req, res) => {
  const { body } = req;
  const sysLogModel = new SysLog({
    groupId: body.Group,
    server: body.Server,
    type: body.Type,
    content: body.Content,
    creatorId: 1,
    createTime: Date.now()
  });
  await sysLogModel.save();
  res.json({ result: true });
};

module.exports = {
  getSysLogs,
  createLog
};
