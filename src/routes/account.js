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
  .get('/isLogin', util.wrapAsyncFn(accountBiz.getLoginUser));

module.exports = {
  basePath: '/api/account',
  router
};
