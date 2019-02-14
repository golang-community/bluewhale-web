const express = require('express');
const { util } = require('../common');
const { accountBiz, groupsBiz } = require('../bizs');

const router = express.Router();

router
  .use(accountBiz.shouldLogin)
  // 获取用户所有的组
  .get('/', util.wrapAsyncFn(groupsBiz.getUserGroups));

module.exports = {
  basePath: '/api/groups',
  router
};
