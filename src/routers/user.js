const express = require('express');
const userCtrl = require('./../controllers/user');
const userValidator = require('./../validators/user');

let router = express.Router();

router.get('/', userValidator.isAdmin, userCtrl.getAll);

router.get('/avatar/:userId', userCtrl.getAvatar);

router.get('/search', userCtrl.search);

router.get('/:userId', userCtrl.getById);

router.post('/register', userValidator.validateRegister, userCtrl.register);

router.put('/reset-password', userValidator.isAdmin, userValidator.validateResetPassword, userCtrl.resetPassword);

router.delete('/:userId', userValidator.isAdmin, userCtrl.remove);

module.exports = router;
