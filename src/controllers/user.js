const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const dbFactory = require('./../db/dbFactory').factory;
const config = require('./../config');
const util = require('./../common/util');

let db = dbFactory.getCollection(config.dbConfigs.userCollection.name);

/*
UserInfo {
  UserID: 'admin',
  Password: 'xxxxxx',
  IsAdmin: true,
  FullName: 'xxx.xxx',
  Avatar: 'http:xxxx/dddd.png',
  Department: 'xxx',
  Email: 'xxx@xxx.com',
  InDate: 123313378,
  InUser: 'admin',
  EditDate: 123313378,
  EditUser: 'admin'
}
*/

exports.getAll = (req, res, next) => {
  let pageIndex = req.query.pageIndex || 1;
  let pageSize = req.query.pageSize || 10;
  let queryOption = {};
  if (req.query.q) {
    let regStr = `.*${req.query.q}.*`;
    queryOption = {
      $or: [{ UserID: { $regex: new RegExp(regStr) } }, { FullName: { $regex: new RegExp(regStr) } }]
    };
  }
  let skipCount = (pageIndex - 1) * pageSize;
  db.count(queryOption, (err, totalCount) => {
    if (err) return next(err);
    db.find(queryOption, { Password: -1 })
      .sort({ UserID: 1 })
      .skip(skipCount)
      .limit(pageSize)
      .exec((err, docs) => {
        if (err) return next(err);
        let result = {
          pageIndex: pageIndex,
          pageSize: pageSize,
          total_rows: totalCount,
          rows: docs
        };
        res.json(result);
      });
  });
};

exports.getById = (req, res, next) => {
  db.findOne({ _id: req.params.userId.toLowerCase() }, { Password: -1 }, (err, doc) => {
    if (err) return next(err);
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ result: false });
    }
  });
};

exports.getAvatar = (req, res, next) => {
  let userId = req.params.userId.toLowerCase();
  let avatarDir = path.join(__dirname, `./../public/avatar`);
  let avatarPath = `${avatarDir}/${userId}.png`;
  fs.exists(avatarPath, exists => {
    if (!exists) {
      avatarPath = `${avatarDir}/default.png`;
    }
    fs.readFile(avatarPath, (err, data) => {
      if (err) return next(err);
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': data.length
      });
      res.end(data);
    });
  });
};

exports.getCurrentUser = (req, res, next) => {
  let userId = req.session.currentUser.UserID;
  getUserById(userId)
    .then(userInfo => {
      res.json(userInfo);
    })
    .catch(err => next(err));
};

exports.search = (req, res, next) => {
  let q = req.query.q;
  if (!q) {
    return res.json([]);
  }
  let regStr = `.*${q}.*`;
  let queryOption = {
    $or: [{ UserID: { $regex: new RegExp(regStr) } }, { FullName: { $regex: new RegExp(regStr) } }]
  };
  db.find(queryOption, { UserID: 1, FullName: 1 })
    .sort({ UserID: 1 })
    .exec((err, docs) => {
      if (err) return next(err);
      res.json(docs);
    });
};

exports.register = (req, res, next) => {
  let password = util.md5Crypto(req.body.Password);
  let userInfo = JSON.parse(JSON.stringify(req.body));
  userInfo._id = req.body.UserID.toLowerCase();
  userInfo.Password = password;
  userInfo.IsAdmin = !!req.body.IsAdmin;
  userInfo.Avatar = req.body.Avatar || '/public/avatar/default.png';
  userInfo.InDate = userInfo.EditDate = new Date().valueOf();
  userInfo.InUser = userInfo.EditUser = req.session.currentUser.UserID;
  isExists(userInfo.UserID)
    .then(result => {
      if (result) {
        return next(new Error('UserID is exists.'));
      }
      db.insert(userInfo, (err, newDoc) => {
        if (err) return next(err);
        res.json({
          result: true
        });
      });
    })
    .catch(err => next(err));
};

