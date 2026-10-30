import dotenv from "dotenv";
dotenv.config({ path: "apps/backend/.env" });

const BASE = "http://localhost:5000/api";

async function login(email, password) {
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`Login failed for ${email}:`, data);
      return null;
    }
    return data.token || data.data?.token;
  } catch (err) {
    console.error(`Login request failed for ${email}:`, err.message);
    return null;
  }
}

async function get(path, token) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

async function run() {
  console.log("=== COMPREHENSIVE ENDPOINT VERIFICATION ===\n");

  // 1. STUDENT
  console.log("1. STUDENT (Cheran S: cheran.it23@bitsathy.ac.in)");
  const studentToken = await login("cheran.it23@bitsathy.ac.in", "password123");
  if (studentToken) {
    const studentEndpoints = [
      { name: "Student Dashboard Stats", path: "/student/stats" },
      { name: "Digital Twin & Skill Gap", path: "/student/digital-twin" },
      { name: "Career Target & History", path: "/student/career-target" },
      { name: "Career Roadmaps", path: "/roadmaps" },
      { name: "Student Roadmaps", path: "/student/roadmaps" },
      { name: "Open Bounties", path: "/bounties/open" },
      { name: "Student Applications", path: "/jobs/my-applications" },
      { name: "Jobs & Internships", path: "/jobs" },
      { name: "Assessments", path: "/assessments" },
      { name: "My Submissions", path: "/assessments/my-assessments" },
      { name: "Mentorship Sessions", path: "/mentorship/sessions" },
      { name: "Mentorship Requests", path: "/mentorship/requests" },
      { name: "Mentorship Mentors", path: "/mentorship/mentors" },
      { name: "Community Forum Posts", path: "/posts" },
      { name: "Notifications", path: "/notifications" },
      { name: "Student Validations", path: "/student/validations" }
    ];
    for (const ep of studentEndpoints) {
      const res = await get(ep.path, studentToken);
      let count = "N/A";
      if (Array.isArray(res.data?.data)) count = `${res.data.data.length} records`;
      else if (Array.isArray(res.data)) count = `${res.data.length} records`;
      else if (typeof res.data?.data === "object") count = `Object (${Object.keys(res.data.data).length} fields)`;
      console.log(`  [${res.status}] ${ep.name} (${ep.path}): ${count}`);
      if (!res.ok) console.log("      Error body:", JSON.stringify(res.data).slice(0, 200));
    }
  }

  // 2. PLACEMENT OFFICER
  console.log("\n2. PLACEMENT OFFICER (Dr. Sarah Jenkins: head@placement.edu)");
  const placementToken = await login("head@placement.edu", "password123");
  if (placementToken) {
    const placementEndpoints = [
      { name: "Placement Dashboard Stats", path: "/placements/stats" },
      { name: "Placement Tracking", path: "/placements/tracking" },
      { name: "Jobs & Drives", path: "/jobs" },
      { name: "Placement Recruiter Jobs", path: "/jobs/my-jobs" },
      { name: "Student Database", path: "/placements/students" },
      { name: "Placement Companies", path: "/placements/companies" },
      { name: "Career Guidance", path: "/placements/guidance" },
      { name: "Placement Reports", path: "/placements/reports" },
      { name: "Recruitment Pipeline", path: "/placements/recruitment-pipeline" }
    ];
    for (const ep of placementEndpoints) {
      const res = await get(ep.path, placementToken);
      let count = "N/A";
      if (Array.isArray(res.data?.data)) count = `${res.data.data.length} records`;
      else if (Array.isArray(res.data)) count = `${res.data.length} records`;
      else if (typeof res.data?.data === "object") count = `Object (${Object.keys(res.data.data).length} fields)`;
      console.log(`  [${res.status}] ${ep.name} (${ep.path}): ${count}`);
      if (!res.ok) console.log("      Error body:", JSON.stringify(res.data).slice(0, 200));
    }
  }

  // 3. ALUMNI
  console.log("\n3. ALUMNI (Ravi Kumar: ravi.k@alumni.edu)");
  const alumniToken = await login("ravi.k@alumni.edu", "password123");
  if (alumniToken) {
    const alumniEndpoints = [
      { name: "Alumni Stats", path: "/alumni/stats" },
      { name: "Alumni Sessions", path: "/mentorship/sessions" },
      { name: "Alumni Mentorship Requests", path: "/mentorship/requests" },
      { name: "Alumni Availability", path: "/mentorship/my-availability" },
      { name: "Alumni My Bounties", path: "/bounties/my-bounties" },
      { name: "Open Bounties", path: "/bounties/open" },
      { name: "Connection Requests", path: "/alumni/connections" },
      { name: "Community Forum Posts", path: "/posts" }
    ];
    for (const ep of alumniEndpoints) {
      const res = await get(ep.path, alumniToken);
      let count = "N/A";
      if (Array.isArray(res.data?.data)) count = `${res.data.data.length} records`;
      else if (Array.isArray(res.data)) count = `${res.data.length} records`;
      else if (typeof res.data?.data === "object") count = `Object (${Object.keys(res.data.data).length} fields)`;
      console.log(`  [${res.status}] ${ep.name} (${ep.path}): ${count}`);
      if (!res.ok) console.log("      Error body:", JSON.stringify(res.data).slice(0, 200));
    }
  }

  // 4. ADMIN
  console.log("\n4. ADMIN (NEXORA Admin: cheran@it)");
  const adminToken = await login("cheran@it", "cheran@2006");
  if (adminToken) {
    const adminEndpoints = [
      { name: "Admin Dashboard Stats", path: "/admin/stats" },
      { name: "User Management", path: "/admin/users" },
      { name: "System Health", path: "/admin/system-health" },
      { name: "Database Stats", path: "/admin/database-stats" },
      { name: "Audit Logs", path: "/admin/audit-logs" },
      { name: "Announcements", path: "/admin/announcements" }
    ];
    for (const ep of adminEndpoints) {
      const res = await get(ep.path, adminToken);
      let count = "N/A";
      if (Array.isArray(res.data?.data)) count = `${res.data.data.length} records`;
      else if (Array.isArray(res.data)) count = `${res.data.length} records`;
      else if (typeof res.data?.data === "object") count = `Object (${Object.keys(res.data.data).length} fields)`;
      console.log(`  [${res.status}] ${ep.name} (${ep.path}): ${count}`);
      if (!res.ok) console.log("      Error body:", JSON.stringify(res.data).slice(0, 200));
    }
  }

  process.exit(0);
}

run();
