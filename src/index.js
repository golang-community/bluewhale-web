const fse = require('fs-extra');
const path = require('path');
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('errorhandler');
require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss.l');
const NedbStore = require('nedb-session-store')(session);

const config = require('./config');
const { util } = require('./common');

// Process DB file
if (!fse.existsSync(config.dbFilePath)) {
  fse.ensureDirSync(path.dirname(config.dbFilePath));
  fse.copyFileSync(path.join(__dirname, 'db/bluewhale.db'), config.dbFilePath);
}

const app = express();
app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(
  session({
    secret: config.encryptKey,
    secure: true,
    name: 'bluewhale.sid',
    resave: true,
    saveUninitialized: true,
    httpOnly: true,
    store: new NedbStore({
      filename: path.join(__dirname, `./dbFiles/${config.dbConfigs.sessionCollection.name}.db`)
    })
  })
);
app.use(compression());
app.use((req, res, next) => {
  // 初始化状态传递对象
  req.state = {};
  // h5 fallback
  let ext = path.extname(req.url);
  if (ext && ext.length > 6) ext = null;
  if (req.method === 'GET' && !req.url.startsWith('/api') && !ext) {
    req.url = '/index.html';
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'wwwroot')));
// Load routes
util.loadRoutes(app, path.join(__dirname, 'routes'));

errorHandler.title = `Bluewhale WebSite - ${config.version}`;
app.use(errorHandler({ log: false }));

const server = app
  .listen(config.listenPort, () => {
    console.log(`Bluewhale web starting...,`, server.address());
  })
  .on('error', err => {
    console.error(err);
  });
