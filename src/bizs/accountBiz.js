const { util, dbUtil } = require('../common');
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

  const sessionUser = {
    id: loginUser.id,
    UserID: loginUser.username,
    IsAdmin: loginUser.isAdmin,
    FullName: loginUser.displayName,
    Avatar: loginUser.userAvatar,
    Department: loginUser.department,
    Email: loginUser.email
  };

  req.session.user = sessionUser;
  if (!!body.RememberMe) {
    req.session.cookie.maxAge = SEVEN_DAYS; // 保存7天
  }
  res.json(sessionUser);
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

const changePassword = async (req, res, next) => {
  const { body } = req;
  const { user } = req.state;
  const oldPassword = util.md5Crypto(body.OldPassword);
  const findUser = await User.findOne({
    where: {
      id: user.userId
    }
  });
  if (!findUser || findUser.password !== oldPassword) {
    let err = new Error('OldPassword is not correct.');
    return next(err);
  }
  const newPassword = util.md5Crypto(body.NewPassword);
  const updateData = {
    password: newPassword,
    ...dbUtil.fillCommonFileds(true)
  };
  await User.update(updateData, { where: { id: findUser.id } });
  res.json({
    result: true
  });
};

const updateUserInfo = async (req, res) => {
  const user = req.session.user;
  const { body } = req;

  const updateData = {
    modifyTime: Date.now(),
    modifierId: user.id,
    displayName: body.FullName
  };
  if (body.Avatar) {
    updateData.userAvatar = body.Avatar;
  }
  if (body.Department) {
    updateData.department = body.Department;
  }
  if (body.Email) {
    updateData.email = body.Email;
  }

  await User.update(updateData, { where: { id: user.id } });
  res.json({
    result: true
  });
};

const getSessionUser = async (req, res, next) => {
  const user = req.session.user;
  const findUser = await User.findById(user.id);
  if (!findUser) {
    return next(new Error('User not found.'));
  }
  const resData = {
    Email: findUser.email,
    Department: findUser.department,
    Avatar: findUser.userAvatar,
    FullName: findUser.displayName
  };
  res.json(resData);
};

const shouldLogin = (req, res, next) => {
  const user = req.session.user;
  if (user) {
    if (req.session.cookie.originalMaxAge && req.session.cookie.originalMaxAge < 20 * 60 * 1000) {
      req.session.cookie.maxAge = 20 * 60 * 1000;
    }
    req.state.user = { userId: user.id, username: user.UserID };
    next();
  } else {
    const error = new Error('UnAuthorization. Not login.');
    error.statusCode = 401;
    next(error);
  }
};

const shouldAdmin = (req, res, next) => {
  // 正常情况
  const user = req.session.user;
  if (user.isAdmin || user.IsAdmin) {
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
  changePassword,
  updateUserInfo,
  getSessionUser,

  shouldLogin,
  shouldAdmin
};
