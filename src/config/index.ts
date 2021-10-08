import * as path from 'path';

export const config = {
  debugMode: true,
  port: process.env.BLUEWHALE_LISTEN_PORT || 8100,
  encryptKey: 'humpback@123',
  dbFilePath: path.join(__dirname, '../dbFiles/bluewhale.db'),
};
