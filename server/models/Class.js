const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    grade: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, { timestamps: true });

// Compound index to ensure unique Class Grade + Section
classSchema.index({ grade: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
