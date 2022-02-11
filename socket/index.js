module.exports = function(io){
  io.on('connection', (socket) => {
    console.log('Nova conexão', socket.id);
    
    socket.on('chat message', (msg) => {
      io.emit('chat message', `You said: ${msg} to server`);
    });
    
    socket.on('disconnect', () => console.log('User disconnected'));
  });
};
