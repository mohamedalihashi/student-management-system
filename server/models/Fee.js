const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    description: {
        type: String, // e.g., "Term 1 School Fees"
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid'
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Bank Transfer', 'Online']
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: function () {
            return this.amount;
        }
    },
    paymentHistory: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String,
        note: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
