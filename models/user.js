const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: {type: String},
  last_name: {type: String},
  username: {type: String, required: true, unique: true},
  email: {type: String},
  phone_no: {type: String},
  password: {type: String, required: true},
  interest: [{type: String}],
  identified_as: [{type: String}],
  minimun_fee: {type: Number},
  date_of_birth: {type: Date},
  profile_pic: {type: String},
  online: {type: Boolean, default: false},
  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

userSchema.pre('save', async function(next) {
  const currentDate = new Date();
  const user = this;
  console.log('user', user);
  const hash = await bcrypt.hashSync(this.password, 10);
  this.password = hash;

  this.updated_at = currentDate;

  if (!this.created_at) {
    this.created_at = currentDate;
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  const user = this;
  const compare = bcrypt.compareSync(password, user.password);
  return compare;
};

module.exports = new mongoose.model('User', userSchema);
