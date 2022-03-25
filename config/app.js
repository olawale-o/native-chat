const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { isAuthenticated } = require('../middlewares');

const app = express();

// enable this for passport to work
// require('../auth/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.use('/v1/api', [require('../routes/auth')]);
app.use('/v1/api/user', isAuthenticated, [require('../routes/user')]);

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
