const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.get('/user/follow', function(req, res, next){
  res.json({
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
  }).status(200);

  next();
});

router.get('/user/all', async function(req, res, next){
  console.log('get all users');
  const users = await User.find({}).select('-password');
  res.json({users,}).status(200);
  next();
});

module.exports = router;
