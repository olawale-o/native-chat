const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const { isAuthenticated } = require('../middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/users', require('./user/route'));

app.get('/api', (req, res) => {
  res.json({
    message: "Hello world"
  })
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
