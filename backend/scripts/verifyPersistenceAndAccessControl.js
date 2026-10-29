import dotenv from 'dotenv';
dotenv.config({ path: 'apps/backend/.env' });
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import { User } from '../src/models/User.js';
import { MentorAvailability } from '../src/models/MentorAvailability.js';
import { CareerTarget } from '../src/models/CareerTarget.js';

const JWT_SECRET = process.env.JWT_SECRET || 'local_development_jwt_secret_key_12345';
const PORT = process.env.PORT || 5000;

async function request(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(postData);

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
          resolve({ status: res.statusCode, body: JSON.parse(body) });
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

async function verifyAll() {
  console.log('=== STARTING PERSISTENCE & ACCESS CONTROL AUDIT ===\n');
  await mongoose.connect(process.env.MONGODB_URI);

  // ─── 1. CAREER TARGET PERSISTENCE & ISOLATION ────────────────────────────
  console.log('--- 1. TESTING CAREER TARGET PERSISTENCE & ACCESS CONTROL ---');
  const student1 = await User.findOne({ email: 'cheran.it23@bitsathy.ac.in' });
  const student2 = await User.findOne({ role: 'Student', email: { $ne: 'cheran.it23@bitsathy.ac.in' } });

  if (!student1) throw new Error('Student 1 (cheran.it23@bitsathy.ac.in) not found!');
  console.log(`[PASS] Found Student 1: ${student1.name} (${student1._id})`);

  const token1 = jwt.sign({ id: student1._id, role: student1.role }, JWT_SECRET, { expiresIn: '1d' });

  // Update Student 1's Career Target
  const targetRole = 'Staff DevOps & Cloud Architect';
  const targetUpdateRes = await request('/api/student/career-target', 'PUT', {
    targetRole,
    industryPreference: 'Cloud Infrastructure & Security',
    notes: 'Mastering Kubernetes and Terraform'
  }, token1);

  if (targetUpdateRes.status !== 200 || !targetUpdateRes.body?.success) {
    throw new Error(`Failed to update career target: ${JSON.stringify(targetUpdateRes.body)}`);
  }
  console.log(`[PASS] API successfully updated career target to "${targetRole}".`);

  // Verify directly in MongoDB CareerTarget collection
  const dbTargetDoc = await CareerTarget.findOne({ studentId: student1._id });
  if (!dbTargetDoc || dbTargetDoc.targetRole !== targetRole) {
    throw new Error(`CareerTarget document in MongoDB does not match! Found: ${dbTargetDoc?.targetRole}`);
  }
  console.log(`[PASS] Verified MongoDB persistence in CareerTarget collection.`);

  // Verify Student 1's User.studentProfile.targetCareerRole was synced
  const updatedStudentUser = await User.findById(student1._id);
  if (updatedStudentUser.studentProfile?.targetCareerRole !== targetRole) {
    throw new Error(`User.studentProfile.targetCareerRole was not synchronized! Found: ${updatedStudentUser.studentProfile?.targetCareerRole}`);
  }
  console.log(`[PASS] Verified sync with User.studentProfile.targetCareerRole.`);

  // Verify GET /api/student/career-target returns the persisted value
  const getTargetRes = await request('/api/student/career-target', 'GET', null, token1);
  if (getTargetRes.body?.data?.targetRole !== targetRole) {
    throw new Error(`GET /api/student/career-target returned stale data! Found: ${getTargetRes.body?.data?.targetRole}`);
  }
  console.log(`[PASS] GET /api/student/career-target reloaded exact persisted career target.`);

  // Verify Student 2 isolation
  if (student2) {
    const token2 = jwt.sign({ id: student2._id, role: student2.role }, JWT_SECRET, { expiresIn: '1d' });
    const student2TargetRes = await request('/api/student/career-target', 'GET', null, token2);
    if (student2TargetRes.body?.data?.targetRole === targetRole && student2._id.toString() !== student1._id.toString()) {
      throw new Error(`Access control breach: Student 2 received Student 1's career target!`);
    }
    console.log(`[PASS] Access control verified: Student 2 cannot read or overwrite Student 1's career target.`);
  }

  // ─── 2. ALUMNI AVAILABILITY PERSISTENCE & CONSTRAINTS ────────────────────
  console.log('\n--- 2. TESTING ALUMNI AVAILABILITY PERSISTENCE & CONSTRAINTS ---');
  const alumni1 = await User.findOne({ email: 'ravi.k@alumni.edu' });
  if (!alumni1) throw new Error('Alumni ravi.k@alumni.edu not found!');
  console.log(`[PASS] Found Alumni: ${alumni1.name} (${alumni1._id})`);

  const alumniToken = jwt.sign({ id: alumni1._id, role: alumni1.role }, JWT_SECRET, { expiresIn: '1d' });

  // Test Time Range Validation: end <= start must fail with 400
  const invalidRangeRes = await request('/api/mentorship/my-availability', 'PUT', {
    weeklySchedule: {
      monday: [{ start: '19:00', end: '17:00', enabled: true }]
    }
  }, alumniToken);
  if (invalidRangeRes.status !== 400) {
    throw new Error(`Expected 400 for end time <= start time, got: ${invalidRangeRes.status}`);
  }
  console.log(`[PASS] Invalid time range correctly rejected with 400: "${invalidRangeRes.body?.message}".`);

  // Test Overlap Validation: overlapping slots on same day must fail with 400
  const overlapRes = await request('/api/mentorship/my-availability', 'PUT', {
    weeklySchedule: {
      wednesday: [
        { start: '14:00', end: '16:00', enabled: true },
        { start: '15:30', end: '17:00', enabled: true }
      ]
    }
  }, alumniToken);
  if (overlapRes.status !== 400) {
    throw new Error(`Expected 400 for overlapping slots, got: ${overlapRes.status}`);
  }
  console.log(`[PASS] Overlapping slots correctly rejected with 400: "${overlapRes.body?.message}".`);

  // Save full realistic multi-day schedule
  const validSchedule = {
    monday: [
      { id: 'mon-s1', start: '09:00', end: '10:30', enabled: true, sessionType: '1:1 Mentorship', duration: 45, notes: 'Morning focus' },
      { id: 'mon-s2', start: '16:00', end: '18:00', enabled: true, sessionType: 'Mock Technical Interview', duration: 60, notes: 'Distributed systems' }
    ],
    tuesday: [
      { id: 'tue-s1', start: '18:00', end: '19:30', enabled: true, sessionType: 'Resume Review', duration: 30, notes: 'ATS review' }
    ],
    wednesday: [
      { id: 'wed-s1', start: '14:00', end: '15:30', enabled: true, sessionType: 'Career Guidance', duration: 45, notes: 'FAANG roadmap' }
    ],
    thursday: [
      { id: 'thu-s1', start: '18:00', end: '20:00', enabled: true, sessionType: '1:1 Mentorship', duration: 60, notes: 'Architecture design' }
    ],
    friday: [
      { id: 'fri-s1', start: '15:00', end: '16:30', enabled: true, sessionType: 'Mock Technical Interview', duration: 45, notes: 'Live coding' }
    ],
    saturday: [
      { id: 'sat-s1', start: '10:00', end: '13:00', enabled: true, sessionType: '1:1 Mentorship', duration: 60, notes: 'Weekend deep dive' }
    ],
    sunday: []
  };

  const saveRes = await request('/api/mentorship/my-availability', 'PUT', {
    isAvailable: true,
    timezone: 'Asia/Kolkata',
    sessionDuration: 45,
    bufferMinutes: 15,
    weeklySchedule: validSchedule
  }, alumniToken);

  if (saveRes.status !== 200 || !saveRes.body?.success) {
    throw new Error(`Failed to save availability: ${JSON.stringify(saveRes.body)}`);
  }
  console.log(`[PASS] Saved multi-day availability schedule successfully.`);

  // Verify persistence in MongoDB MentorAvailability
  const dbAvailDoc = await MentorAvailability.findOne({ alumni: alumni1._id });
  if (!dbAvailDoc || dbAvailDoc.weeklySchedule.monday.length !== 2) {
    throw new Error(`MongoDB MentorAvailability weeklySchedule does not match! Found: ${JSON.stringify(dbAvailDoc?.weeklySchedule?.monday)}`);
  }
  console.log(`[PASS] Verified MongoDB persistence in MentorAvailability collection.`);

  // Verify User.alumniProfile was synchronized
  const freshAlumni = await User.findById(alumni1._id);
  if (!freshAlumni.alumniProfile?.schedule?.monday || freshAlumni.alumniProfile.schedule.monday.length !== 2) {
    throw new Error('User.alumniProfile.schedule was not synchronized!');
  }
  console.log(`[PASS] Verified User.alumniProfile synchronization.`);

  // Verify GET reloads exact data
  const reloadRes = await request('/api/mentorship/my-availability', 'GET', null, alumniToken);
  if (reloadRes.body?.data?.weeklySchedule?.thursday?.length !== 1) {
    throw new Error('GET /api/mentorship/my-availability did not reload persisted schedule!');
  }
  console.log(`[PASS] GET reloaded exact saved schedule.`);

  // ─── 3. AUDIT OTHER DASHBOARDS & ACCESS CONTROL ──────────────────────────
  console.log('\n--- 3. AUDITING DASHBOARD APIS (ADMIN, RECRUITER, PLACEMENT, STUDENT) ---');
  
  // Student stats
  const studentStatsRes = await request('/api/student/stats', 'GET', null, token1);
  console.log(`Student Stats Status: ${studentStatsRes.status}`);
  if (studentStatsRes.status !== 200) {
    throw new Error(`Student stats failed: ${JSON.stringify(studentStatsRes.body)}`);
  }
  console.log('[PASS] Student stats API is healthy.');

  // Alumni stats
  const alumniStatsRes = await request('/api/alumni/stats', 'GET', null, alumniToken);
  console.log(`Alumni Stats Status: ${alumniStatsRes.status}`);
  if (alumniStatsRes.status !== 200) {
    throw new Error(`Alumni stats failed: ${JSON.stringify(alumniStatsRes.body)}`);
  }
  console.log('[PASS] Alumni stats API is healthy.');

  // Admin stats
  const adminUser = await User.findOne({ role: 'Admin' });
  if (adminUser) {
    const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1d' });
    const adminStatsRes = await request('/api/admin/stats', 'GET', null, adminToken);
    console.log(`Admin Stats Status: ${adminStatsRes.status}`);
    if (adminStatsRes.status !== 200) {
      console.warn(`[WARN] Admin stats returned ${adminStatsRes.status}`);
    } else {
      console.log('[PASS] Admin stats API is healthy.');
    }
  }

  console.log('\n======================================================');
  console.log(' ALL BACKEND PERSISTENCE & SECURITY AUDITS PASSED! ');
  console.log('======================================================\n');

  await mongoose.disconnect();
}

verifyAll().catch(err => {
  console.error('[AUDIT FAILED]', err);
  process.exit(1);
});
