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
    sessionCollection: { name: 'SessionInfo', ignoreLoad: true }
  }
};
