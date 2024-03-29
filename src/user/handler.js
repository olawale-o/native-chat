const { LOCAL_MONGODB_SINGLESET, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME, NODE_ENV } = require('../../config');
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

const User = client.db(DB_NAME).collection('users');

const UserService = require('./services/User');
const FollowerService = require('./services/Follower');
const FollowingService = require('./services/Following');

const register = async (req, res, next) => {
  try {
    const { user, status, message } = await UserService.register(req.body);
    if (status > 201) {
      return res.status(status).json({
        status,
        message
      });
    }
    return res.status(status).json({
      data: {user},
      message
    })
  } catch (error) {
    console.log(error);
  }
}

const login = async (req, res, next) => {
  try {
    const { status, user, message } = await UserService.login(req.body);
    if (status > 200) {
      return res.status(status).json({
        status,
        message
      });
    }
    return res.status(status).json({
      data: {user},
      message
    })
  } catch (error) {
    console.log(error);
  }
};

const followers = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const followers = await FollowerService.followers({ userId })
    return res.status(200).json({
      followers,
    })
  } catch (error) {
    console.log(error);
  }
};

const following = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const following = await FollowingService.following({ userId })
    return res.status(200).json({
      following,
    })
  } catch (error) {
    console.log(error);
  }
};

const suggestions = async (req, res, next) => {
  const { id } = req.params;
  const { limit, skip } = req.query;
  try {
    const users = await User.aggregate([ 
      { 
        $lookup: { 
        from: "following", 
        let: { user_id: "$_id" },
         pipeline: [ 
          { $match: { $expr: { $and: [ { $eq: ["$followerId", "$$user_id"] }] } } }], 
          as: "user_followings"
        } 
      }, 
      { $lookup: { 
        from: "followers", 
        let: { user_id: "$_id" },
        pipeline: [ 
          { $match: { 
            $expr: { 
                $and: [
                  { $eq: ["$followeeId", "$$user_id"] },
                ]
              }
            } 
          }
        ], 
        as: "user_followers" }
      },
      {
        $match: {
          _id: { $ne: ObjectID(id) },
        }
      },
      {
        $match: {
          "user_followings.followeeId": { $ne: ObjectID(id) },
        }
      },
      {
        $match: {
          "user_followers.followerId": { $ne: ObjectID(id) },
        }
      },
      {
        $skip: parseInt(skip)
      },
      {
        $limit: parseInt(limit),
      }
    ]).toArray();
    return res.status(200).json({users});
  } catch(e) {
    console.log(e)
  }
};

const contacts = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const followers = await FollowerService.followers({ userId });
    return res.status(200).json({
      followers,
    })
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  register,
  login,
  followers,
  following,
  suggestions,
  contacts,
}
