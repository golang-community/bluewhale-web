const express = require('express');
const { accountBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  // 执行登录
  .post('/login', util.wrapAsyncFn(accountBiz.doLogin))
  // 登出
  .get('/logout', util.wrapAsyncFn(accountBiz.doLogout))
  // 检查登录
  .get('/isLogin', util.wrapAsyncFn(accountBiz.getLoginUser))
  // 修改密码
  .put('/change-password', accountBiz.shouldLogin, util.wrapAsyncFn(accountBiz.changePassword))
  // 更新用户信息
  .put('/update', accountBiz.shouldLogin, util.wrapAsyncFn(accountBiz.updateUserInfo))
  // 获取当前登录用户信息
  .get('/me', accountBiz.shouldLogin, util.wrapAsyncFn(accountBiz.getSessionUser));

module.exports = {
  basePath: '/api/account',
  router
};
