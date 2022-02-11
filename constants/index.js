require('dotenv').config()
const { PORT, MONGODB_USERNAME, MONGODB_PASSWORD, NODE_ENV, APP_NAME} = process.env;

module.exports = {
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  envVariables: {
    PORT,
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    NODE_ENV,
    APP_NAME,
  },
};
