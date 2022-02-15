const passport = require('passport');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../constants');

module.exports = function(req, res, next) {
  passport.authenticate('local-login', async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error(info.message);
        res.status(401).json(info);
        return next(error);
      }
      req.login(user, {session: false}, async (err) => {
        if (err) return next(err);
        const token = jwt.sign({
          userId: user._id,
          username: user.username,
          email: user.email,
        }, JWT_SECRET, { expiresIn: '1h',});
        return res.status(200).json({ user, token, message: 'User loggedin successfully',});
     });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};
