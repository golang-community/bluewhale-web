const { dbUtil } = require('../common');
const { sequelize, Sequelize, DBTypes } = dbUtil;

const DataDict = sequelize.define('sys_log', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  dataKey: { type: Sequelize.STRING, field: 'data_key', allowNull: false },
  dataValue: { type: Sequelize.STRING, field: 'data_value', allowNull: false },
  ...DBTypes.commonFileds(true)
});

module.exports = DataDict;
