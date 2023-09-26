const { LOCAL_MONGODB_SINGLESET } = require('../../../config');
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const Follower = client.db('socialdb').collection('followers');

const followers = async (credentials) => {
  const { userId } = credentials;
  const users = await Follower.aggregate([
    { $match: { followeeId: ObjectID(userId), $comment: "User followers" } },
    {
      $lookup: {
        from: "users",
        localField: "followerId",
        foreignField: "_id",
        as: "connection",
      }
    },
    { $unwind: { path: "$connection", } },
  ]).toArray();
  return users;
}

module.exports = {
  followers,
};
