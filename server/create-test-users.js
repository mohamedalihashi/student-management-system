const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing test users (optional)
        await User.deleteMany({ email: { $in: ['admin@test.com', 'teacher@test.com', 'parent@test.com'] } });

        // Create Admin User
        const admin = await User.create({
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('✅ Admin created:', admin.email);

        // Create Teacher User
        const teacher = await User.create({
            email: 'teacher@test.com',
            password: 'teacher123',
            role: 'teacher'
        });
        console.log('✅ Teacher created:', teacher.email);

        // Create Parent User
        const parent = await User.create({
            email: 'parent@test.com',
            password: 'parent123',
            role: 'parent'
        });
        console.log('✅ Parent created:', parent.email);

        console.log('\n========================================');
        console.log('TEST USERS CREATED SUCCESSFULLY!');
        console.log('========================================');
        console.log('\n📧 Admin Login:');
        console.log('   Email: admin@test.com');
        console.log('   Password: admin123');
        console.log('\n👨‍🏫 Teacher Login:');
        console.log('   Email: teacher@test.com');
        console.log('   Password: teacher123');
        console.log('\n👨‍👩‍👧 Parent Login:');
        console.log('   Email: parent@test.com');
        console.log('   Password: parent123');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test users:', error);
        process.exit(1);
    }
};

createTestUsers();
