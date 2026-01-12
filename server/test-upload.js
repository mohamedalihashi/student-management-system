const fs = require('fs');
const path = require('path');

// Test upload directory structure
const uploadDirs = [
    'uploads/exam-papers',
    'uploads/answer-keys'
];

console.log('🔍 Checking File Upload System...\n');

// Check if directories exist
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Directory exists: ${dir}`);

        // List files in directory
        const files = fs.readdirSync(fullPath);
        if (files.length > 0) {
            console.log(`   📁 Files: ${files.length}`);
            files.forEach(file => {
                const stats = fs.statSync(path.join(fullPath, file));
                console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log(`   📁 No files yet (ready for uploads)`);
        }
    } else {
        console.log(`❌ Directory missing: ${dir}`);
    }
    console.log('');
});

// Check if multer is installed
try {
    require('multer');
    console.log('✅ Multer package installed');
} catch (e) {
    console.log('❌ Multer package not found');
}

// Check if upload middleware exists
const uploadMiddlewarePath = path.join(__dirname, 'middleware', 'upload.js');
if (fs.existsSync(uploadMiddlewarePath)) {
    console.log('✅ Upload middleware configured');
} else {
    console.log('❌ Upload middleware not found');
}

// Check server.js for static file serving
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    if (serverContent.includes("app.use('/uploads'")) {
        console.log('✅ Static file serving enabled');
    } else {
        console.log('❌ Static file serving not configured');
    }
}

console.log('\n🎉 File Upload System Check Complete!\n');
