const { LOCAL_MONGODB_SINGLESET } = require('../../../config');
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const Following = client.db('socialdb').collection('following');

const following = async (credentials) => {
  const { userId } = credentials;
  const users = await Following.aggregate([
    { $match: { followerId: ObjectID(userId), $comment: "User following"  } },
    {
      $lookup: {
        from: "users",
        localField: "followeeId",
        foreignField: "_id",
        as: "connection"
      }
    },
    { $unwind: { path: "$connection" } },
  ]).toArray();

  return users;
}

module.exports = {
  following,
};
