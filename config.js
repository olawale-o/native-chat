require('dotenv').config();
const { PORT, NODE_ENV, LOCAL_MONGODB_SINGLESET } = process.env;

module.exports = {
  PORT,
  NODE_ENV, 
  LOCAL_MONGODB_SINGLESET
};