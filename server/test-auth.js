const mongoose = require('mongoose');
const User = require('./models/User');
const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

// Create a standalone app for testing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Admin User
        const email = 'admin@school.com';
        const password = 'password123';

        // Cleanup first
        await User.deleteMany({ email });

        const admin = await User.create({
            email,
            password,
            role: 'admin'
        });
        console.log('1. Admin user created:', admin.email);

        // 2. Test Login
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password });

        if (res.status === 200 && res.headers['set-cookie']) {
            console.log('2. Login Successful. Cookie received.');
        } else {
            console.error('2. Login Failed:', res.body);
            process.exit(1);
        }

        const cookie = res.headers['set-cookie'];

        // 3. Test Protected Route (Get Me)
        const resMe = await request(app)
            .get('/api/auth/me')
            .set('Cookie', cookie);

        if (resMe.status === 200 && resMe.body.email === email) {
            console.log('3. Protected Route Accessible. User:', resMe.body.email);
        } else {
            console.error('3. Protected Route Failed:', resMe.body);
            process.exit(1);
        }

        // 4. Test Logout
        const resLogout = await request(app).post('/api/auth/logout');
        if (resLogout.status === 200) {
            console.log('4. Logout Successful');
        }

        console.log('ALL AUTH TESTS PASSED');
        process.exit(0);

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
};

runTest();
