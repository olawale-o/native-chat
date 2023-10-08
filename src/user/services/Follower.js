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
    {
      $project: {
        _id: "$connection._id",
        fullname: '$connection.fullname',
        username: '$connection.username',
        online: "$connection.online",
        avatar: '$connection.avatar'
      }
    }
  ]).toArray();
  return users;
}
const getContacts = async ({ userId }) => {
  const contacts = await Follower.aggregate([
    { $match: {followeeId: ObjectID(userId)} },
    { 
      $lookup: { 
        from: "users",
        localField: "followerId",
        foreignField: "_id",
        as: "details"
      } 
    },
    { $unionWith: {
      coll:  "following",
      pipeline: [
        {$match: {followerId: ObjectID(userId)}},
        { 
          $lookup: { 
            from: "users",
            localField: "followeeId",
            foreignField: "_id",
            as: "details"
          } 
        },
      ]
    } },
    {
      $unwind: "$details"
    },
    {
      $group: {
        _id: "$details"
      }
    },
    {
      $project: {
        _id: 0,
        userId: "$_id._id",
        username: "$_id.username",
        email: "$_id.email",
        avatar: "$_id.avatar",
        fullname: "$_id.fullname",
        online: "$_id.online",
      }
    }
  ]).toArray();
  return contacts;
}
module.exports = {
  followers,
  getContacts
};
