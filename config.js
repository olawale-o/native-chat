require('dotenv').config();
const {
  PORT,
  NODE_ENV,
  LOCAL_MONGODB_SINGLESET,
  REDIS_CONNECTION_URL,
  ENCRYPTION_KEY,
  ENCRYPTION_IV,
  ENCRYPTION_ALGORITHM,
} = process.env;

module.exports = {
  PORT,
  NODE_ENV, 
  LOCAL_MONGODB_SINGLESET,
  REDIS_CONNECTION_URL,
  ENCRYPTION_KEY,
  ENCRYPTION_IV,
  ENCRYPTION_ALGORITHM
};