const Sequelize = require('sequelize');
const config = require('../config');

class DBUtil {
  constructor(dbConf) {
    this.Sequelize = Sequelize;
    this.Op = Sequelize.Op;
    this.DBTypes = {
      stringNotNull() {
        return { type: Sequelize.STRING, allowNull: false };
      },
      tinyIntAsBool() {
        return { type: Sequelize.TINYINT, defaultValue: 0, allowNull: false };
      },
      commonFileds(onlyCreator = false) {
        const result = {
          createTime: { type: Sequelize.BIGINT, allowNull: false, field: 'create_time' },
          creatorId: { type: Sequelize.INTEGER, allowNull: false, field: 'creator_id' }
        };
        if (!onlyCreator) {
          result.modifyTime = { type: Sequelize.BIGINT, allowNull: false, field: 'modify_time' };
          result.modifierId = { type: Sequelize.INTEGER, allowNull: false, field: 'modifier_id' };
        }
        return result;
      }
    };

    this.sequelize = new Sequelize(dbConf.database, dbConf.username, dbConf.password, {
      dialect: 'sqlite', // 'mysql' | 'sqlite' | 'postgres' | 'mssql'
      // SQLite only
      storage: dbConf.dbFilePath,
      operatorsAliases: false,
      define: {
        underscored: false,
        freezeTableName: true,
        timestamps: false
      }
    });
  }
}

module.exports = new DBUtil({
  database: '',
  username: '',
  password: '',
  dbFilePath: config.dbFilePath
});
