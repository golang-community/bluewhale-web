const { User } = require('../src/models');
const { util } = require('../src/common');

const now = Date.now();
User.create({
  createTime: now,
  creatorId: 0,
  modifierId: 0,
  modifyTime: now,
  username: 'admin',
  password: util.md5Crypto('123456'),
  userAvatar: '',
  isAdmin: 1,
  department: '',
  email: '',
  displayName: 'admin'
})
  .then(() => {
    console.log('init done');
    return User.count();
  })
  .then(total => {
    console.log('Total users:', total);
  });
