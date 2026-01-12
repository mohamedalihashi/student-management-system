const mongoose = require('mongoose');
const User = require('./models/User');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const runTest = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        console.log('Connected to DB');

        // 1. Setup Admin
        const adminEmail = 'superadmin_test@school.com';
        const adminPass = 'password123';

        // Cleanup
        await User.deleteMany({ email: adminEmail });
        const teacherEmail = 'newteacher_test@school.com';
        await User.deleteMany({ email: teacherEmail });

        await User.create({ email: adminEmail, password: adminPass, role: 'admin' });

        // 2. Login as Admin
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: adminEmail, password: adminPass });

        if (loginRes.status !== 200) {
            console.error('Login Failed Response:', loginRes.body);
            throw new Error('Admin Login Failed');
        }
        const adminCookie = loginRes.headers['set-cookie'];
        console.log('1. Admin Logged In');

        // 3. Create a Teacher User
        const createRes = await request(app)
            .post('/api/users')
            .set('Cookie', adminCookie)
            .send({ email: teacherEmail, password: 'password123', role: 'teacher' });

        if (createRes.status === 201) {
            console.log('2. Teacher User Created:', createRes.body.email);
        } else {
            console.error('Create User Failed:', createRes.body);
            throw new Error('Create User Failed');
        }

        const teacherId = createRes.body._id;

        // 4. List Users
        const listRes = await request(app)
            .get('/api/users')
            .set('Cookie', adminCookie);

        if (listRes.status === 200) {
            const found = listRes.body.find(u => u.email === teacherEmail);
            if (found) console.log('3. User List Verified');
            else throw new Error('Teacher not found in list');
        } else {
            throw new Error('User List Failed');
        }

        // 5. Delete User
        const deleteRes = await request(app)
            .delete(`/api/users/${teacherId}`)
            .set('Cookie', adminCookie);

        if (deleteRes.status === 200) {
            console.log('4. User Deletion Verified');
        } else {
            throw new Error('User Deletion Failed');
        }

        console.log('ALL USER MANAGEMENT TESTS PASSED');
        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
