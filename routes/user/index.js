const express = require('express');
const router = express.Router();

router.get('/user/follow', function(req, res, next){
  res.json({
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
  }).status(200);

  next();
});

module.exports = router;
