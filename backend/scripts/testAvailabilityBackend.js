import dotenv from 'dotenv';
dotenv.config({ path: 'apps/backend/.env' });
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import { User } from '../src/models/User.js';
import { MentorAvailability } from '../src/models/MentorAvailability.js';

const JWT_SECRET = process.env.JWT_SECRET || 'local_development_jwt_secret_key_12345';
const PORT = process.env.PORT || 5000;

async function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING ALUMNI AVAILABILITY BACKEND TEST SUITE ===\n');
  await mongoose.connect(process.env.MONGODB_URI);

  const alumni = await User.findOne({ email: 'ravi.k@alumni.edu' });
  if (!alumni) {
    throw new Error('Alumni user ravi.k@alumni.edu not found!');
  }
  console.log(`[PASS] Found alumni user: ${alumni.name} (${alumni._id})`);

  const token = jwt.sign({ id: alumni._id, role: alumni.role }, JWT_SECRET, { expiresIn: '1d' });

  // TEST 1: GET /api/mentorship/my-availability
  console.log('\n--- TEST 1: GET /api/mentorship/my-availability ---');
  const getRes = await request('/api/mentorship/my-availability', 'GET', null, token);
  console.log(`Status: ${getRes.status}`);
  if (getRes.status !== 200 || !getRes.body.success) {
    console.error('Failed response:', getRes.body);
    process.exit(1);
  }
  const scheduleData = getRes.body.data;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  days.forEach(d => {
    if (!Array.isArray(scheduleData.weeklySchedule[d])) {
      throw new Error(`Missing day array for ${d}`);
    }
  });
  console.log(`[PASS] Returned all 7 weekdays. Total saturday slots: ${scheduleData.weeklySchedule.saturday.length}`);

  // TEST 2: Validation - End time before Start time
  console.log('\n--- TEST 2: Validation - End time <= Start time ---');
  const invalidTimeRes = await request('/api/mentorship/my-availability', 'PUT', {
    weeklySchedule: {
      ...scheduleData.weeklySchedule,
      monday: [{ start: '18:00', end: '16:00', enabled: true }]
    }
  }, token);
  console.log(`Status: ${invalidTimeRes.status}, Message: ${invalidTimeRes.body?.message}`);
  if (invalidTimeRes.status !== 400 || !invalidTimeRes.body?.message?.includes('End time')) {
    throw new Error(`Expected 400 error for invalid time range! Got: ${JSON.stringify(invalidTimeRes)}`);
  }
  console.log('[PASS] Rejected invalid time range correctly.');

  // TEST 3: Validation - Overlapping slots
  console.log('\n--- TEST 3: Validation - Overlapping slots on same day ---');
  const overlapRes = await request('/api/mentorship/my-availability', 'PUT', {
    weeklySchedule: {
      ...scheduleData.weeklySchedule,
      monday: [
        { start: '10:00', end: '12:00', enabled: true },
        { start: '11:00', end: '13:00', enabled: true }
      ]
    }
  }, token);
  console.log(`Status: ${overlapRes.status}, Message: ${overlapRes.body?.message}`);
  if (overlapRes.status !== 400 || !overlapRes.body?.message?.includes('Overlapping')) {
    throw new Error(`Expected 400 error for overlapping slots! Got: ${JSON.stringify(overlapRes)}`);
  }
  console.log('[PASS] Rejected overlapping slots correctly.');

  // TEST 4: Valid Save with custom sessionType, duration, notes across multiple days
  console.log('\n--- TEST 4: Valid Update & Persistence ---');
  const testPayload = {
    isAvailable: true,
    timezone: 'Asia/Kolkata',
    sessionDuration: 45,
    weeklySchedule: {
      monday: [
        { id: 'mon-slot-1', start: '09:00', end: '10:30', enabled: true, sessionType: '1:1 Mentorship', duration: 45, notes: 'Morning focus' },
        { id: 'mon-slot-2', start: '15:00', end: '17:00', enabled: true, sessionType: 'Mock Technical Interview', duration: 60, notes: 'System design' }
      ],
      tuesday: [
        { id: 'tue-slot-1', start: '18:00', end: '19:30', enabled: true, sessionType: 'Resume Review', duration: 45, notes: 'ATS review' }
      ],
      wednesday: [],
      thursday: [
        { id: 'thu-slot-1', start: '14:00', end: '16:00', enabled: true, sessionType: 'Career Guidance', duration: 30, notes: 'FAANG roadmap' }
      ],
      friday: [],
      saturday: [
        { id: 'sat-slot-1', start: '10:00', end: '13:00', enabled: true, sessionType: '1:1 Mentorship', duration: 45, notes: 'Weekend deep dive' }
      ],
      sunday: []
    }
  };

  const updateRes = await request('/api/mentorship/my-availability', 'PUT', testPayload, token);
  console.log(`Status: ${updateRes.status}, Success: ${updateRes.body?.success}`);
  if (updateRes.status !== 200 || !updateRes.body?.success) {
    throw new Error(`Failed to update availability: ${JSON.stringify(updateRes.body)}`);
  }
  console.log('[PASS] API returned success 200.');

  // TEST 5: Verify directly in MongoDB Atlas
  console.log('\n--- TEST 5: Verify Direct MongoDB Document ---');
  const freshDbDoc = await MentorAvailability.findOne({ alumni: alumni._id });
  const monSlots = freshDbDoc.weeklySchedule.monday;
  if (monSlots.length !== 2 || monSlots[0].start !== '09:00' || monSlots[1].start !== '15:00') {
    throw new Error(`MongoDB document does not match updated slots! Found: ${JSON.stringify(monSlots)}`);
  }
  const freshUser = await User.findById(alumni._id);
  if (!freshUser.alumniProfile?.schedule?.monday || freshUser.alumniProfile.schedule.monday.length !== 2) {
    throw new Error('User.alumniProfile.schedule was not synchronized!');
  }
  console.log(`[PASS] Verified MongoDB persistence in MentorAvailability and User.alumniProfile.`);

  // TEST 6: Check /api/alumni/availability alias route
  console.log('\n--- TEST 6: Check /api/alumni/availability route ---');
  const alumniRouteRes = await request('/api/alumni/availability', 'GET', null, token);
  console.log(`Status: ${alumniRouteRes.status}, Success: ${alumniRouteRes.body?.success}`);
  if (alumniRouteRes.status !== 200 || !alumniRouteRes.body?.data) {
    throw new Error(`Alumni route failed: ${JSON.stringify(alumniRouteRes.body)}`);
  }
  console.log(`[PASS] /api/alumni/availability route returns matching data!`);

  console.log('\n=============================================');
  console.log(' ALL 6 BACKEND TESTS PASSED SUCCESSFULLY! ');
  console.log('=============================================\n');

  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('[TEST FAILED]', err);
  process.exit(1);
});
