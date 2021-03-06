const express = require('express');
const router = express.Router();
const register = require('../../controllers/auth/register');
const login = require('../../controllers/auth/login');

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
});

router.post('/login', login);

router.post('/register', register);

router.post('/reset-password', function(req, res, next){
  const { body } = req;
  res.json({body,});
  next();
});

module.exports = router;
