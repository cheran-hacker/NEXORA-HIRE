import { CareerRoadmap } from '../models/CareerRoadmap.js';
import { User } from '../models/User.js';

/**
 * Seed initial sample roadmaps matching the reference design for demonstration
 */
const seedDemoRoadmapsForStudent = async (studentId) => {
  const existingCount = await CareerRoadmap.countDocuments({ studentId });
  if (existingCount > 0) return;

  const cyberRoadmap = new CareerRoadmap({
    studentId,
    roleName: 'Cybersecurity Analyst',
    duration: '6 months',
    durationMonths: 6,
    description: 'Comprehensive roadmap to become a Cybersecurity Analyst, covering core concepts, tools, certifications, and hands-on projects.',
    status: 'In Progress',
    progress: 65,
    currentSkills: ['Networking', 'Linux', 'Python', 'Security Fundamentals'],
    targetSkills: ['SIEM', 'Kali Linux', 'Wireshark', 'Threat Hunting', 'Incident Response', 'NIST Framework'],
    milestones: [
      {
        month: 'Month 1',
        focusArea: 'Networking Fundamentals',
        description: 'Learn OSI model, TCP/IP, subnetting, and network security basics.',
        status: 'Completed',
        skillsToLearn: ['OSI 7-Layer Model', 'TCP/IP Protocol Suite', 'Subnetting & CIDR', 'DNS/DHCP Security'],
        actionItems: ['Complete Packet Tracer virtual lab exercises', 'Analyze sample PCAP captures in Wireshark', 'Pass foundational networking quiz'],
        tags: ['Video Lectures', 'Practice Labs', 'Quiz'],
        resources: [
          { title: 'Professor Messer Network+ Course', type: 'Video', url: 'https://professormesser.com' },
          { title: 'Subnetting.net Practice Drills', type: 'Lab', url: 'https://subnetting.net' }
        ]
      },
      {
        month: 'Month 2',
        focusArea: 'Security Tools & Labs',
        description: 'Hands-on with Kali Linux, Wireshark, Nmap, and SIEM tools.',
        status: 'In Progress',
        skillsToLearn: ['Kali Linux CLI', 'Nmap Port Scanning', 'Wireshark Packet Analysis', 'Splunk SIEM Basics'],
        actionItems: ['Configure local VM lab on VirtualBox', 'Execute passive reconnaissance scans in isolated network', 'Complete TryHackMe SOC Level 1 lab rooms'],
        tags: ['Tool Installation', 'Guided Labs', 'Assignments'],
        resources: [
          { title: 'TryHackMe Pre-Security & SOC 1', type: 'Lab', url: 'https://tryhackme.com' },
          { title: 'Wireshark User Guide Official', type: 'Doc', url: 'https://www.wireshark.org' }
        ]
      },
      {
        month: 'Month 3',
        focusArea: 'Threat Detection & Analysis',
        description: 'Learn threat detection techniques, log analysis, and incident response.',
        status: 'Not Started',
        skillsToLearn: ['Log Correlation', 'MITRE ATT&CK Matrix', 'YARA Rules', 'Endpoint Detection & Response'],
        actionItems: ['Analyze compromised Windows Event Logs', 'Correlate attack chain to MITRE ATT&CK techniques', 'Submit incident triage report template'],
        tags: ['Case Studies', 'Hands-on Project'],
        resources: [
          { title: 'MITRE ATT&CK Enterprise Matrix', type: 'Doc', url: 'https://attack.mitre.org' }
        ]
      },
      {
        month: 'Month 4',
        focusArea: 'Security Frameworks & Compliance',
        description: 'Study NIST, ISO 27001, and basic compliance concepts.',
        status: 'Not Started',
        skillsToLearn: ['NIST Cybersecurity Framework (CSF)', 'ISO/IEC 27001', 'SOC2 Controls', 'Risk Assessment'],
        actionItems: ['Draft mock risk assessment for university portal', 'Map company security controls to NIST tiers', 'Review real-world data breach case studies'],
        tags: ['Documentation', 'Real-world Scenarios'],
        resources: [
          { title: 'NIST CSF 2.0 Quick Start Guide', type: 'Doc', url: 'https://www.nist.gov' }
        ]
      },
      {
        month: 'Month 5',
        focusArea: 'Capstone Project',
        description: 'Build a complete security monitoring project with report.',
        status: 'Not Started',
        skillsToLearn: ['Elasticsearch/Kibana (ELK)', 'Snort IDS', 'Security Automation', 'Executive Reporting'],
        actionItems: ['Deploy cloud honeypot to capture live brute-force traffic', 'Visualize attacker telemetry on Kibana dashboard', 'Produce comprehensive capstone defense report'],
        tags: ['Project Implementation', 'Final Report'],
        resources: [
          { title: 'T-Pot Multi-Honeypot Platform Guide', type: 'Doc', url: 'https://github.com/telekom-security/tpotce' }
        ]
      },
      {
        month: 'Month 6',
        focusArea: 'Interview Preparation',
        description: 'Solve interview questions, mock tests, and resume preparation.',
        status: 'Not Started',
        skillsToLearn: ['SOC Analyst Scenario Defense', 'CompTIA Security+ Prep', 'ATS Resume Tuning', 'Behavioral STAR Method'],
        actionItems: ['Conduct 3 mock technical interviews on Nexora Interview Simulator', 'Review portfolio with Alumni cybersecurity mentor', 'Complete 100 practice Security+ exam questions'],
        tags: ['Mock Interviews', 'Question Bank'],
        resources: [
          { title: 'Nexora AI Interview Simulator', type: 'Tool', url: '/student/interviews' }
        ]
      }
    ],
    resources: [
      { title: 'CompTIA Security+ SY0-701 Exam Objectives', category: 'Certifications', url: 'https://www.comptia.org', type: 'Exam Guide' },
      { title: 'TryHackMe SOC Analyst Learning Path', category: 'Practice Labs', url: 'https://tryhackme.com', type: 'Interactive Lab' },
      { title: 'Blue Team Labs Online (BTLO)', category: 'Practice Labs', url: 'https://blueteamlabs.online', type: 'CTF Platform' },
      { title: 'SANS Cyber Aces Online Free Tutorials', category: 'Courses', url: 'https://www.cyberaces.org', type: 'Free Course' }
    ],
    notes: [
      {
        title: 'Network Fundamentals Review',
        content: 'Remember that TCP 3-way handshake is SYN, SYN-ACK, ACK. Review Wireshark filters: tcp.flags.syn == 1 and tcp.flags.ack == 0 for initial SYN scans.'
      }
    ]
  });

  const fullStackRoadmap = new CareerRoadmap({
    studentId,
    roleName: 'Full Stack Developer',
    duration: '4 months',
    durationMonths: 4,
    description: 'Step-by-step roadmap to become a Full Stack Developer, including frontend, backend, databases, and real-world projects.',
    status: 'Saved',
    progress: 40,
    currentSkills: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
    targetSkills: ['React 18', 'Node.js', 'Express', 'MongoDB Aggregation', 'Docker', 'AWS Deployment'],
    milestones: [
      {
        month: 'Month 1',
        focusArea: 'Advanced Frontend & State Management',
        description: 'Deep dive into React ecosystem, hooks, and responsive design systems.',
        status: 'Completed',
        skillsToLearn: ['React Hooks', 'Context API', 'Modern CSS/Glassmorphism', 'Performance Tuning'],
        actionItems: ['Build interactive dashboard with dark mode and micro-interactions', 'Implement debounce/throttle for search inputs', 'Write component tests with Vitest'],
        tags: ['React & Node.js', 'Modern UI'],
        resources: [
          { title: 'React Official Documentation', type: 'Doc', url: 'https://react.dev' }
        ]
      },
      {
        month: 'Month 2',
        focusArea: 'Node.js, Express & RESTful APIs',
        description: 'Engineer secure, robust backend microservices with Express and JWT authentication.',
        status: 'In Progress',
        skillsToLearn: ['Express Middleware', 'JWT & Refresh Tokens', 'RBAC Security', 'Error Handling Pipelines'],
        actionItems: ['Design complete CRUD API for campus marketplace', 'Implement rate limiting and sanitization middleware', 'Write integration tests with Supertest'],
        tags: ['API Development', 'Authentication'],
        resources: [
          { title: 'Express.js Security Best Practices', type: 'Doc', url: 'https://expressjs.com' }
        ]
      },
      {
        month: 'Month 3',
        focusArea: 'Database Mastery & Real-World Projects',
        description: 'Design optimized MongoDB schemas, indexing, and end-to-end full-stack integration.',
        status: 'Not Started',
        skillsToLearn: ['MongoDB Aggregations', 'Indexes & Profiling', 'Mongoose Plugins', 'WebSockets'],
        actionItems: ['Build real-time chat with Socket.io and MongoDB', 'Perform query explain plans to ensure sub-10ms response', 'Deploy preview environment to Railway/Vercel'],
        tags: ['Portfolio Project', 'Databases'],
        resources: [
          { title: 'MongoDB University Free Courses', type: 'Course', url: 'https://learn.mongodb.com' }
        ]
      },
      {
        month: 'Month 4',
        focusArea: 'CI/CD, Cloud Deployment & FAANG Placement',
        description: 'Package microservices with Docker, automate deployment with GitHub Actions, and prep for interviews.',
        status: 'Not Started',
        skillsToLearn: ['Docker Multi-stage Builds', 'GitHub Actions', 'AWS EC2 / S3', 'System Design Basics'],
        actionItems: ['Deploy production portfolio to AWS with custom domain and SSL', 'Complete 5 system design mock challenges', 'Fine-tune ATS resume on Nexora Smart Resume'],
        tags: ['Cloud & DevOps', 'Placement Prep'],
        resources: [
          { title: 'Docker Official Get Started Tutorial', type: 'Doc', url: 'https://docs.docker.com' }
        ]
      }
    ],
    resources: [
      { title: 'Full Stack Open University of Helsinki', category: 'Courses', url: 'https://fullstackopen.com', type: 'Free Full Course' },
      { title: 'Roadmap.sh Full Stack Guide', category: 'Documentation', url: 'https://roadmap.sh/full-stack', type: 'Visual Guide' }
    ],
    notes: [
      {
        title: 'MERN Stack Architecture Notes',
        content: 'Separate backend routes, controllers, and models cleanly. Use JWT in HTTP-only cookies or Authorization Bearer header.'
      }
    ]
  });

  await Promise.all([cyberRoadmap.save(), fullStackRoadmap.save()]);
};

