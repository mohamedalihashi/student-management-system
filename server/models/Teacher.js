const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    }
    // Subjects linked in Subject schema or here via virtual, 
    // but requirements asked for direct assignment.
    // We can keep array here for easy access or query from Subject model.
    // Let's add an array of subject references for convenience.
    // subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }] 
    // The 'Subject' schema will definitely link to this teacher.
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
