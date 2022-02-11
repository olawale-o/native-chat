import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
    first_name: {type: String},
    last_name: {type: String},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    phone_no: {type: String},
    password: {type: String, required: true},
    interest: [{type: String}],
    identified_as: [{type: String}],
    minimun_fee: {type: Number},
    date_of_birth: {type: Date},
    profile_pic: {type: String},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

module.exports = new mongoose.model('User', userSchema);
