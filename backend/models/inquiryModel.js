const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Resolved'], 
        default: 'Pending' 
    },
    type: { 
        type: String, 
        enum: ['General', 'Support', 'Feedback'], 
        default: 'General' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
