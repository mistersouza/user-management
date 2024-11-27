const client = require('../config/redis');

const getUsers = async () => {
  try {
    const keys = await client.keys('user:*');
    const usersArray = await Promise.all(
      keys.map(async (key) => {
        const user = await client.hGetAll(key);
        if (user && user.id) return user;
      })
    );
    // Return an object with user ID as key
    return usersArray.reduce((users, user) => {
      users[user.id] = user;
      return users;
    }, {});
  } catch (error) {
    console.error('Error populating cached users:', error);
    return {};
  }
};

module.exports = {
  populateCachedUsers: async () => {
    return await getUsers(); 
  }
};
