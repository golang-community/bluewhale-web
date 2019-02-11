const { dbUtil } = require('../common');
const { sequelize, Sequelize, DBTypes } = dbUtil;

const Group = sequelize.define('group', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  groupId: { type: Sequelize.STRING, field: 'group_id', allowNull: false },
  groupName: { type: Sequelize.STRING, field: 'group_name', allowNull: false },
  groupDesc: { type: Sequelize.STRING, field: 'group_desc' },
  openToPublic: { type: Sequelize.BOOLEAN, field: 'open_to_public', defaultValue: 0 },
  isCluster: { type: Sequelize.BOOLEAN, field: 'is_cluster', defaultValue: 0 },
  owners: DBTypes.stringNotNull(),
  servers: DBTypes.stringNotNull(),
  contact: DBTypes.stringNotNull(),
  ...DBTypes.commonFileds(),
  isDeleted: { type: Sequelize.BOOLEAN, field: 'is_deleted', defaultValue: 0 }
});

module.exports = Group;
