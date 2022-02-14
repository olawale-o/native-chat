
const { mongoOptions, envVariables } = require('./constants');
const { PORT, MONGODB_USERNAME, MONGODB_PASSWORD, NODE_ENV, APP_NAME} = envVariables;

const http = require('http');

const app = require('./config/app');
const server = http.createServer(app);

const { Server } = require('socket.io');

const socket = require('./socket')
const connect = require('./database');

const io = new Server(server);

socket(io);

const uri = NODE_ENV === 'development' ? 
'mongodb://localhost:27017/crime' :
`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.kr6st.mongodb.net/${APP_NAME}?retryWrites=true&w=majority`;


connect(uri, mongoOptions).then(
  () => {
    server.listen(PORT || 3000, () => {
      console.log('Server started on port 3000');
    });
    console.log('connected to database')    
  },
  err => console.log(err)
);