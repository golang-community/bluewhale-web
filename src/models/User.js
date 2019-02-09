const { dbUtil } = require('../common');
const { sequelize, Sequelize, DBTypes, CommonFileds } = dbUtil;

const User = sequelize.define('user', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  username: DBTypes.stringNotNull(),
  password: DBTypes.stringNotNull(),
  displayName: { type: Sequelize.STRING, field: 'display_name' },
  userAvatar: { type: Sequelize.STRING, field: 'user_avatar' },
  department: Sequelize.STRING,
  email: Sequelize.STRING,
  isAdmin: DBTypes.tinyIntAsBool(), // { type: Sequelize.TINYINT, defaultValue: 0, allowNull: false }
  ...CommonFileds
});

module.exports = User;
