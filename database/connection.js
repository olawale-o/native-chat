const { LOCAL_MONGODB_SINGLESET, NODE_ENV, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../config');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

module.exports = async function(client) {
  console.log(LOCAL_MONGODB_SINGLESET);
  return client.connect('mongodb+srv://native-chat-main-db-025066a14b7:V81EYyszHSz5hfqGQshw3RYJMeEU37@prod-us-central1-2.ih9la.mongodb.net/native-chat-main-db-025066a14b7')
  .then((client) => {
    const db = client.db(DB_NAME);
    return 'done';
  });
};