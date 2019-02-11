const path = require('path');

module.exports = {
  debugMode: true,
  listenPort: process.env.HUMPBACK_LISTEN_PORT || 8100,
  encryptKey: 'humpback@123',
  dbFilePath: path.join(__dirname, '../dbFiles/bluewhale.db'),
  // For old
  version: '1.0.0',
  isDebugMode: true,
  dbConfigs: {
    groupCollection: { name: 'GroupInfo' },
    imageCollection: { name: 'ImageInfo' },
    userCollection: { name: 'UserInfo' },
    logCollection: { name: 'LogInfo', ttl: 30 * 24 * 60 * 60 },
    sessionCollection: { name: 'SessionInfo', ignoreLoad: true },
    systemConfigCollection: { name: 'SystemConfig' },
    dashboardCollection: { name: 'Dashboard' }
  }
};
