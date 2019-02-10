const express = require('express');
const { forwardBiz } = require('../bizs');
const { util } = require('../common');

const router = express.Router();

router.post('/', util.wrapAsyncFn(forwardBiz.forwardRequest));

module.exports = router;
