const express = require('express');
const logsCtrl = require('./../controllers/log');
const logValidator = require('./../validators/log');
const { util } = require('../common');
const { sysLogsBiz } = require('../bizs');

const router = express.Router();

router
  // 查询日志
  .get('/', util.wrapAsyncFn(sysLogsBiz.getSysLogs))
  // 写入日志
  .post('/', util.wrapAsyncFn(sysLogsBiz.createLog), logValidator.validate, logsCtrl.add);

module.exports = {
  basePath: '/api/sys-logs',
  router
};
