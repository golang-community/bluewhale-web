const crypto = require('crypto');

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

module.exports = {
  md5Crypto,
  cipher,
  decipher,
  wrapAsyncFn,
  ensureArray
};
