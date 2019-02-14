const { dbUtil } = require('../common');
const { sequelize, Sequelize, DBTypes } = dbUtil;

const DataDict = sequelize.define('data_dict', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  dataKey: { type: Sequelize.STRING, field: 'data_key', allowNull: false },
  dataValue: { type: Sequelize.STRING, field: 'data_value', allowNull: false },
  ...DBTypes.commonFileds()
});

module.exports = DataDict;