/**
 * GET /api/student/roadmaps
 * Get all saved career roadmaps for the logged-in student
 */
export const getStudentRoadmaps = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Check if student has roadmaps; if none exist, check if we should seed default demonstration roadmaps
    let roadmaps = await CareerRoadmap.find({ studentId }).sort({ createdAt: -1 });

    if (roadmaps.length === 0) {
      const studentUser = await User.findById(studentId);
      // Auto-seed demo roadmaps for first-time view
      if (studentUser) {
        await seedDemoRoadmapsForStudent(studentId);
        roadmaps = await CareerRoadmap.find({ studentId }).sort({ createdAt: -1 });
      }
    }

    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/student/roadmaps/:id
 * Get single saved career roadmap by ID
 */
export const getRoadmapById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await CareerRoadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Career roadmap not found'
      });
    }

    // Ownership check: must be owner student or admin
    if (roadmap.studentId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this roadmap'
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/student/roadmaps
 * Save or create a newly generated career roadmap in MongoDB
 */
export const createRoadmap = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const {
      roleName,
      duration = '6 months',
      durationMonths = 6,
      description,
      milestones = [],
      currentSkills = [],
      targetSkills = [],
      resources = [],
      status = 'In Progress'
    } = req.body;

    if (!roleName || !roleName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Career target role name is required'
      });
    }

    // Calculate duration months from string if not provided
    let numMonths = Number(durationMonths) || 6;
    if (!durationMonths && duration) {
      const str = String(duration).toLowerCase();
      if (str.includes('year')) {
        numMonths = (parseInt(str, 10) || 1) * 12;
      } else {
        const m = str.match(/\d+/);
        numMonths = m ? parseInt(m[0], 10) : 6;
      }
    }

    // Normalize milestones
    const formattedMilestones = milestones.map((m, idx) => {
      const monthLabel = m.month || `Month ${idx + 1}`;
      const focus = m.focusArea || m.title || `Milestone ${idx + 1}`;
      const statusVal = m.status || (idx === 0 ? 'In Progress' : 'Not Started');
      
      // Default tags if not provided
      const tags = Array.isArray(m.tags) && m.tags.length > 0 
        ? m.tags 
        : [
            focus.split(' ')[0] || 'Fundamentals',
            'Hands-on Lab',
            idx === milestones.length - 1 ? 'Interview Prep' : 'Quiz'
          ];

      return {
        month: monthLabel,
        focusArea: focus,
        description: m.description || `Master core principles, practical tooling, and assessment criteria for ${focus}.`,
        status: statusVal,
        skillsToLearn: Array.isArray(m.skillsToLearn) ? m.skillsToLearn : [roleName],
        actionItems: Array.isArray(m.actionItems) ? m.actionItems : [`Complete milestone deliverables for ${focus}`],
        tags,
        resources: Array.isArray(m.resources) ? m.resources : []
      };
    });

    // Default description if none provided
    const defaultDesc = description || `Comprehensive personalized roadmap to become a ${roleName.trim()}, covering core concepts, tools, certifications, and hands-on projects.`;

    const newRoadmap = new CareerRoadmap({
      studentId,
      roleName: roleName.trim(),
      duration: duration || `${numMonths} months`,
      durationMonths: numMonths,
      description: defaultDesc,
      status,
      currentSkills,
      targetSkills,
      milestones: formattedMilestones,
      resources
    });

    newRoadmap.recalculateProgress();
    await newRoadmap.save();

    res.status(201).json({
      success: true,
      message: 'Career roadmap successfully saved to MongoDB',
      data: newRoadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/student/roadmaps/:id/milestone
 * Update a milestone's status ('Not Started', 'In Progress', 'Completed')
 */
export const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { milestoneIndex, milestoneId, status } = req.body;

    if (!['Not Started', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Not Started", "In Progress", or "Completed"'
      });
    }

    const roadmap = await CareerRoadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Career roadmap not found'
      });
    }

    // Ownership check
    if (roadmap.studentId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this roadmap'
      });
    }

    let targetMilestone = null;
    if (typeof milestoneIndex === 'number' && roadmap.milestones[milestoneIndex]) {
      targetMilestone = roadmap.milestones[milestoneIndex];
    } else if (milestoneId) {
      targetMilestone = roadmap.milestones.id(milestoneId);
    }

    if (!targetMilestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found in roadmap'
      });
    }

    targetMilestone.status = status;
    roadmap.recalculateProgress();
    await roadmap.save();

    res.status(200).json({
      success: true,
      message: 'Milestone status updated and progress saved',
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/student/roadmaps/:id/notes
 * Add or append a study note to the roadmap
 */
export const addRoadmapNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, title = 'Study Note' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const roadmap = await CareerRoadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Career roadmap not found'
      });
    }

    if (roadmap.studentId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    roadmap.notes.unshift({
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await roadmap.save();

    res.status(201).json({
      success: true,
      message: 'Note saved successfully to roadmap',
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/student/roadmaps/:id
 * Delete a saved roadmap
 */
export const deleteRoadmap = async (req, res, next) => {
  try {
    const { id } = req.params;
    const roadmap = await CareerRoadmap.findById(id);

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Career roadmap not found'
      });
    }

    if (roadmap.studentId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot delete another student\'s roadmap'
      });
    }

    await CareerRoadmap.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Career roadmap deleted successfully from MongoDB'
    });
  } catch (error) {
    next(error);
  }
};
