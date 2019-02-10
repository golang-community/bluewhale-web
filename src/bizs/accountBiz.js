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

module.exports = {
  doLogin,
  doLogout,
  getLoginUser
};
