const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.post('/user', async function(req, res, next){
  const { email, name, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(200).json({
      data: {
        user,
      },
      success: true,
    });
  }
  const newUser = await User.create({ email, username: name, password });
  return res.status(200).json({
    data: {
      user: newUser,
    },
    success: true,
  });
});

router.get('/user/:email', async function(req, res, next) {
  const { email } = req.params;
  const user = await User.findOne({ email });
  return res.status(200).json({
    data: {
      user,
    },
    success: true,
  });
});

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
