require('dotenv').config();
const { PORT, NODE_ENV, LOCAL_MONGODB_SINGLESET, REDIS_CONNECTION_URL } = process.env;

module.exports = {
  PORT,
  NODE_ENV, 
  LOCAL_MONGODB_SINGLESET,
  REDIS_CONNECTION_URL
};