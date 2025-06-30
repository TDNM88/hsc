// Test TypeScript type definitions
import * as nodemailer from 'nodemailer';
import process from 'process';

// Test nodemailer types
const testTransporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
});

// Test process.env types
const envVars = {
  nodeEnv: process.env.NODE_ENV,
  emailHost: process.env.EMAIL_SERVER_HOST,
  emailPort: process.env.EMAIL_SERVER_PORT,
};

console.log('TypeScript type definitions are working correctly!');
console.log(envVars);
