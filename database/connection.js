const { LOCAL_MONGODB_SINGLESET, NODE_ENV, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../config');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

module.exports = async function(client) {
  return client.connect(LOCAL_MONGODB_SINGLESET)
  .then((client) => {
    const db = client.db(DB_NAME);
    return 'done';
  });
};