import mongoose from 'mongoose';
const { Schema } = mongoose;

const chatSchema = new Schema({
  chat_id: {type: String, required: true, unique: true},
  sender_id: {type: Schema.Types.ObjectId, ref: 'User'},
  receiver_id: {type: Schema.Types.ObjectId, ref: 'User'},
  message: {type: Schema.Types.ObjectId, ref: 'Message' , required: true},
  status: {type: String, enum: ['pending', 'delivered', 'read'], default: 'pending'},
  created_at: {type: Date, default: Date.now},
});

module.exports = new mongoose.model('Chat', chatSchema);
