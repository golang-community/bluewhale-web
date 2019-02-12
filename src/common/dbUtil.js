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

  /**
   * 查询分页列表
   * @param {Sequelize.Model} Model
   * @param {sequelize.WhereOptions} where
   * @param {object} pagingInfo
   * @param {number} pagingInfo.index 当前页码
   * @param {number} pagingInfo.size 每页记录数
   * @param {object} options
   * @param {Array<Array>} options.sort 排序代码，如 [['ID', 'DESC']]
   * @param {Array | {include?: Array, exclude?:Array}} options.attrs 要查询的字段
   * @param {any} options.transaction 要查询的字段
   */
  queryPagedList(Model, where, pagingInfo = { size: 20, index: 1 }, options = {}) {
    return Model.findAll(this._buildFindOptions(where, pagingInfo, options));
  }

  /**
   * 查询列表
   * @param {Sequelize.Model} Model
   * @param {sequelize.WhereOptions} where
   * @param {object} options
   * @param {Array<Array>} options.sort 排序代码，如 [['ID', 'DESC']]
   * @param {Array | {include?: Array, exclude?:Array}} options.attrs 要查询的字段
   * @param {any} options.transaction 要查询的字段
   */
  queryList(Model, where, options = {}) {
    return Model.findAll(this._buildFindOptions(where, null, options));
  }

  /**
   * 有则更新，无则新增对象
   * @param {Sequelize.Model} Model
   * @param {object} modelInstance
   */
  upsert(Model, modelInstance) {
    return Model.upsert(modelInstance, { transaction });
  }

  /**
   * 删除指定的数据
   * @param {Sequelize.Model} Model
   * @param {sequelize.WhereOptions} where 条件
   * @param {transaction} transaction 事务对象
   */
  deleteAll(Model, where, transaction = null) {
    const opt = { where };
    if (transaction) {
      opt.transaction = transaction;
    }
    return Model.destroy(opt);
  }

  /**
   * 更新指定的数据
   * @param {Sequelize.Model} Model
   * @param {sequelize.WhereOptions} where 条件
   * @param {transaction} transaction 事务对象
   */
  update(Model, where, transaction) {
    const opt = { where };
    if (transaction) {
      opt.transaction = transaction;
    }
    return Model.update(updateData, opt);
  }

  /**
   * 通过主键查询
   * @param {Sequelize.Model} Model
   * @param {string | number} pk 主键
   */
  findByPk(Model, pk) {
    return Model.findByPk(pk);
  }
  /**
   * 查询单个实体
   * @param {Sequelize.Model} Model
   * @param {sequelize.WhereOptions} where
   * @param {object} options
   * @param {Array<Array>} options.sort 排序代码，如 [['ID', 'DESC']]
   * @param {Array | {include?: Array, exclude?:Array}} options.attrs 要查询的字段
   * @param {any} options.transaction 要查询的字段
   */
  findOne(Model, where, options) {
    return Model.findOne(this._buildFindOptions(where, null, options));
  }

  /**
   * 构造查询配置
   * @param {sequelize.WhereOptions} where
   * @param {object} pagingInfo
   * @param {number} pagingInfo.index 当前页码
   * @param {number} pagingInfo.size 每页记录数
   * @param {object} options
   * @param {Array<Array>} options.sort 排序代码，如 [['ID', 'DESC']]
   * @param {Array | {include?: Array, exclude?:Array}} options.attrs 要查询的字段
   * @param {any} options.transaction 要查询的字段
   */
  _buildFindOptions(where, pagingInfo = null, options = {}) {
    const opt = {
      where
    };
    // 处理分页
    if (pagingInfo) {
      opt.limit = pagingInfo.size;
      opt.offset = (pagingInfo.index - 1) * pagingInfo.size;
    }
    // 处理排序，查询字段和事务
    if (options) {
      if (options.sort) {
        opt.order = options.sort;
      }
      if (options.attrs) {
        opt.attributes = options.attrs;
      }
      if (options.transaction) {
        opt.transaction = options.transaction;
      }
    }
    return opt;
  }
}

module.exports = new DBUtil({
  database: '',
  username: '',
  password: '',
  dbFilePath: config.dbFilePath
});
