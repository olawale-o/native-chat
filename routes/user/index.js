const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.post('/', async function(req, res, next){
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

router.get('/:email', async function(req, res, next) {
  const { email } = req.params;
  const user = await User.findOne({ email });
  res.status(200).json({
    data: {
      user,
    },
    success: true,
  });
});


router.get('/:id/suggestion', async function(req, res, next){
  console.log('hiiting');
  try {
    const { id } = req.params;
    const users = await User.find({ _id: { $ne: id } }).limit(10);
    res.json({
      users,
      message: 'success',
      success: true,
    }).status(200);
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
});

module.exports = router;
