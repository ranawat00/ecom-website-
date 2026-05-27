const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
}, {
    timestamps: true
});

// Index for fast address lookup by userId
addressSchema.index({ userId: 1 });

addressSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

addressSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
