import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const results = { passed: [], failed: [] };

function test(name, fn) {
  return Promise.resolve(fn())
    .then(() => { results.passed.push(name); console.log(`  [PASS] ${name}`); })
    .catch((err) => { results.failed.push(`${name}: ${err.message}`); console.log(`  [FAIL] ${name} - ${err.message}`); });
}

async function runTests() {
  console.log('\n=== MindMeld .env Integration Tests ===\n');

  // 1. Check all env vars are present
  console.log('\n--- Checking Environment Variables ---');
  const required = [
    'PORT', 'NODE_ENV', 'MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    'GEMINI_API_KEY', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CLIENT_URL'
  ];
  let allPresent = true;
  for (const key of required) {
    if (!process.env[key]) {
      console.log(`  [FAIL] ${key} is MISSING`);
      allPresent = false;
    }
  }
  if (allPresent) {
    results.passed.push('All env variables present');
    console.log('  [PASS] All 14 env variables are set');
  } else {
    results.failed.push('Some env variables are missing');
  }

  // 2. MongoDB
  console.log('\n--- Testing MongoDB Connection ---');
  await test('MongoDB Connection', async () => {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    await mongoose.connection.close();
  });

  // 3. JWT
  console.log('\n--- Testing JWT ---');
  await test('JWT Sign & Verify', () => {
    const token = jwt.sign({ id: 'test123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id !== 'test123') throw new Error('Token verification failed');
  });
  await test('JWT Refresh Token Sign & Verify', () => {
    const token = jwt.sign({ id: 'test123' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.id !== 'test123') throw new Error('Refresh token verification failed');
  });

  // 4. Cloudinary
  console.log('\n--- Testing Cloudinary ---');
  await test('Cloudinary Configuration', () => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return new Promise((resolve, reject) => {
      cloudinary.api.ping((err, result) => {
        if (err) reject(new Error(err.message));
        else resolve(result);
      });
    });
  });

  // 5. Gemini AI
  console.log('\n--- Testing Gemini AI ---');
  await test('Gemini AI API Key', async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    if (!result.response || !result.response.text()) throw new Error('No response from Gemini');
  });

  // 6. SMTP
  console.log('\n--- Testing SMTP ---');
  await test('SMTP Configuration', async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.verify();
  });

  // Summary
  console.log('\n=== RESULTS ===');
  console.log(`  Passed: ${results.passed.length}`);
  console.log(`  Failed: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.log('\n  Failed Tests:');
    results.failed.forEach((f) => console.log(`    - ${f}`));
  }
  console.log('');
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});