const { LOCAL_MONGODB_SINGLESET, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME, NODE_ENV } = require('../config');
const { MongoClient, ObjectId } = require('mongodb');

const { MongoDBMessageStorage, InMemoryMessageStorage, RedisMessageStorage } = require('./messageStorage');
const { InMemmoryStore, RedisSessionStorage } = require('./sessionStorage');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;
const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const { find } = require("../src/user/services/User");

const onConnect = require('./connection');

const sessionHandler = require('./middlewares/session');

const memoryStorage = new InMemoryMessageStorage();

const mongoStorage = new MongoDBMessageStorage(client);

// const memorySession = new InMemmoryStore();

const User = client.db(DB_NAME).collection('users');

const fetchUsersFromDB = async (userId) => {
  return await User.find({ _id: { $ne: ObjectId(userId) }}).toArray();
}

const getMessagesForUserFromMongoDB = async (userId) => {
  const messagesPerUser = new Map();
  const messages = await mongoStorage.findMessagesForUser(userId);
  messages.forEach((message) => {
    const { from, to } = message;
    const otherUser = userId.toString() === from.toString() ? to.toString() : from.toString();
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  });
  return messagesPerUser;
}

const getMessagesForUser = (userId) => {
  const messagesPerUser = new Map();
  memoryStorage.findMessagesForUser(userId).forEach((message) => {
    const { from, to } = message;
    const otherUser = userId === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  });
  return messagesPerUser;
}


module.exports = function(IO, redisClient) {
  const redisSession = new RedisSessionStorage(redisClient);
  const redisMessageStorage = new RedisMessageStorage(redisClient);

  const getMessagesForUserFromRedisStore = async (userId) => {
    const messagesPerUser = new Map();
    const messages = await redisMessageStorage.findMessagesForUser(userId);
    messages.forEach((message) => {
      const { from, to } = message;
      const otherUser = userId === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message])
      }
    });
    return messagesPerUser;
  };

  IO.use(sessionHandler(redisSession, find));

  IO.on('connection', onConnect({ redisSession, redisMessageStorage, mongoStorage, getMessagesForUserFromRedisStore, IO }));
}