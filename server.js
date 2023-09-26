const { PORT, REDIS_CONNECTION_URL, NODE_ENV } = require('./config');
const { Server } = require('socket.io');
const socketConnection = require('./socket');
const { MongoClient } = require('mongodb');
const dbConnection = require('./database/connection');
const app = require('./src/app');

const server = require('http').createServer(app);

const Redis = require('ioredis')
const { createAdapter } = require('socket.io-redis');

const redisClient = new Redis(NODE_ENV !=='developmemnt' && REDIS_CONNECTION_URL)

const IO = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ['GET', 'POST']
  },
  adapter: createAdapter({
    pubClient: redisClient,
    subClient: redisClient.duplicate()
  })
});

socketConnection(IO, redisClient);

dbConnection(MongoClient)
.then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err)
});

server.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
})