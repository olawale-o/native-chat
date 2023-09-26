const { LOCAL_MONGODB_SINGLESET } = require('../../config');
const router = require('express').Router();
const { ObjectID } = require('bson');
const { MongoClient } = require('mongodb');

const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const User = client.db('socialdb').collection('users');
const Friend = client.db('socialdb').collection('friends');

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
      const contacts = await User.find({ _id: { $ne: ObjectID(id) } }).limit(10).toArray();
      return res.status(200).json({
        contacts,
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
