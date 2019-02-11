const express = require('express');
const { accountBiz, forwardBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  .use(accountBiz.shouldLogin)
  // 转发请求
  .post('/', util.wrapAsyncFn(forwardBiz.forwardRequest));

module.exports = {
  basePath: '/api/forward',
  router
};
