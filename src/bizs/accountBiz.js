const { util } = require('../common');
const { User } = require('../models');

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7天

const doLogin = async (req, res, next) => {
  const { body } = req;
  const password = util.md5Crypto(body.Password);
  let loginUser = await User.findOne({
    where: {
      username: body.UserID,
      password
    }
  });
  // 全匹配验证
  if (!loginUser || loginUser.username !== body.UserID) {
    const err = new Error('UserID or Password is not correct.');
    err.statusCode = 401;
    return next(err);
  }
  loginUser = loginUser.toJSON();
  delete loginUser.password;

  req.session.user = loginUser;
  if (!!body.RememberMe) {
    req.session.cookie.maxAge = SEVEN_DAYS; // 保存7天
  }
  res.json(loginUser);
};

const doLogout = async (req, res) => {
  const cookies = req.cookies;
  Object.keys(cookies).forEach(key => {
    res.cookie(key, '', { maxAge: -1 });
  });
  req.session.user = null;
  res.json({ result: true });
};

const getLoginUser = async (req, res) => {
  const result = {
    IsLogin: false
  };
  if (req.session.user) {
    result.IsLogin = true;
    result.UserInfo = req.session.user;
  }
  res.json(result);
};

const shouldLogin = (req, res, next) => {
  if (req.session.user) {
    if (req.session.cookie.originalMaxAge && req.session.cookie.originalMaxAge < 20 * 60 * 1000) {
      req.session.cookie.maxAge = 20 * 60 * 1000;
    }
    next();
  } else {
    const error = new Error('UnAuthorization. Not login.');
    error.statusCode = 401;
    next(error);
  }
};

const shouldAdmin = (req, res, next) => {
  // 正常情况
  if (req.session.user.isAdmin) {
    return next();
  }
  const error = new Error('Insufficient permissions.');
  error.statusCode = 403;
  next(error);
};

module.exports = {
  doLogin,
  doLogout,
  getLoginUser,

  shouldLogin,
  shouldAdmin
};
