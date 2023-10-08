const { LOCAL_MONGODB_SINGLESET } = require('../../../config');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const User = client.db('socialdb').collection('users');

const register = async (credentials) => {
  const { name, username } = credentials;
  const newUser = { name, username, createdAt: new Date(), updatedAt: new Date(), };
  const userId = await User.insertOne(newUser);
  return {
    newUser, userId
  };
}

const login = async (credentials) => {
  const { username } = credentials;
  return (await User.findOneAndUpdate({ username, $comment: "Find user by username" }, { $set: { online: true } })).value;
};

const find = async (userId) => {
  return await User.findOne({ _id: ObjectId(userId) });
}

const disconnect = async (userId) => {
  return await User.findOneAndUpdate({ _id: ObjectId(userId) },  { $set: { online: false } });
}

module.exports = {
  login,
  register,
  disconnect,
  find
};
