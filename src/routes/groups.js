const express = require('express');
const { util } = require('../common');
const { accountBiz, groupsBiz } = require('../bizs');

const router = express.Router();

router
  .use(accountBiz.shouldLogin)
  // 获取用户所有的组
  .get('/', util.wrapAsyncFn(groupsBiz.getUserGroups))
  // 搜索用户
  .get('/user-search', util.wrapAsyncFn(groupsBiz.searchUserList))
  // 获取明细
  .get('/:groupId', util.wrapAsyncFn(groupsBiz.getGroupDetail))
  // 更新组
  .put('/:groupId', util.wrapAsyncFn(groupsBiz.updateGroup));

module.exports = {
  basePath: '/api/groups',
  router
};
