const express = require('express');
const { util } = require('../common');
const { accountBiz, sysLogsBiz } = require('../bizs');

const router = express.Router();

router
  .use(accountBiz.shouldLogin)
  // 查询日志
  .get('/', util.wrapAsyncFn(sysLogsBiz.getSysLogs))
  // 写入日志
  .post('/', util.wrapAsyncFn(sysLogsBiz.createLog));

module.exports = {
  basePath: '/api/sys-logs',
  router
};
