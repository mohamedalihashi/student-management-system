const mongoose = require('mongoose');
const User = require('./models/User');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Fee = require('./models/Fee');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const feeRoutes = require('./routes/feeRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
// app.use('/api/students', studentRoutes); // Not needed for this test flow directly
// app.use('/api/teachers', teacherRoutes); // Not needed for this test flow directly
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);

const runTest = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        console.log('Connected to DB');

        // 1. Setup Admin
        const adminEmail = 'admin_ops@school.com';
        await User.deleteMany({ email: adminEmail });
        const admin = await User.create({ email: adminEmail, password: 'password123', role: 'admin' });
        const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
        const adminCookie = adminLogin.headers['set-cookie'];

        // 2. Setup Basic Data (Class, Teacher, Student, Subject)
        // We'll create these directly via Models for speed, assuming APIs work (verified in previous phase)
        await Class.deleteMany({ grade: '12' });
        const cls = await Class.create({ grade: '12', section: 'A' });

        // Create Student User & Profile
        const studentEmail = 'student_ops@school.com';
        await User.deleteMany({ email: studentEmail });
        const studentUser = await User.create({ email: studentEmail, password: 'password123', role: 'student' });

        await Student.deleteMany({ user: studentUser._id });
        const student = await Student.create({
            user: studentUser._id, name: 'Bob Ops', gender: 'Male', dob: '2005-01-01',
            class: cls._id, rollNumber: '12A01'
        });

        // Create Subject
        await Subject.deleteMany({ code: 'PHY12' });
        const subject = await Subject.create({ name: 'Physics', code: 'PHY12', class: cls._id });

        console.log('1. Setup Data Created');

        // 3. Test Attendance (Admin/Teacher marks it)
        await Attendance.deleteMany({ student: student._id });
        const attendRes = await request(app)
            .post('/api/attendance')
            .set('Cookie', adminCookie)
            .send({
                classId: cls._id,
                date: new Date(),
                attendanceData: [{ studentId: student._id, status: 'Present' }]
            });

        if (attendRes.status !== 201) throw new Error(`Attendance Mark Failed: ${JSON.stringify(attendRes.body)}`);

        const attendCheck = await request(app).get(`/api/attendance/${student._id}`).set('Cookie', adminCookie);
        if (attendCheck.body.length > 0 && attendCheck.body[0].status === 'Present') {
            console.log('2. Attendance Verified');
        } else {
            throw new Error('Attendance Check Failed');
        }

        // 4. Test Exams
        await Exam.deleteMany({ name: 'Finals' });
        const examRes = await request(app)
            .post('/api/exams')
            .set('Cookie', adminCookie)
            .send({ name: 'Finals', classId: cls._id, startDate: new Date(), endDate: new Date() });

        if (examRes.status !== 201) throw new Error('Exam Creation Failed');
        const examId = examRes.body._id;
        console.log('3. Exam Created');

        // 5. Test Results
        await Result.deleteMany({ exam: examId });
        const resultRes = await request(app)
            .post('/api/results')
            .set('Cookie', adminCookie)
            .send({
                examId: examId,
                studentId: student._id,
                subjectId: subject._id,
                marksObtained: 85,
                totalMarks: 100
            });

        if (resultRes.status !== 201) throw new Error('Result Entry Failed');

        const resultCheck = await request(app).get(`/api/results/student/${student._id}`).set('Cookie', adminCookie);
        if (resultCheck.body.length > 0 && resultCheck.body[0].grade === 'A') {
            console.log('4. Result Verified (Grade A)');
        } else {
            throw new Error('Result Check Failed');
        }

        // 6. Test Fees
        await Fee.deleteMany({ student: student._id });
        const feeRes = await request(app)
            .post('/api/fees')
            .set('Cookie', adminCookie)
            .send({
                studentId: student._id,
                description: 'Tuition',
                amount: 5000,
                dueDate: new Date()
            });

        if (feeRes.status !== 201) throw new Error('Fee Creation Failed');
        const feeId = feeRes.body._id;

        const payRes = await request(app)
            .put(`/api/fees/${feeId}/pay`)
            .set('Cookie', adminCookie)
            .send({ paymentMethod: 'Online' });

        if (payRes.status === 200 && payRes.body.status === 'Paid') {
            console.log('5. Fee Payment Verified');
        } else {
            throw new Error('Fee Payment Failed');
        }

        console.log('ALL OPERATIONAL TESTS PASSED');
        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
