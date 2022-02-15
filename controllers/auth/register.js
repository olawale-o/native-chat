const passport = require('passport');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../constants');

module.exports = function(req, res, next) {
  passport.authenticate("local-register", { session: false,},
  async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error(info);
        if(err) {
          res.status(500).json(info)
        }
        if(!user) {
          res.status(403).json(info);
        }
        return next(error);
      } else {
        const body = {
          _id: user._id,
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          phoneNo: user.phone_no,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
        const token = jwt.sign({user: user,},JWT_SECRET);
        res.status(201).json({
          user: body,
          token: token,
          message: "registered successfully",
          });
      }
    } catch (error) {
        return next(error);
      }
  })(req, res, next);
};
