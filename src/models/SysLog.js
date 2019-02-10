const { dbUtil } = require('../common');
const { sequelize, Sequelize, DBTypes } = dbUtil;
const User = require('./User');

const SysLog = sequelize.define('sys_log', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  groupId: { type: Sequelize.STRING, field: 'group_id', allowNull: false },
  server: DBTypes.stringNotNull(),
  type: DBTypes.stringNotNull(),
  content: Sequelize.STRING,
  ...DBTypes.commonFileds(true)
});

SysLog.belongsTo(User, { as: 'creator', foreignKey: 'creatorId', targetKey: 'id' });

module.exports = SysLog;
