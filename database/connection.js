const { LOCAL_MONGODB_SINGLESET } = require('../config');

module.exports = async function(client) {
  return client.connect(LOCAL_MONGODB_SINGLESET)
  .then((client) => {
    const db = client.db("socialdb");
    return 'done';
  });
};