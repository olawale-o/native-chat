const sessionHandler = (redisSession, find) => {
  return async (socket, next, ) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
      const session = await redisSession.findSession(sessionId);
        if (session) {
          socket.sessionId = sessionId;
          socket.userId = session.userId;
          socket._id = session.userId;
          socket.username = session.username;
          socket.avatar = session.avatar;
          socket.online = session.online;
          return next();
        } else {
          return next(new Error("Invalid session"))
        }
    }
    const user = socket.handshake.auth.user;
    if (!user) {
      return next(new Error('invalid user details'));
    }
    const newUser = await find(user._id); 
    socket.username = newUser.username;
    socket.userId = newUser._id.toString();
    socket._id = newUser._id.toString();
    socket.sessionId = newUser._id.toString();
    socket.avatar = newUser.avatar;
    return next();
  }
}

module.exports = sessionHandler;

