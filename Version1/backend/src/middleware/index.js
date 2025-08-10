const auth = require('./auth');
const validation = require('./validation');
const rateLimiter = require('./rateLimiter');
const errorHandler = require('./errorHandler');

module.exports = {
  ...auth,
  ...validation,
  ...rateLimiter,
  ...errorHandler
};
