import mongoose from 'mongoose';

const { Schema } = mongoose;

const friendSchema = new Schema({
  user_id: {type: Schema.Types.ObjectId, ref: 'User'},
  friend_id: {type: Schema.Types.ObjectId, ref: 'User'},
  status: {type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending'},
  note: {type: String},
  created_at: {type: Date, default: Date.now},
});

module.exports = new mongoose.model('Friend', friendSchema);
