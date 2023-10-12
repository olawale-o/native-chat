const { LOCAL_MONGODB_SINGLESET, NODE_ENV, REDIS_CONNECTION_URL, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../../../config');
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

const redisClient = new Redis(NODE_ENV !== 'development' ? REDIS_CONNECTION_URL : null);

const Following = client.db(DB_NAME).collection('following');
const User = client.db(DB_NAME).collection('users');

const following = async (credentials) => {
  const { userId } = credentials;

  const followings = await redisClient.zrange(`user:${userId}:following`, 0, -1,);
  const followingIds = followings.map((id) => ObjectID(id));
  const users = await User.find({
    _id: { $in: followingIds } },
  ).project({ name: 1, username: 1, online: 1, avatar: 1}).toArray();
  // const users = await Following.aggregate([
  //   { $match: { followerId: ObjectID(userId), $comment: "User following"  } },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "followeeId",
  //       foreignField: "_id",
  //       as: "connection"
  //     }
  //   },
  //   { $unwind: { path: "$connection" } },
  //   {
  //     $project: {
  //       _id: "$connection._id",
  //       fullname: '$connection.fullname',
  //       username: '$connection.username',
  //       online: "$connection.online",
  //       avatar: '$connection.avatar'
  //     }
  //   }
  // ]).toArray();
  return users;
}

module.exports = {
  following,
};
