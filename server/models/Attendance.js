const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Excused'],
        required: true
    },
    remarks: {
        type: String
    }
}, { timestamps: true });

// Ensure one attendance record per student per day per subject
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

// Index for efficient queries
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
