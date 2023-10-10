const { LOCAL_MONGODB_SINGLESET, NODE_ENV, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME } = require('../../config');
const router = require('express').Router();
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);



const User = client.db(DB_NAME).collection('users');
const Friend = client.db(DB_NAME).collection('friends');

const handler = require('./handler');

// module.exports = function() {

  router.post('/', handler.register);
  
  router.post('/login', handler.login);
  
  router.post('/friends', async (req, res, next) => {
    try {
      const { requester, recipient, socketId } = req.body;
      const senderSocket = IO.sockets.sockets.get(socketId);
      const newFriend = {
        users: [ObjectID(requester), ObjectID(recipient)],
        status: 'request',
        request: {
          from: ObjectID(requester),
          to: ObjectID(recipient),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const friend = await Friend.insertOne(newFriend);
      return res.status(200).json({
        friend,
      })
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
      const data = await User.findOne({ _id: ObjectID(id) });
      return res.status(200).json({
        data,
      })
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/:id/friends', async (req, res, next) => {
    const { id } = req.params;
    try {
      const users = await User.find({ _id: { $ne: ObjectID(id) } }).toArray();
      return res.status(200).json({
        users,
      })
    } catch (error) {
      console.log(error);
    }
  });

  router.get('/:userId/followers', handler.followers);

  router.get('/:userId/following', handler.following);
  
  router.get('/:id/suggestion', handler.suggestions);

  router.get('/:userId/contacts', handler.contacts);

// return router;
// }


module.exports = router;
