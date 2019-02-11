const express = require('express');
const config = require('../config');

const router = express.Router();

router
  // FAQ
  .get('/', (req, res) => res.json(config));

module.exports = {
  basePath: '/api/faq',
  router
};
