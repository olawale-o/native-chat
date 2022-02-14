const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const { jwtSecret } = require('../constants');

passport.use('local-register', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (user) {
      return done(null, false, { message: 'Please provide valid credentials' });
    }
    const { email } = req.body;
    const newUser = await User.create({ username, password, email, });
    return done(null, newUser, { message: 'User created successfully',});
    } catch (err) {
      return done(null, false, { message: err.message, });
    }
}));

passport.use('local-login', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await User.findOne({username})
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const validate = await user.isValidPassword(password);
    if (!validate) {
      return done(null, false, { message: 'Wrong Password' });
    }
    done(null, user, { message: 'Logged in Successfully' });
  } catch(err) {
    return done(null, false, { message: err.message });
  }
}));

passport.use(new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken("JWT"),
}, async (payload, done) => {
  try {
    return done(null, token.user);
  } catch (error) {
    return done(error);
  }
}));
