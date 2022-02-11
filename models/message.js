import mongoose, { mongo }  from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
  text: { type: String }
});

module.exports = new mongoose.model('Message', messageSchema);
