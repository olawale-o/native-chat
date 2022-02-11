const express = require('express');
const router = express.Router();

router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
});

router.post('/login', function(req, res, next){
  const { body } = req;
  res.json({body,});
  next();
});

router.post('/register', function(req, res, next){
  const { body } = req;
  res.json({body,});
  next();
});

router.post('/reset-password', function(req, res, next){
  const { body } = req;
  res.json({body,});
  next();
});

module.exports = router;
