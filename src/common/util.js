const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

const md5Crypto = (text, salt) => {
  salt = salt || 'hb@123';
  const str = `${text}-${salt}`;
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
};

const cipher = (algorithm, key, value) => {
  var encrypted = '';
  var cip = crypto.createCipher(algorithm, key);
  encrypted += cip.update(value, 'utf8', 'hex');
  encrypted += cip.final('hex');
  return encrypted;
};

const decipher = (algorithm, key, encrypted) => {
  var decrypted = '';
  var decipher = crypto.createDecipher(algorithm, key);
  decrypted += decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const wrapAsyncFn = fn => {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => {
        return fn(req, res, next);
      })
      .catch(next);
  };
};

const ensureArray = arr => {
  return Array.isArray(arr) ? arr : [];
};

const ensureNumber = (num, defaultVal = 0) => {
  num = +num;
  if (num !== num) {
    return defaultVal;
  }
  return num;
};

const loadRoutes = (app, routesFolder) => {
  fs.readdirSync(routesFolder).forEach(name => {
    const jsFile = path.join(routesFolder, name);
    if (fs.statSync(jsFile).isFile()) {
      const routeInfo = require(jsFile);
      if (routeInfo.basePath && routeInfo.router) {
        app.use(routeInfo.basePath, routeInfo.router);
        console.info(`Load route ok, basePath = ${routeInfo.basePath}`);
      }
    }
  });
};

const safeJSONParse = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};

const newGuid = () => {
  return uuid.v4().replace(/-/g, '');
};

module.exports = {
  md5Crypto,
  cipher,
  decipher,
  wrapAsyncFn,
  ensureArray,
  ensureNumber,
  loadRoutes,
  safeJSONParse,
  newGuid
};
