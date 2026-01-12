const mongoose = require('mongoose');
const User = require('./models/User');
const Parent = require('./models/Parent');
const Student = require('./models/Student');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/parents', parentRoutes);

const runTest = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        console.log('Connected to DB');

        // 1. Setup Admin
        const adminEmail = 'admin_link@school.com';
        await User.deleteMany({ email: adminEmail });
        const admin = await User.create({ email: adminEmail, password: 'password123', role: 'admin' });

        const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'password123' });
        const adminCookie = adminLogin.headers['set-cookie'];

        // 2. Setup Parent User & Profile
        const parentEmail = 'parent_link@school.com';
        await User.deleteMany({ email: parentEmail });
        const parentUser = await User.create({ email: parentEmail, password: 'password123', role: 'parent' });

        // Create actual Parent Profile (Required for linking)
        await Parent.deleteMany({ user: parentUser._id });
        const parentProfile = await Parent.create({
            user: parentUser._id,
            name: 'John Doe Sr.',
            phone: '1234567890'
        });
        console.log('1. Parent Profile Created:', parentProfile._id);

        // 3. Setup Student User & Profile
        const studentEmail = 'student_link@school.com';
        await User.deleteMany({ email: studentEmail });
        const studentUser = await User.create({ email: studentEmail, password: 'password123', role: 'student' });

        // Create actual Student Profile
        await Student.deleteMany({ user: studentUser._id });
        const studentProfile = await Student.create({
            user: studentUser._id,
            name: 'John Junior',
            gender: 'Male',
            dob: new Date('2010-01-01'),
            rollNumber: 'TEMP123'
        });
        console.log('2. Student Profile Created:', studentProfile._id);

        // 4. Admin Links Student to Parent
        const linkRes = await request(app)
            .post('/api/parents/add-student')
            .set('Cookie', adminCookie)
            .send({ parentId: parentProfile._id, studentId: studentProfile._id });

        if (linkRes.status === 200) {
            console.log('3. Linked Successfully');
        } else {
            throw new Error(`Link Failed: ${JSON.stringify(linkRes.body)}`);
        }

        // 5. Parent Logs in to View Children
        const parentLogin = await request(app).post('/api/auth/login').send({ email: parentEmail, password: 'password123' });
        const parentCookie = parentLogin.headers['set-cookie'];

        const childrenRes = await request(app)
            .get('/api/parents/my-children')
            .set('Cookie', parentCookie);

        if (childrenRes.status === 200 && childrenRes.body.length === 1 && childrenRes.body[0]._id === studentProfile.id) {
            console.log('4. Parent View Verified. Child Found:', childrenRes.body[0].name);
        } else {
            throw new Error(`Parent View Failed: ${JSON.stringify(childrenRes.body)}`);
        }

        // 6. Security Check: Unlinked Parent
        const otherParentEmail = 'other_parent@school.com';
        await User.deleteMany({ email: otherParentEmail });
        const otherUser = await User.create({ email: otherParentEmail, password: 'password123', role: 'parent' });
        await Parent.deleteMany({ user: otherUser._id });
        await Parent.create({ user: otherUser._id, name: 'Stranger', phone: '000' });

        const otherLogin = await request(app).post('/api/auth/login').send({ email: otherParentEmail, password: 'password123' });
        const otherCookie = otherLogin.headers['set-cookie'];

        const otherChildren = await request(app).get('/api/parents/my-children').set('Cookie', otherCookie);

        if (otherChildren.status === 200 && otherChildren.body.length === 0) {
            console.log('5. Security Check Verified: Other parent sees no children');
        } else {
            throw new Error('Security Check Failed');
        }

        console.log('ALL PARENT-STUDENT LINKING TESTS PASSED');
        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
