const { LOCAL_MONGODB_SINGLESET, LOCAL_DATABASE_NAME, REMOTE_DATABASE_NAME, NODE_ENV } = require('../config');
const { MongoClient, ObjectId } = require('mongodb');

const { MongoDBMessageStorage, InMemoryMessageStorage, RedisMessageStorage } = require('./messageStorage');
const { InMemmoryStore, RedisSessionStorage } = require('./sessionStorage');

const DB_NAME = NODE_ENV !== 'development' ? REMOTE_DATABASE_NAME : LOCAL_DATABASE_NAME;
const client = new MongoClient(LOCAL_MONGODB_SINGLESET);

const { getContacts } = require('../src/user/services/Follower');
const { find, disconnect } = require("../src/user/services/User");

const memoryStorage = new InMemoryMessageStorage();

const mongoStorage = new MongoDBMessageStorage(client);

// const memorySession = new InMemmoryStore();

const User = client.db(DB_NAME).collection('users');

const fetchUsersFromDB = async (userId) => {
  return await User.find({ _id: { $ne: ObjectId(userId) }}).toArray();
}

const getMessagesForUserFromMongoDB = async (userId) => {
  const messagesPerUser = new Map();
  const messages = await mongoStorage.findMessagesForUser(userId);
  messages.forEach((message) => {
    const { from, to } = message;
    const otherUser = userId.toString() === from.toString() ? to.toString() : from.toString();
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  });
  return messagesPerUser;
}

const getMessagesForUser = (userId) => {
  const messagesPerUser = new Map();
  memoryStorage.findMessagesForUser(userId).forEach((message) => {
    const { from, to } = message;
    const otherUser = userId === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  });
  return messagesPerUser;
}


module.exports = function(IO, redisClient) {
  const redisSession = new RedisSessionStorage(redisClient);
  const redisMessageStorage = new RedisMessageStorage(redisClient);

  const getMessagesForUserFromRedisStore = async (userId) => {
    const messagesPerUser = new Map();
    const messages = await redisMessageStorage.findMessagesForUser(userId);
    messages.forEach((message) => {
      const { from, to } = message;
      const otherUser = userId === from ? to : from;
      if (messagesPerUser.has(otherUser)) {
        messagesPerUser.get(otherUser).push(message);
      } else {
        messagesPerUser.set(otherUser, [message])
      }
    });
    return messagesPerUser;
  }
  IO.use(async (socket, next) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
      const session = await redisSession.findSession(sessionId);
      if (session) {
        socket.sessionId = sessionId;
        socket.userId = session.userId;
        socket._id = session.userId;
        socket.username = session.username;
        socket.avatar = session.avatar;
        return next();
      } else {
        return next(new Error("Invalid session"))
      }
    }
    const user = socket.handshake.auth.user;
    if (!user) {
     return next(new Error('invalid user details'));
    }
    // console.log('line 69', user);
    const newUser = await find(user._id); 
    socket.username = newUser.username;
    socket.userId = newUser._id.toString();
    socket._id = newUser._id.toString();
    socket.sessionId = newUser._id.toString();
    socket.avatar = newUser.avatar;
    next();
  })

  IO.on('connection', async (socket) => {
    await redisSession.saveSession(socket.sessionId, {
      userId: socket.userId,
      username: socket.username,
      _id: socket.userId,
      online: true,
      avatar: socket.avatar,
    })
    await socket.join(socket.userId);
    // const users = [];
    // const userMessages = await getMessagesForUserFromRedisStore(socket.userId) // getMessagesForUser(socket.userId) //await getMessagesForUserFromMongoDB(socket.userId)
    // const dbUsers = await fetchUsersFromDB(socket.userId)

    // for (const user of dbUsers) {
    //   const u = await redisSession.findSession(user._id.toString())
    //   if (u === null) {
    //     users.push({
    //       userId: user._id,
    //       username: user.username,
    //       online: user.online,
    //       _id: user._id,
    //       messages: userMessages.get(user._id.toString()) || [],
    //     })
    //   } else {
    //     users.push({
    //       userId: u?.userId,
    //       username: u?.username,
    //       online: u?.online,
    //       _id: u?._id,
    //       messages: userMessages.get(user._id.toString()) || [],
    //     })
    //   }
    // }
    const users = await getContacts({userId: socket.userId});
    await socket.emit('session', {
      sessionId: socket.sessionId,
      userId: socket.userId,
      username: socket.username,
      _id: socket._id.toString(),
      online: true,
      avatar: socket.avatar,
    });
    // all connected users except current user
    await socket.emit("users", users);

    await socket.broadcast.emit('user connected', {
      userId: socket.userId,
      username: socket.username,
      sessionId: socket.sessionId,
      _id: socket._id,
    });
    socket.on('private message', async ({ message, to, type }) => {
      const newMessage = {
        from: socket.userId,
        to,
        message,
        type,
        username: socket.username
      }
      socket.to(to).emit("private message", newMessage);
      await redisMessageStorage.saveMessage({ from: ObjectId(socket.userId), to: ObjectId(to), message, type });
      await mongoStorage.saveMessage({ from: ObjectId(socket.userId), to: ObjectId(to), message, type })
    })

    socket.on('new message', (message) => {
      socket.broadcast.emit('new message', {
        userId: socket.userId,
        username: socket.username,
        message,
      })
    });

    socket.on('user messages', async ({ userId, username }) => {
      const userMessages = await getMessagesForUserFromRedisStore(socket._id); // await getMessagesForUserFromMongoDB(socket._id) // getMessagesForUser(socket._id);
      socket.emit('user messages', {
        userId,
        _id: userId,
        username,
        messages: userMessages.get(userId) || []
      })
    });

    socket.on('follow', async (followee, follower) => {
      await socket.to(followee?._id).emit('follow', { followee, follower });
      await redisMessageStorage.followUser(follower?._id, followee?._id);
      await mongoStorage.followUser(follower?._id, followee?._id);
    });

    socket.on('unfollow', async (followee, follower) => {
      await socket.to(followee?._id).emit('unfollow', { followee, follower });
      await redisMessageStorage.unFollowUser(follower?._id, followee?._id);
      await mongoStorage.unFollowUser(follower?._id, followee?._id);
    });

    socket.on('disconnect', async () => {
      const matchingSockets = await IO.in(socket.userId).allSockets();
      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        socket.broadcast.emit('user disconnected', {
          userId: socket.userId,
          username: socket.username,
        });
        await redisSession.saveSession(socket.userId, {
          userId: socket.userId,
          username: socket.username,
          online: false,
          _id: socket._id,
          avatar: socket.avatar
        });
        await disconnect(socket.userId);
      }
    });
  })
}