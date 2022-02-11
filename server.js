require('dotenv').config()
const http = require('http');

const app = require('./config/app');

const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Nova conexão', socket.id);

  socket.on('chat message', (msg) => {
    io.emit('chat message', `You said: ${msg} to server`);
  });

  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
