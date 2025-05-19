import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {type:String, required: true},
    content: {type: String, required: true},
    receiverId: {type:String, required: true},
    // isRead: {type:Boolean, default: false},
    },{timestamps: true})
    
const messageModel = mongoose.models.album || mongoose.model('message', messageSchema);

export default messageModel;