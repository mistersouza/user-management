const { populateCachedUsers } = require('../utils/populateCachedUsers');
let cachedUsers = {};

const initializeCache = async () => {
  cachedUsers = await populateCachedUsers();
  console.log('Cached users populated:', Object.keys(cachedUsers).length);
};

const attachCachedUsersToRequest = (request, response, next) => {
  request.cachedUsers = cachedUsers; 
  next();
};

module.exports = {
  initializeCache,
  attachCachedUsersToRequest
};
