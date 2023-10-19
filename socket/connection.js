const { ObjectId } = require('mongodb');

const { getContacts } = require('../src/user/services/Follower');
const { disconnect } = require("../src/user/services/User");


const onConnect = (options = {}) => {
  return async (socket) => {
    const { redisSession, redisMessageStorage, mongoStorage, getMessagesForUserFromRedisStore, IO } = options;
    
    await redisSession.saveSession(socket.sessionId, {
      userId: socket.userId,
      username: socket.username,
      _id: socket.userId,
      online: true,
      avatar: socket.avatar,
    });
    await socket.join(socket.userId);
    
    
    await socket.emit('session', {
      sessionId: socket.sessionId,
      userId: socket.userId,
      username: socket.username,
      _id: socket._id.toString(),
      online: true,
      avatar: socket.avatar,
    });

    await socket.broadcast.emit('user connected', {
      userId: socket.userId,
      username: socket.username,
      sessionId: socket.sessionId,
      _id: socket._id,
    });
    
    socket.on('private message', async ({ message, to, type, caption }) => {
      const newMessage = {
        from: socket.userId,
        to,
        message,
        type,
        username: socket.username,
        caption
      };
      socket.to(to).emit("private message", newMessage);
      await redisMessageStorage.saveMessage({ from: ObjectId(socket.userId), to: ObjectId(to), message, type, caption });
      await mongoStorage.saveMessage({ from: ObjectId(socket.userId), to: ObjectId(to), message, type, caption });
    });
    
    socket.on('new message', (message) => {
      socket.broadcast.emit('new message', {
        userId: socket.userId,
        username: socket.username,
        message,
      });
    });
    
    socket.on('user messages', async ({ userId, username }) => {
      const userMessages = await getMessagesForUserFromRedisStore(socket._id); // await getMessagesForUserFromMongoDB(socket._id) // getMessagesForUser(socket._id);
      socket.emit('user messages', {
        userId,
        _id: userId,
        username,
        messages: userMessages.get(userId) || []
      });
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

    const users = await getContacts({userId: socket.userId});
    await socket.emit("users", users);
  };
};

module.exports = onConnect;
