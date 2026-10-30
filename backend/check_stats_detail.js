import dotenv from "dotenv";
dotenv.config({ path: "apps/backend/.env" });
const BASE = "http://localhost:5000/api";

async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.token;
}

async function run() {
  const studentToken = await login("cheran.it23@bitsathy.ac.in", "password123");
  const sRes = await fetch(`${BASE}/student/stats`, { headers: { Authorization: `Bearer ${studentToken}` } });
  const sData = await sRes.json();
  console.log("student/stats keys:", Object.keys(sData));
  console.log("student/stats kpis:", sData.kpis);

  const alumniToken = await login("ravi.k@alumni.edu", "password123");
  const alRes = await fetch(`${BASE}/alumni/stats`, { headers: { Authorization: `Bearer ${alumniToken}` } });
  const alData = await alRes.json();
  console.log("alumni/stats keys:", Object.keys(alData));
  console.log("alumni/stats kpis:", alData.kpis);

  const adminToken = await login("cheran@it", "cheran@2006");
  const adRes = await fetch(`${BASE}/admin/stats`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const adData = await adRes.json();
  console.log("admin/stats keys:", Object.keys(adData));
  console.log("admin/stats kpis:", adData.kpis);

  const logsRes = await fetch(`${BASE}/admin/audit-logs`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const logsData = await logsRes.json();
  console.log("admin/audit-logs logs count:", logsData.logs?.length, "total:", logsData.total);

  const annRes = await fetch(`${BASE}/admin/announcements`, { headers: { Authorization: `Bearer ${adminToken}` } });
  const annData = await annRes.json();
  console.log("admin/announcements count:", annData.announcements?.length);

  process.exit(0);
}
run();

