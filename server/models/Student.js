const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    rollNumber: {
        type: String,
        unique: true
    },
    admissionNumber: {
        type: String,
        unique: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    parentName: {
        type: String
    },
    parentPhone: {
        type: String,
        required: true
    },
    monthlyFee: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
