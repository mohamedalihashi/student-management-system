const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['Midterm', 'Final', 'Quiz', 'Assignment', 'Test'],
        default: 'Test'
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    examDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    totalMarks: {
        type: Number,
        required: true,
        default: 100
    },
    room: {
        type: String,
        default: 'TBD'
    },
    examPaperUrl: {
        type: String // File path for uploaded exam paper
    },
    answerKeyUrl: {
        type: String // File path for uploaded answer key
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    // Legacy fields for backward compatibility
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, { timestamps: true });

// Index for efficient queries
examSchema.index({ class: 1, examDate: 1 });
examSchema.index({ teacher: 1, status: 1 });
examSchema.index({ status: 1 });

module.exports = mongoose.model('Exam', examSchema);
