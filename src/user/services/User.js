const { REMOTE_MONGODB_REPLSET, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME, NODE_ENV } = require('../../../config');
const { MongoClient, ObjectId } = require('mongodb');
const Crypto = require('../../lib/crypto');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

const client = new MongoClient(REMOTE_MONGODB_REPLSET);

const User = client.db(DB_NAME).collection('users');

const register = async (credentials) => {
  try {
    const { email, username, name, password } = credentials;
    const isFound = await User.findOne({ $or: [ { email },  { username}] });

    if (isFound) {
      return { status: 409, message: 'Kindly login with your credentials' };
    }
    const hashedPassword = Crypto.encryptData(password);
    const create = await User.findOneAndUpdate(
      {_id: ObjectId() },
      { $setOnInsert: {
        email,
        username,
        name,
        online: true,
        password: hashedPassword,
        avatar: 'https://robohash.org/102.89.23.93.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdAtTime: Math.ceil(new Date() / 1000),
        updatedAtTime: Math.ceil(new Date() / 1000),
        updatedAtTime: Math.ceil(new Date() / 1000),
        lastSeen: Math.ceil(new Date() / 1000),
      }},
    { upsert: true, returnDocument: 'after' }
    );
    if (!create) {
      return { status: 400, message: 'Bad Request' };
    }
    return {
      status: 201,
      message: 'Account created',
      user: {
        email: create.value.email,
        id: create.value._id,
        _id: create.value._id,
        online: create.value.online,
        username: create.value.username,
        avatar: create.value.avatar,
      }
    };
  } catch (error) {
    console.log(error);
    return { status: 500, messadge: 'Internal Server Error' };
  }
}

const login = async (credentials) => {
  try {
    const { username, password } = credentials;
    const isFound = await User.findOne({ $or: [ { email: username }, { username}] });

    if (!isFound) {
      return { status: 404, message: 'Please enter a valid credentials' };
    }

    const decrypted = Crypto.decryptData(isFound.password);
    if (password !== decrypted) {
      return { status: 403, message: 'Please enter a valid credentials to login' };
    }
    const data = await User.findOneAndUpdate({
      username,
      $comment: "Find user by username"
    },
    { $set: {
      online: true,
      updatedAt: new Date(),
      lastSeen: Math.ceil(new Date() / 1000)
    },
    },
    { upsert: true, returnDocument: 'after' }
    );
    return {
      status: 200,
      message: 'Login successful',
      user: {
        email: data.value.email,
        id: data.value._id,
        _id: data.value._id,
        online: data.value.online,
        username: data.value.username,
        avatar: data.value.avatar,
      }
    };
  } catch (error) {
    return { status: 500, messadge: 'Internal Server Error' };
  }
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
