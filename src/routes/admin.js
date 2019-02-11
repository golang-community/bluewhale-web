const express = require('express');
const { accountBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router
  .use(accountBiz.shouldLogin, accountBiz.shouldAdmin)
  //
  .post('/');

module.exports = {
  basePath: '/api/admin',
  router
};
