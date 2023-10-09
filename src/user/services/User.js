const { LOCAL_MONGODB_SINGLESET } = require('../../../config');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const User = client.db('socialdb').collection('users');

const register = async (credentials) => {
  try {
    const { email, username, password } = credentials;
    const isFound = await User.findOne({ $or: [ { email },  { username}] });

    if (isFound) {
      return { status: 409, message: 'Kindly login with your credentials' };
    }
    const hashedPassword = Crypto.encryptData(password);
    const create = (await User.insertOne({ email, username, password: hashedPassword })).insertedId;
    if (!create) {
      return { status: 400, message: 'Bad Request' };
    }
    return { status: 201, message: 'Account created' };
  } catch (error) {
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
    const user = await User.findOneAndUpdate({ username, $comment: "Find user by username" }, { $set: { online: true } }).value;
    return {
      status: 200,
      message: 'Login successful',
      user
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