exports.changePassword = (req, res, next) => {
  let oldPassword = util.md5Crypto(req.body.OldPassword);
  let query = {
    UserID: req.body.UserID,
    Password: oldPassword
  };
  db.findOne(query, (err, userInfo) => {
    if (err) return next(err);
    if (!userInfo) {
      let err = new Error('OldPassword is not correct.');
      return next(err);
    }
    let newPassword = util.md5Crypto(req.body.NewPassword);
    db.update({ UserID: req.body.UserID }, { $set: { Password: newPassword } }, {}, (err, numReplaced) => {
      if (err) return next(err);
      req.session.Password = newPassword;
      res.json({
        result: true
      });
    });
  });
};

exports.resetPassword = (req, res, next) => {
  let userID = req.body.UserID;
  isExists(userID)
    .then(result => {
      if (!result) {
        return next(new Error('UserID is not exists.'));
      } else {
        let password = util.md5Crypto('123456');
        db.update({ UserID: userID }, { $set: { Password: password } }, {}, (err, numReplaced) => {
          if (err) return next(err);
          res.json({
            result: true
          });
        });
      }
    })
    .catch(err => next(err));
};

exports.update = (req, res, next) => {
  let reqUser = req.session.currentUser;
  let updateOpt = {
    $set: {
      FullName: req.body.FullName,
      EditUser: reqUser.UserID,
      EditDate: new Date().valueOf()
    }
  };
  if (req.body.Avatar) {
    updateOpt['$set'].Avatar = req.body.Avatar;
  }
  if (req.body.Department) {
    updateOpt['$set'].Department = req.body.Department;
  }
  if (req.body.Email) {
    updateOpt['$set'].Email = req.body.Email;
  }
  if (reqUser.IsAdmin && typeof req.body.IsAdmin === 'boolean') {
    updateOpt['$set'].IsAdmin = req.body.IsAdmin;
  }
  let userId = req.params.userId.toLowerCase();
  isExists(userId)
    .then(result => {
      if (!result) {
        return next(new Error('UserID is not exists.'));
      } else {
        db.update({ UserID: userId }, updateOpt, {}, (err, numReplaced) => {
          if (err) return next(err);
          res.json({
            result: true
          });
        });
      }
    })
    .catch(err => next(err));
};

exports.remove = (req, res, next) => {
  let userId = req.params.userId;
  if (userId.toLowerCase() === 'admin') {
    return next(new Error('Cannot remove admin account.'));
  }
  if (userId === req.session.currentUser.UserID) {
    return next(new Error('Cannot remove yourself account.'));
  }
  db.remove({ UserID: userId }, {}, (err, numRemoved) => {
    if (err) return next(err);
    res.send({
      result: true
    });
  });
};

exports.initAdmin = () => {
  return new Promise((resolve, reject) => {
    db.findOne({ UserID: 'admin' }, (err, doc) => {
      if (err) return reject(err);
      if (doc) {
        return resolve(true);
      } else {
        let password = util.md5Crypto('123456');
        let user = {
          _id: 'admin',
          UserID: 'admin',
          Password: password,
          IsAdmin: true,
          FullName: 'Admin',
          Avatar: '/public/avatar/default.png',
          Department: '',
          Email: '',
          InDate: new Date().valueOf(),
          InUser: 'system',
          EditDate: new Date().valueOf(),
          EditUser: 'system'
        };
        db.insert(user, (err, newDoc) => {
          if (err) {
            return reject(err);
          }
          resolve(true);
        });
      }
    });
  });
};

let isExists = userId => {
  return new Promise((resolve, reject) => {
    let regStr = `^${userId}$`;
    db.findOne({ UserID: { $regex: new RegExp(regStr, 'i') } }, (err, userInfo) => {
      if (err) return reject(err);
      resolve(!!userInfo);
    });
  });
};

let getUserById = userId => {
  return new Promise((resolve, reject) => {
    db.findOne({ UserID: userId }, (err, userInfo) => {
      if (err) return next(err);
      if (!userInfo) {
        let err = new Error('User is not exists.');
        return reject(err);
      }
      return resolve(userInfo);
    });
  });
};
