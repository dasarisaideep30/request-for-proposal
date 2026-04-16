const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('--- DIAGNOSTIC START ---');
console.log('CWD:', process.cwd());
console.log('GEMINI_API_KEY in ENV:', process.env.GEMINI_API_KEY ? 'EXISTS (starts with ' + process.env.GEMINI_API_KEY.substring(0, 5) + ')' : 'MISSING');

const aiPath = path.join(__dirname, 'controllers', 'ai.controller.js');
if (fs.existsSync(aiPath)) {
  const content = fs.readFileSync(aiPath, 'utf8');
  console.log('AI Controller detected. Searching for model ID...');
  const match = content.match(/model:\s*['"](.*)['"]/);
  console.log('Model ID in file:', match ? match[1] : 'NOT FOUND');
} else {
  console.log('AI Controller NOT FOUND at:', aiPath);
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Testing DB Connection...');
prisma.$connect()
  .then(() => console.log('DB SUCCESS: Connected'))
  .catch(e => console.log('DB FAILED:', e.message))
  .finally(() => {
    prisma.$disconnect();
    console.log('--- DIAGNOSTIC END ---');
  });
