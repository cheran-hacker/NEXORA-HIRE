import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { Notification } from '../models/Notification.js';
import { StudentList } from '../models/StudentList.js';
import { Assessment } from '../models/Assessment.js';
import { RoleSkillMap } from '../models/RoleSkillMap.js';
import bcrypt from 'bcryptjs';
import { geminiService } from '../services/geminiService.js';

import os from 'os';
import mongoose from 'mongoose';
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalAlumni = await User.countDocuments({ role: 'Alumni' });
    const activeStudents = await User.countDocuments({ role: 'Student', status: 'Active' });
    const totalAssessments = await Assessment.countDocuments();

    // Application Pipeline (MongoDB Aggregation)
    const pipelineData = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Map pipeline data to standard format
    const pipelineObj = {
      Applied: 0,
      Review: 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0
    };
    
    pipelineData.forEach(item => {
      // normalize status string
      const statusStr = item._id ? item._id.toString() : 'Unknown';
      if (statusStr.includes('Applied') || statusStr.includes('Pending')) pipelineObj.Applied += item.count;
      else if (statusStr.includes('Review')) pipelineObj.Review += item.count;
      else if (statusStr.includes('Shortlist')) pipelineObj.Shortlisted += item.count;
      else if (statusStr.includes('Interview')) pipelineObj.Interview += item.count;
      else if (statusStr.includes('Select') || statusStr.includes('Offer')) pipelineObj.Selected += item.count;
      else if (statusStr.includes('Reject')) pipelineObj.Rejected += item.count;
      else pipelineObj.Applied += item.count; // Default fallback
    });

    // Student Demographics by Department
    const deptData = await User.aggregate([
      { $match: { role: 'Student' } },
      { $group: { _id: "$studentProfile.branch", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const departmentLabels = [];
    const departmentCounts = [];
    deptData.forEach(item => {
      if (item._id && item.count > 0) {
        departmentLabels.push(item._id);
        departmentCounts.push(item.count);
      }
    });

    // Career Target Distribution
    const careerData = await User.aggregate([
      { $match: { role: 'Student', 'studentProfile.careerTarget': { $exists: true, $ne: '' } } },
      { $group: { _id: "$studentProfile.careerTarget", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Skill Readiness (Average ATS Score)
    const avgAts = await User.aggregate([
      { $match: { role: 'Student', 'studentProfile.atsScore': { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: "$studentProfile.atsScore" } } }
    ]);
    const avgSkillReadiness = avgAts.length > 0 && avgAts[0].avgScore ? Math.round(avgAts[0].avgScore) : 0;

    // Role-Skill Intelligence
    const roleSkillsCount = await RoleSkillMap.countDocuments();

    // System Health Statuses
    const isMongoConnected = mongoose.connection.readyState === 1;
    const systemHealth = {
      backend: 'Operational',
      database: isMongoConnected ? 'Operational' : 'Unavailable',
      auth: 'Operational'
    };

    // Recent Registrations
    const recentRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role status createdAt avatarUrl');

    // Recent Jobs
    const recentOpportunities = await Job.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title company type location deadline status');

    // Pending Actions
    const pendingJobs = await Job.countDocuments({ status: { $in: ['Pending', 'Review'] } });
    const pendingAlumni = await User.countDocuments({ role: 'Alumni', status: { $in: ['Pending', 'Invited'] } });
    
    const pendingActions = [];
    if (pendingJobs > 0) pendingActions.push({ title: 'Pending Job Approvals', count: pendingJobs, type: 'job' });
    if (pendingAlumni > 0) pendingActions.push({ title: 'Pending Alumni Invitations', count: pendingAlumni, type: 'alumni' });

    // Traffic Data (Using actual DB counts)
    const trafficLabels = [];
    const studentData = [];
    const alumniData = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0,0,0,0));
      const endOfDay = new Date(d.setHours(23,59,59,999));
      
      const sCount = await User.countDocuments({ role: 'Student', createdAt: { $gte: startOfDay, $lte: endOfDay } });
      const aCount = await User.countDocuments({ role: 'Alumni', createdAt: { $gte: startOfDay, $lte: endOfDay } });
      
      trafficLabels.push(`${d.getDate()}/${d.getMonth()+1}`);
      studentData.push(sCount);
      alumniData.push(aCount);
    }

    // Return the full payload
    res.json({
      adminProfile: {
        name: req.user.name,
        role: "System Administrator",
        lastLogin: "Now"
      },
      kpis: {
        totalStudents: activeStudents || await User.countDocuments({ role: 'Student' }),
        totalAlumni: totalAlumni,
        totalJobs: totalJobs,
        totalApplications: totalApplications,
        totalAssessments: totalAssessments,
        skillReadiness: avgSkillReadiness,
        uptime: "100%"
      },
      systemHealth,
      careerTargets: careerData,
      roleSkillsCount,
      pipeline: pipelineObj,
      demographics: {
        labels: departmentLabels.length > 0 ? departmentLabels : ['No Data'],
        data: departmentCounts.length > 0 ? departmentCounts : [1]
      },
      traffic: {
        labels: trafficLabels,
        studentData: studentData,
        alumniData: alumniData
      },
      pendingActions,
      recentRegistrations,
      recentOpportunities
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: { users: [], jobs: [] } });

    const regex = new RegExp(q, 'i');
    
    const users = await User.find({ 
      $or: [{ name: regex }, { email: regex }, { 'studentProfile.regNo': regex }]
    }).limit(5).select('name email role avatarUrl');
    
    const jobs = await Job.find({
      $or: [{ title: regex }, { company: regex }]
    }).limit(5).select('title company type location status');
    
    res.json({ success: true, data: { users, jobs } });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();

    res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (role === 'Student' && !email.toLowerCase().endsWith('@bitsathy.ac.in')) {
      return res.status(400).json({ message: 'Student accounts must use a @bitsathy.ac.in email address.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword, role, status: 'Active' });
    res.status(201).json({ message: 'User created successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'Admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

export const getSystemHealth = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 100);
    
    // Simple CPU usage estimation based on load average
    const cpus = os.cpus().length;
    const loadAvg = os.loadavg()[0];
    const cpuUsagePercent = Math.min(100, Math.round((loadAvg / cpus) * 100));

    res.json({
      success: true,
      data: {
        status: 'Operational', // Assuming operational if the server responds
        uptime: `${Math.round(process.uptime() / 3600)} hours`,
        lastDowntime: 'No recorded downtime',
        metrics: {
          cpuUsage: cpuUsagePercent,
          memoryUsage: memoryUsagePercent,
          activeConnections: await User.countDocuments(),
          apiLatency: null // Empty state, real latency tracking requires middleware
        },
        services: [
          { name: 'API Gateway', status: 'Online', latency: 'N/A' },
          { name: 'Database (MongoDB)', status: 'Online', latency: 'N/A' },
          { name: 'Authentication (JWT)', status: 'Online', latency: 'N/A' },
          { name: 'Storage (S3)', status: 'N/A', latency: 'N/A' },
          { name: 'Background Workers', status: 'Online', latency: 'N/A' }
        ],
        requestVolume: {
          labels: [],
          data: []
        }
      }
    });
  } catch (error) {
    console.error('System Health Error:', error);
    res.status(500).json({ message: 'Server error fetching system health' });
  }
};

export const getDatabaseStats = async (req, res) => {
  try {
    // Use real collection counts for Phase 1
    const usersCount = await User.countDocuments();
    const jobsCount = await Job.countDocuments();
    const appsCount = await Application.countDocuments();
    const notificationsCount = await Notification.countDocuments();

    res.json({
      success: true,
      data: {
        kpis: {
          totalSize: 'N/A', // Mongoose doesn't easily expose this without db.stats()
          activeCollections: 5,
          queryOps: null,
          lastBackup: 'N/A'
        },
        collections: [
          { name: 'Users', count: usersCount, size: 'N/A', avgSize: 'N/A', percent: null },
          { name: 'Jobs', count: jobsCount, size: 'N/A', avgSize: 'N/A', percent: null },
          { name: 'Applications', count: appsCount, size: 'N/A', avgSize: 'N/A', percent: null },
          { name: 'Notifications', count: notificationsCount, size: 'N/A', avgSize: 'N/A', percent: null }
        ],
        distribution: {
          labels: ['Applications', 'Jobs', 'Notifications', 'Users'],
          data: [appsCount, jobsCount, notificationsCount, usersCount]
        }
      }
    });
  } catch (error) {
    console.error('Database Stats Error:', error);
    res.status(500).json({ message: 'Server error fetching database stats' });
  }
};

export const validateStudentsImport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (req.file.originalname.toLowerCase().endsWith('.csv')) {
      const { Readable } = await import('stream');
      const stream = Readable.from(req.file.buffer);
      worksheet = await workbook.csv.read(stream);
    } else {
      await workbook.xlsx.load(req.file.buffer);
      worksheet = workbook.worksheets[0];
    }

    const results = {
      totalRows: 0,
      validStudents: 0,
      invalidStudents: 0,
      duplicateStudents: 0,
      invalidRecords: [],
      validData: []
    };

    const extractText = (cell) => {
      if (!cell || !cell.value) return '';
      if (typeof cell.value === 'object') {
        if (cell.value.text) return cell.value.text.toString().trim();
        if (cell.value.richText) return cell.value.richText.map(rt => rt.text).join('').trim();
        if (cell.value.result) return cell.value.result.toString().trim();
      }
      return cell.value.toString().trim();
    };

    const headerRow = worksheet.getRow(1);
    let colMap = { regNo: -1, name: -1, email: -1, dept: -1, program: -1, year: -1, section: -1 };

    headerRow.eachCell((cell, colNumber) => {
      const val = extractText(cell).toLowerCase();
      if (val.includes('register number') || val.includes('regno') || val === 'register number') colMap.regNo = colNumber;
      if (val.includes('name')) colMap.name = colNumber;
      if (val.includes('email')) colMap.email = colNumber;
      if (val.includes('department') || val.includes('branch')) colMap.dept = colNumber;
      if (val.includes('program') || val.includes('course')) colMap.program = colNumber;
      if (val.includes('year')) colMap.year = colNumber;
      if (val.includes('section')) colMap.section = colNumber;
    });

    if (colMap.regNo === -1 || colMap.email === -1 || colMap.name === -1) {
      return res.status(400).json({ success: false, message: 'Invalid Excel format. Required columns: Register Number, Student Name, College Email.' });
    }

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      results.totalRows++;
      
      const regNo = extractText(row.getCell(colMap.regNo));
      const name = extractText(row.getCell(colMap.name));
      const email = extractText(row.getCell(colMap.email));
      const dept = colMap.dept !== -1 ? extractText(row.getCell(colMap.dept)) : '';
      const program = colMap.program !== -1 ? extractText(row.getCell(colMap.program)) : '';
      const year = colMap.year !== -1 ? extractText(row.getCell(colMap.year)) : '';
      
      if (!regNo || !name || !email) {
        results.invalidStudents++;
        results.invalidRecords.push({ row: rowNumber, email: email || 'Unknown', reason: 'Missing required fields (RegNo, Name, Email)' });
        return;
      }
      
      if (!email.toLowerCase().endsWith('@bitsathy.ac.in')) {
        results.invalidStudents++;
        results.invalidRecords.push({ row: rowNumber, email, reason: 'Only @bitsathy.ac.in accounts are permitted.' });
        return;
      }

      rows.push({ rowNumber, regNo, name, email: email.toLowerCase(), dept, program, year });
    });

    const emailSet = new Set();
    const uniqueRows = [];
    for (const r of rows) {
      if (emailSet.has(r.email)) {
        results.duplicateStudents++;
        results.invalidRecords.push({ row: r.rowNumber, email: r.email, reason: 'Duplicate email in Excel sheet' });
      } else {
        emailSet.add(r.email);
        uniqueRows.push(r);
      }
    }

    results.validStudents = uniqueRows.length;
    results.validData = uniqueRows;

    res.json({
      success: true,
      message: 'Validation complete. Please review the records before confirming import.',
      results
    });

  } catch (error) {
    console.error('Validate Students Error:', error);
    res.status(500).json({ success: false, message: 'Server error during validation' });
  }
};

export const confirmStudentsImport = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid students provided for import.' });
    }

    let importedCount = 0;

    for (const student of students) {
      // 1. Upsert into StudentList
      let studentEntry = await StudentList.findOne({ email: student.email });
      if (studentEntry) {
        studentEntry.name = student.name;
        studentEntry.regNo = student.regNo;
        studentEntry.department = student.dept;
        studentEntry.program = student.program;
        studentEntry.year = student.year;
        await studentEntry.save();
      } else {
        await StudentList.create({
          regNo: student.regNo,
          name: student.name,
          email: student.email,
          department: student.dept,
          program: student.program,
          year: student.year
        });
      }

      // 2. Create or Update User record
      let user = await User.findOne({ email: student.email });
      if (!user) {
        const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        await User.create({
          name: student.name,
          email: student.email,
          password: randomPassword,
          role: 'Student',
          status: 'Pending',
          regNo: student.regNo,
          department: student.dept,
          isEmailVerified: true,
          studentProfile: {
            branch: student.dept,
            course: student.program,
            batchYear: parseInt(student.year) || null,
            regNo: student.regNo
          }
        });
      } else {
        user.name = student.name;
        user.regNo = student.regNo;
        user.role = 'Student';
        if (!user.status) user.status = 'Pending';
        
        if (!user.studentProfile) user.studentProfile = {};
        user.studentProfile.branch = student.dept;
        user.studentProfile.course = student.program;
        user.studentProfile.batchYear = parseInt(student.year) || null;
        user.studentProfile.regNo = student.regNo;
        
        await user.save();
      }
      
      importedCount++;
    }

    res.json({
      success: true,
      message: `Imported ${importedCount} students successfully.`
    });

  } catch (error) {
    console.error('Confirm Import Error:', error);
    res.status(500).json({ success: false, message: 'Server error during import confirmation' });
  }
};

