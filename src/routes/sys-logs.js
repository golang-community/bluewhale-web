const express = require('express');
const { util } = require('../common');
const { sysLogsBiz } = require('../bizs');

const router = express.Router();

router
  // 查询日志
  .get('/', util.wrapAsyncFn(sysLogsBiz.getSysLogs))
  // 写入日志
  .post('/', util.wrapAsyncFn(sysLogsBiz.createLog));

module.exports = {
  basePath: '/api/sys-logs',
  router
};
