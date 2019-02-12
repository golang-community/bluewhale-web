const express = require('express');
const { accountBiz, adminBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  .use(accountBiz.shouldLogin, accountBiz.shouldAdmin)
  // 获取用户列表
  .get('/users', util.wrapAsyncFn(adminBiz.getPagedUserList))
  // 添加用户
  .post('/users', util.wrapAsyncFn(adminBiz.createNewUser))
  // 更新指定用户信息
  .put('/users/:userId', util.wrapAsyncFn(adminBiz.updateUserInfo))
  // 获取指定用户明细
  .get('/users/:userId', util.wrapAsyncFn(adminBiz.getUserInfoById))
  // 删除指定用户
  .delete('/users/:userId', util.wrapAsyncFn(adminBiz.deleteUserById))
  // 重置指定用户密码
  .post('/users/:userId/reset-pwd', util.wrapAsyncFn(adminBiz.resetUserPassword));

module.exports = {
  basePath: '/api/admin',
  router
};
