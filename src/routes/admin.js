const express = require('express');
const { accountBiz, adminBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  .use(accountBiz.shouldLogin/*, accountBiz.shouldAdmin*/)
  // ---------------------------------用户管理--------------------
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
  .post('/users/:userId/reset-pwd', util.wrapAsyncFn(adminBiz.resetUserPassword))
  // ------------------------------- 系统配置 -------------------------
  // 获取系统配置
  .get('/sys-config', util.wrapAsyncFn(adminBiz.getSysConfig))
  // 保存系统配置
  .post('/sys-config/save', util.wrapAsyncFn(adminBiz.saveSysConfig))
  // ------------------------------- Group路由 ------------------------
  // 获取Group列表
  .get('/groups', util.wrapAsyncFn(adminBiz.getAllGroups))
  // 创建Group
  .post('/groups', util.wrapAsyncFn(adminBiz.createGroup))
  // 修改Group
  .put('/groups/:groupId', util.wrapAsyncFn(adminBiz.updateGroup))
  // 删除Group
  .delete('/groups/:groupId', util.wrapAsyncFn(adminBiz.deleteGroup));

module.exports = {
  basePath: '/api/admin',
  router
};
