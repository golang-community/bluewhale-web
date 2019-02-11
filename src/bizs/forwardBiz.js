const request = require('request');
const dbFactory = require('../db/dbFactory').factory;
const config = require('../config');
const { util } = require('../common');

const db = dbFactory.getCollection(config.dbConfigs.groupCollection.name);

const _getServerAuthToken = async (groupId, server) => {
  const group = await new Promise((resolve, reject) => {
    db.findOne({ ID: groupId }, (err, doc) => {
      if (err) return reject(err);
      resolve(doc);
    });
  });
  if (group) {
    const findServer = util.ensureArray(group.Servers).find(x => x.IP === server);
    if (findServer && findServer.authToken) {
      return findServer.authToken;
    }
  }
  return '';
};

const forwardRequest = async (req, res, next) => {
  const body = req.body;
  if (!body.groupId || !body.server || !body.url || !body.method) {
    return next(new Error('Invalid request.'));
  }
  // Get auth
  const authHeaders = {};
  const authToken = await _getServerAuthToken(body.groupId, body.server);
  if (authToken) {
    authHeaders['Authorization'] = authToken;
  }

  const proxyReq = request({
    method: body.method,
    url: body.url,
    body: body.reqBody,
    headers: { ...body.reqHeaders, ...authHeaders }
  });
  proxyReq.pipe(res);
};

module.exports = {
  forwardRequest
};
