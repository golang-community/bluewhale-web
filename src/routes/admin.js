const express = require('express');
const { forwardBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  // 转发请求
  .post('/', util.wrapAsyncFn(forwardBiz.forwardRequest));

module.exports = {
  basePath: '/api/admin',
  router
};
