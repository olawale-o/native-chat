const { LOCAL_MONGODB_SINGLESET, NODE_ENV, REDIS_CONNECTION_URL, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../../../config');
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);


const redisClient = new Redis(NODE_ENV !== 'development' ? REDIS_CONNECTION_URL : null);

const Follower = client.db().collection('followers');
const User = client.db(DB_NAME).collection('users');

const followers = async (credentials) => {
  const { userId } = credentials;

  const followers = await redisClient.zrange(`user:${userId}:followers`, 0, -1,);

  const followersIds = followers.map((id) => ObjectID(id));

  const users = await User.find({_id: { $in: followersIds } },
  ).project({ name: 1, username: 1, online: 1, avatar: 1}).toArray();

  // const users = await Follower.aggregate([
  //   { $match: { followeeId: ObjectID(userId), $comment: "User followers" } },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "followerId",
  //       foreignField: "_id",
  //       as: "connection",
  //     }
  //   },
  //   { $unwind: { path: "$connection", } },
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
const getContacts = async ({ userId }) => {
  const union = await redisClient.zunion(2, `user:${userId}:followers`, `user:${userId}:following`);
  const unionIds = union.map((id) => ObjectID(id));
  // const contacts = await Follower.aggregate([
  //   { $match: {followeeId: ObjectID(userId)} },
  //   { 
  //     $lookup: { 
  //       from: "users",
  //       localField: "followerId",
  //       foreignField: "_id",
  //       as: "details"
  //     } 
  //   },
  //   { $unionWith: {
  //     coll:  "following",
  //     pipeline: [
  //       {$match: {followerId: ObjectID(userId)}},
  //       { 
  //         $lookup: { 
  //           from: "users",
  //           localField: "followeeId",
  //           foreignField: "_id",
  //           as: "details"
  //         } 
  //       },
  //     ]
  //   } },
  //   {
  //     $unwind: "$details"
  //   },
  //   {
  //     $group: {
  //       _id: "$details"
  //     }
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       userId: "$_id._id",
  //       username: "$_id.username",
  //       email: "$_id.email",
  //       avatar: "$_id.avatar",
  //       fullname: "$_id.fullname",
  //       online: "$_id.online",
  //     }
  //   }
  // ]).toArray();
  const users = await User.aggregate([
    {$match: { _id: { $in: unionIds } }},
    {
      $project: {
        userId: "$_id",
        avatar: 1,
        username: 1,
        fullname: "$name",
        online: 1
      }
    }
  ]).toArray();
  const onlineContacts = users.map(async (contact) =>  {
    const onlineStatus = JSON.parse(await redisClient.hget(`session:${contact.userId}`, "session")).online;
    contact.online = onlineStatus;
    return contact;
  });

  const contacts = await Promise.all(onlineContacts);
  return contacts;
}
module.exports = {
  followers,
  getContacts
};