export const getCollections = async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ success: true, data: collections.map(c => c.name) });
  } catch (error) {
    console.error('Get Collections Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collections' });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { collection } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const dbCollection = mongoose.connection.db.collection(collection);
    const total = await dbCollection.countDocuments();
    const documents = await dbCollection.find({}).sort({ _id: -1 }).skip(skip).limit(limit).toArray();

    res.json({
      success: true,
      data: {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get Documents Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { collection } = req.params;
    const docData = req.body;

    if (docData._id && typeof docData._id === 'string' && docData._id.length === 24) {
      docData._id = new mongoose.Types.ObjectId(docData._id);
    }

    const dbCollection = mongoose.connection.db.collection(collection);
    const result = await dbCollection.insertOne(docData);

    res.status(201).json({ success: true, message: 'Document created', data: { ...docData, _id: result.insertedId } });
  } catch (error) {
    console.error('Create Document Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create document', error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    let updateData = { ...req.body };
    delete updateData._id;

    const dbCollection = mongoose.connection.db.collection(collection);
    const result = await dbCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    console.error('Update Document Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update document', error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const dbCollection = mongoose.connection.db.collection(collection);
    
    const result = await dbCollection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
};

export const auditCollection = async (req, res) => {
  try {
    const { collection } = req.params;
    const dbCollection = mongoose.connection.db.collection(collection);
    
    // Fetch a sample of 5 documents to analyze
    const sampleDocs = await dbCollection.find({}).limit(5).toArray();
    
    if (sampleDocs.length === 0) {
      return res.status(200).json({ success: true, data: { anomalies: [], summary: "Collection is empty." } });
    }

    const prompt = `You are a MongoDB Database Administrator AI. Analyze the following sample of up to 5 JSON documents from the "${collection}" collection. 
Identify any obvious data anomalies, inconsistent data types, or missing critical fields across the documents.

Sample Data:
${JSON.stringify(sampleDocs, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "anomalies": ["anomaly 1", "anomaly 2"],
  "summary": "A brief 2-sentence summary of the collection health."
}`;

    const result = await geminiService.generateJsonContent(prompt);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Audit Collection Error:', error);
    res.status(500).json({ success: false, message: 'Failed to audit collection', error: error.message });
  }
};
