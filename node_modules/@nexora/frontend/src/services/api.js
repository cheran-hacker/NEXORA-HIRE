import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// ─── Request Interceptor: Attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.config && !error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('nexora_token');
        localStorage.removeItem('nexora_user');
        
        const path = window.location.pathname;
        const publicRoutes = ['/login', '/alumni-register', '/activate', '/reset-password', '/forgot-password', '/verify-email', '/onboarding', '/maintenance'];
        
        const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
        
        if (!isPublicRoute) {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 503) {
      if (window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── Auth Services ───────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  logout: () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
  },
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: (data) => api.post('/auth/resend-verification', data)
};

// ─── Settings Services ───────────────────────────────────────────────────────
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key, value) => api.put('/settings', { key, value }),
};

// ─── Assessment Services ─────────────────────────────────────────────────────
export const assessmentService = {
  getAll: () => api.get('/assessments'),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  update: (id, data) => api.put(`/assessments/${id}`, data),
  delete: (id) => api.delete(`/assessments/${id}`),
  getMyAssessments: () => api.get('/assessments/my-assessments'),
  start: (id) => api.post(`/assessments/${id}/start`),
  submit: (id, answers) => api.post(`/assessments/${id}/submit`, { answers }),
  getSubmissions: (id) => api.get(`/assessments/${id}/submissions`)
};

// ─── Role-Skill Map Services ───────────────────────────────────────────────
export const roleSkillService = {
  getAll: () => api.get('/role-skills'),
  create: (data) => api.post('/role-skills', data),
  update: (id, data) => api.put(`/role-skills/${id}`, data),
  delete: (id) => api.delete(`/role-skills/${id}`)
};

// ─── Recruitment / Jobs Services ─────────────────────────────────────────────
export const jobService = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getMyApplications: () => api.get('/jobs/my-applications'),
  getMyJobs: () => api.get('/jobs/my-jobs'),
  getApplications: (jobId) => api.get(`/jobs/${jobId}/applications`),
  updateStatus: (jobId, appId, status) =>
    api.patch(`/jobs/${jobId}/applications/${appId}/status`, { status }),
  getMyInterviews: () => api.get('/jobs/interviews/all'),
  scheduleInterview: (jobId, appId, data) => 
    api.post(`/jobs/${jobId}/applications/${appId}/interview`, data),
  shareOpportunity: (data) => api.post('/jobs/share', data),
  approveVacancy: (jobId) => api.put(`/jobs/${jobId}/approve`)
};

export const offerService = {
  getOffers: () => api.get('/jobs/my-applications')
};

// ─── AI Services ─────────────────────────────────────────────────────────────
export const aiService = {
  analyzeResume: (payload) => {
    if (payload instanceof FormData) {
      return api.post('/ai/resume-analyzer', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/ai/resume-analyzer', payload);
  },
  generateQuestions: (jobRole, skills, mode, count) =>
    api.post('/ai/interview/generate', { jobRole, skills, mode, count }),
  evaluateAnswer: (question, answer) =>
    api.post('/ai/interview/evaluate', { question, answer }),
  generateRoadmap: (targetRole, currentSkills, timeFrame) =>
    api.post('/ai/career/roadmap', { targetRole, currentSkills, timeFrame }),
  analyzeSkillGap: (targetCompany, targetRole, userResume) =>
    api.post('/ai/career/gap-analysis', { targetCompany, targetRole, userResume }),
  generateAssessment: (payload) => {
    if (payload instanceof FormData) {
      return api.post('/ai/assessment/generate', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/ai/assessment/generate', payload);
  }
};

// ─── Admin Services ────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  globalSearch: (q) => api.get(`/admin/search?q=${encodeURIComponent(q)}`),
  getJobMetrics: () => api.get('/admin/jobs/metrics'),
  getUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/users/${id}/details`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  validateStudentsImport: (data) => api.post('/admin/import-students/validate', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  confirmStudentsImport: (students) => api.post('/admin/import-students/confirm', { students }),
  verifyUser: (id, status) => api.put(`/admin/users/${id}/verify`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deleteAlumniInvitation: (id) => api.delete(`/alumni-invitations/${id}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`),
  getSystemHealth: () => api.get('/admin/health'),
  getDatabaseStats: () => api.get('/admin/db/stats'),
  getCollections: () => api.get('/admin/db/collections'),
  getDocuments: (collection, page = 1, limit = 50) => api.get(`/admin/db/${collection}/documents?page=${page}&limit=${limit}`),
  createDocument: (collection, data) => api.post(`/admin/db/${collection}/documents`, data),
  updateDocument: (collection, id, data) => api.put(`/admin/db/${collection}/documents/${id}`, data),
  deleteDocument: (collection, id) => api.delete(`/admin/db/${collection}/documents/${id}`),
  auditCollection: (collection) => api.post(`/admin/db/${collection}/audit`)
};

// ─── Recruiter Services ──────────────────────────────────────────────────────
export const recruiterService = {
  getStats: () => api.get('/recruiter/stats'),
  getCandidates: () => api.get('/recruiter/candidates')
};

// ─── Alumni Services ─────────────────────────────────────────────────────────
export const alumniService = {
  getStats: () => api.get('/alumni/stats'),
  getDirectory: () => api.get('/alumni/directory'),
  getAvailability: () => api.get('/alumni/availability'),
  updateAvailability: (data) => api.put('/alumni/availability', data),
  toggleAvailability: () => api.put('/alumni/availability'),
  bookMentorship: (data) => api.post('/alumni/mentorship/book', data),
  getMentorshipSessions: () => api.get('/alumni/mentorship/my-sessions'),
  acceptSession: (id) => api.put(`/alumni/mentorship/${id}/status`, { status: 'Scheduled' }),
  declineSession: (id) => api.put(`/alumni/mentorship/${id}/status`, { status: 'Declined' }),
  getReferrals: () => api.get('/alumni/referrals'),
  generateReferralLink: (data) => api.post('/alumni/referrals', data),
  getConnectionRequests: () => api.get('/alumni/connections'),
  updateConnectionRequest: (id, status) => api.put(`/alumni/connections/${id}`, { status })
};

export const mentorshipService = {
  getOverview: () => api.get('/mentorship/overview'),
  getMentors: (params) => api.get('/mentorship/mentors', { params }),
  getRecommended: () => api.get('/mentorship/recommended'),
  getAvailability: (alumniId, date) => api.get(`/mentorship/availability/${alumniId}${date ? `?date=${date}` : ''}`),
  getMyAvailability: () => api.get('/mentorship/my-availability'),
  updateMyAvailability: (data) => api.put('/mentorship/my-availability', data),
  createRequest: (data) => api.post('/mentorship/requests', data),
  bookSession: (data) => api.post('/mentorship/requests', data),
  getRequests: (params) => api.get('/mentorship/requests', { params }),
  acceptRequest: (id) => api.patch(`/mentorship/requests/${id}/accept`),
  rejectRequest: (id, reason) => api.patch(`/mentorship/requests/${id}/reject`, { reason }),
  cancelRequest: (id) => api.patch(`/mentorship/requests/${id}/cancel`),
  getSessions: (params) => api.get('/mentorship/sessions', { params }),
  getMySessions: () => api.get('/mentorship/sessions'),
  getSessionById: (id) => api.get(`/mentorship/sessions/${id}`),
  updateSessionStatus: (id, data) => api.patch(`/mentorship/sessions/${id}/status`, data),
  updateStatus: (id, status) => api.patch(`/mentorship/sessions/${id}/status`, { status }),
  updateNotes: (id, data) => api.patch(`/mentorship/sessions/${id}/notes`, data),
  addActionItem: (id, data) => api.post(`/mentorship/sessions/${id}/action-items`, data),
  updateActionItem: (id, itemId, data) => api.patch(`/mentorship/sessions/${id}/action-items/${itemId}`, data),
  submitFeedback: (id, data) => api.post(`/mentorship/sessions/${id}/feedback`, data)
};

// ─── Notification Services ───────────────────────────────────────────────────
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read')
};

// ─── Student Services ────────────────────────────────────────────────────────
export const studentService = {
  getStats: () => api.get('/student/stats'),
  getPublicProfile: (id, param) => api.get(`/student/public/${id}${param ? `?company=${param}` : ''}`),
  getDigitalTwin: () => api.get('/student/digital-twin'),
  getMatchedAlumniNetwork: () => api.get('/student/matched-alumni'),
  requestConnection: (data) => api.post('/student/connect-alumni', data),
  disconnectAlumni: (data) => api.post('/student/disconnect-alumni', data),
  toggleSavedJob: (jobId) => api.post(`/student/saved-jobs/${jobId}`),
  uploadResume: (payload) => api.post('/student/resume/upload', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getResumeAnalysis: () => api.get('/student/resume/analysis'),
  // Resume → Profile auto-fill (2-step)
  analyzeResumeForProfile: (formData) => api.post('/student/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  applyResumeProfile: (data) => api.post('/student/resume/apply', data),
};


// ─── Placement Services ──────────────────────────────────────────────────────
export const placementService = {
  getStats: () => api.get('/placements/stats'),
  getAnalyticsReports: () => api.get('/placements/reports'),
  getStudents: () => api.get('/placements/students'),
  getCompanies: () => api.get('/placements/companies'),
  getPipeline: () => api.get('/placements/pipeline'),
  getProjects: () => api.get('/placements/projects'),
  evaluateProject: (id, data) => api.put(`/placements/projects/${id}/evaluate`, data),
  getGuidance: () => api.get('/placements/guidance'),
  getTracking: () => api.get('/placements/tracking'),
  updateApplicationStatus: (id, status) => api.put(`/placements/applications/${id}/status`, { status })
};

export const hiringDriveService = {
  getAll: () => api.get('/hiring-drives'),
  create: (data) => api.post('/hiring-drives', data),
  update: (id, data) => api.put(`/hiring-drives/${id}`, data),
  delete: (id) => api.delete(`/hiring-drives/${id}`)
};


// ─── Community Services ────────────────────────────────────────────────────────
export const communityService = {
  getPosts: (params) => api.get('/posts', { params }),
  createPost: (data) => api.post('/posts', data),
  toggleLike: (id) => api.put(`/posts/${id}/like`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content })
};

// ─── Swipe Match Services ────────────────────────────────────────────────────────
export const swipeService = {
  getJobsForStudent: () => api.get('/swipe/jobs'),
  getCandidatesForRecruiter: () => api.get('/swipe/candidates'),
  recordSwipe: (data) => api.post('/swipe/action', data)
};

// ─── Bounty Services ───────────────────────────────────────────────────────────
export const bountyService = {
  getOpenBounties: () => api.get('/bounties/open'),
  getMyBounties: () => api.get('/bounties/my-bounties'),
  createBounty: (data) => api.post('/bounties', data),
  submitSolution: (id, data) => api.post(`/bounties/${id}/submit`, data),
  awardBounty: (id, submissionId) => api.put(`/bounties/${id}/award`, { submissionId })
};

// ─── Snippet (Code Roast) Services ─────────────────────────────────────────────
export const snippetService = {
  getSnippets: () => api.get('/snippets'),
  createSnippet: (data) => api.post('/snippets', data),
  roastSnippet: (id, comment) => api.post(`/snippets/${id}/roast`, { comment }),
  upvoteRoast: (id, roastId) => api.put(`/snippets/${id}/roast/upvote`, { roastId })
};

// ─── Synergy Match Services ────────────────────────────────────────────────────
export const synergyService = {
  getMyProfile: () => api.get('/synergy/me'),
  createOrUpdateProfile: (data) => api.post('/synergy', data),
  getMatches: () => api.get('/synergy/matches')
};

// ─── Syllabus Services ─────────────────────────────────────────────────────────
export const syllabusService = {
  getTopics: () => api.get('/syllabus'),
  createTopic: (data) => api.post('/syllabus', data),
  voteTopic: (id, voteType) => api.post(`/syllabus/${id}/vote`, { voteType })
};

// ─── Talent Exchange Services ──────────────────────────────────────────────────
export const stockService = {
  getPortfolio: () => api.get('/stocks/portfolio'),
  getMarket: () => api.get('/stocks/market'),
  invest: (id, shares) => api.post(`/stocks/${id}/invest`, { shares })
};

// ─── AR Tour Services ──────────────────────────────────────────────────────────
export const arService = {
  getNodes: () => api.get('/ar/nodes'),
  createNode: (data) => api.post('/ar/nodes', data)
};

// ─── Network Services ──────────────────────────────────────────────────────────
export const networkService = {
  getPath: (company) => api.get(`/network/path?company=${company}`)
};

// ─── Equipment Services ────────────────────────────────────────────────────────
export const equipmentService = {
  getEquipments: () => api.get('/equipment'),
  createEquipment: (data) => api.post('/equipment', data),
  requestEquipment: (id) => api.post(`/equipment/${id}/request`)
};

// ─── TimeBank Services ─────────────────────────────────────────────────────────
export const timebankService = {
  getMyTimeBank: () => api.get('/timebank/me'),
  transactTime: (data) => api.post('/timebank/transact', data)
};

// ─── Crowdfunding Services ─────────────────────────────────────────────────────
export const campaignService = {
  getCampaigns: () => api.get('/campaigns'),
  createCampaign: (data) => api.post('/campaigns', data),
  donateToCampaign: (id, amount) => api.post(`/campaigns/${id}/donate`, { amount })
};

// ─── Pivot Portfolio Services ──────────────────────────────────────────────────
export const pivotService = {
  getPivotRecords: () => api.get('/pivots'),
  createPivotRecord: (data) => api.post('/pivots', data)
};

// ─── Campus Pulse Services ─────────────────────────────────────────────────────
export const pulseService = {
  getHeatmap: () => api.get('/pulse'),
  checkIn: (data) => api.post('/pulse/checkin', data)
};

// ─── Karma System Services ───────────────────────────────────────────────────
export const karmaService = {
  getLeaderboard: () => api.get('/karma/leaderboard'),
  logKarma: (data) => api.post('/karma/log', data)
};

// ─── Geo Networking Services ───────────────────────────────────────────────────
export const geoService = {
  getActiveEvents: () => api.get('/geo/events'),
  createGeoEvent: (data) => api.post('/geo/events', data),
  checkInGeoEvent: (data) => api.post('/geo/checkin', data)
};

// ─── Whisper Network Services ──────────────────────────────────────────────────
export const whisperService = {
  getActiveChats: () => api.get('/whisper'),
  createChat: (data) => api.post('/whisper', data),
  joinChat: (id) => api.post(`/whisper/${id}/join`),
  getMessages: (id) => api.get(`/whisper/${id}/messages`),
  sendMessage: (id, data) => api.post(`/whisper/${id}/messages`, data)
};

// ─── Micro-Commerce Hub Services ──────────────────────────────────────────────
export const listingService = {
  getListings: () => api.get('/listings'),
  createListing: (data) => api.post('/listings', data),
  markListingSold: (id) => api.put(`/listings/${id}/sold`)
};

// ─── Smart Lost & Found Services ──────────────────────────────────────────────
export const lostfoundService = {
  getFoundItems: (search) => api.get(`/lostfound${search ? `?search=${search}` : ''}`),
  createFoundItem: (data) => api.post('/lostfound', data),
  claimItem: (id) => api.put(`/lostfound/${id}/claim`)
};

// ─── Event DAO Services ───────────────────────────────────────────────────────
export const daoService = {
  getProposals: () => api.get('/dao/proposals'),
  createProposal: (data) => api.post('/dao/proposals', data),
  stakeOnProposal: (id, stakeAmount) => api.post(`/dao/proposals/${id}/stake`, { stakeAmount }),
  claimTicket: (id) => api.post(`/dao/proposals/${id}/claim`)
};

// ─── Gamification & Dynamic Profiles Services ─────────────────────────────────

export const talentExchangeService = {
  getMarketOverview: () => api.get('/talent-exchange/market'),
  getMyPortfolio: () => api.get('/talent-exchange/portfolio'),
  investInStudent: (data) => api.post('/talent-exchange/invest', data)
};

export const argService = {
  getNodes: () => api.get('/arg/nodes'),
  scanNode: (data) => api.post('/arg/scan', data)
};

export const smartResumeService = {
  getRules: () => api.get('/smart-resume'),
  createRule: (data) => api.post('/smart-resume', data),
  deleteRule: (id) => api.delete(`/smart-resume/${id}`)
};

// ─── Peer Review & Public Analysis Services ─────────────────────────────────

export const courtService = {
  getAppeals: () => api.get('/court'),
  createAppeal: (data) => api.post('/court', data),
  voteOnAppeal: (id, vote, reasoning) => api.post(`/court/${id}/vote`, { vote, reasoning })
};

export const colosseumService = {
  getStreams: () => api.get('/colosseum'),
  scheduleStream: (data) => api.post('/colosseum', data),
  voteHire: (id, voteType) => api.post(`/colosseum/${id}/vote`, { voteType })
};

export const autopsyService = {
  getAutopsies: () => api.get('/autopsy'),
  createAutopsy: (data) => api.post('/autopsy', data),
  upvoteAutopsy: (id) => api.put(`/autopsy/${id}/upvote`)
};

// ─── Events, Sprints & Consulting Services ──────────────────────────────────

export const hackathonService = {
  getHackathons: () => api.get('/hackathon'),
  generateBox: (data) => api.post('/hackathon/generate', data),
  joinHackathon: (id) => api.post(`/hackathon/${id}/join`),
  formTeams: (id) => api.post(`/hackathon/${id}/form-teams`)
};

export const sprintService = {
  getSprints: () => api.get('/sprint'),
  createSprint: (data) => api.post('/sprint', data),
  applyToSprint: (id, data) => api.post(`/sprint/${id}/apply`, data),
  lockInSprint: (id) => api.post(`/sprint/${id}/lock-in`),
  updateGoal: (id, data) => api.post(`/sprint/${id}/goals`, data),
  failSprint: (id) => api.post(`/sprint/${id}/fail`)
};

export const consultingService = {
  getSlots: () => api.get('/consulting'),
  addSlot: (data) => api.post('/consulting', data),
  bookSlot: (id, data) => api.post(`/consulting/${id}/book`, data)
};

// ─── Campus Lifestyle & Networking ──────────────────────────────────────────

export const watercoolerService = {
  getActiveSessions: () => api.get('/watercooler'),
  startListening: (data) => api.post('/watercooler/start', data),
  joinSession: (id) => api.post(`/watercooler/${id}/join`)
};

export const roomieService = {
  getProfiles: () => api.get('/roomies'),
  createProfile: (data) => api.post('/roomies', data),
  swipeProfile: (id, action) => api.post(`/roomies/${id}/swipe`, { action })
};

export const foodRescueService = {
  getRescues: () => api.get('/food-rescue'),
  triggerRescue: (data) => api.post('/food-rescue/trigger', data),
  claimBox: (id) => api.post(`/food-rescue/${id}/claim`)
};

// ─── Academics & Finances ───────────────────────────────────────────────────

export const skillTreeService = {
  getSkillTree: () => api.get('/role-skills'),
  addNode: (data) => api.post('/skill-tree', data)
};

export const timetableService = {
  getTimetable: () => api.get('/timetable')
};

export const textbookService = {
  getListings: () => api.get('/textbooks'),
  createListing: (data) => api.post('/textbooks', data),
  proposeTrade: (id) => api.post(`/textbooks/${id}/trade`),
  updateEscrow: (id, status) => api.put(`/textbooks/${id}/escrow`, { status })
};

export const scholarshipService = {
  getScholarships: () => api.get('/scholarships'),
  autoApply: (id) => api.post(`/scholarships/${id}/apply`)
};

// ─── Campus Life & Utilities ────────────────────────────────────────────────

export const clubService = {
  getClubs: () => api.get('/club'),
  createClub: (data) => api.post('/club', data),
  joinClub: (id) => api.post(`/club/${id}/join`),
  getMyClubs: () => api.get('/club/my-clubs'),
  approveMember: (id, data) => api.post(`/club/${id}/approve`, data)
};

export const reelService = {
  getReels: () => api.get('/reels'),
  createReel: (data) => api.post('/reels', data),
  toggleLike: (id) => api.post(`/reels/${id}/like`)
};

export const treasuryService = {
  getTreasury: () => api.get('/treasury'),
  createClub: (data) => api.post('/treasury', data),
  requestExpense: (clubId, data) => api.post(`/treasury/${clubId}/expenses`, data),
  getExpenses: (clubId) => api.get(`/treasury/${clubId}/expenses`),
  approveExpense: (id) => api.post(`/treasury/expenses/${id}/approve`)
};

export const parkingService = {
  getLots: () => api.get('/parking'),
  createLot: (data) => api.post('/parking', data),
  updateStatus: (id, status) => api.put(`/parking/${id}`, { status })
};

// ─── Safety, Devs & Agencies ────────────────────────────────────────────────

export const sosService = {
  getActiveAlerts: () => api.get('/sos'),
  triggerSOS: (data) => api.post('/sos', data),
  resolveAlert: (id, status) => api.put(`/sos/${id}/resolve`, { status })
};

export const developerService = {
  getMyKeys: () => api.get('/developer'),
  generateKey: (data) => api.post('/developer', data),
  revokeKey: (id) => api.delete(`/developer/${id}`)
};

export const agencyService = {
  getAgencies: () => api.get('/agencies'),
  createAgency: (data) => api.post('/agencies', data),
  addFounder: (id, data) => api.post(`/agencies/${id}/founders`, data)
};

// ─── Open Source, Auctions & DAOs ───────────────────────────────────────────

export const opensourceService = {
  getLeaderboard: () => api.get('/opensource/leaderboard'),
  syncGithub: (data) => api.post('/opensource/sync', data)
};

export const auctionService = {
  getActiveAuctions: () => api.get('/auctions'),
  getBidsForRoom: (roomId) => api.get(`/auctions/${roomId}/bids`),
  placeBid: (roomId, bidAmount, timeSlot) => api.post('/auctions/bid', { roomId, bidAmount, timeSlot }),
  getMyBids: () => api.get('/auctions/my-bids')
};

export const notedaoService = {
  getNotes: () => api.get('/notedao'),
  uploadNote: (data) => api.post('/notedao', data)
};

// ─── Vents, Escape Rooms & Hot Seats ────────────────────────────────────────

export const donationService = {
  getDonations: () => api.get('/donations'),
  createDonation: (data) => api.post('/donations', data)
};

export const searchService = {
  globalSearch: (query) => api.get(`/admin/search?q=${encodeURIComponent(query)}`)
};

export const ventService = {
  getVents: () => api.get('/vents'),
  createVent: (data) => api.post('/vents', data)
};

export const escaperoomService = {
  getTasks: () => api.get('/escaperoom/tasks'),
  verifyAnswer: (data) => api.post('/escaperoom/verify', data)
};

export const hotseatService = {
  getSessions: () => api.get('/hotseat'),
  createSession: (data) => api.post('/hotseat', data),
  submitRating: (id, rating) => api.post(`/hotseat/${id}/rate`, { rating })
};

// ─── The Final 5 Modules ────────────────────────────────────────────────────

export const ipvaultService = {
  getMyIPs: () => api.get('/ipvault'),
  secureIP: (data) => api.post('/ipvault', data)
};

export const hardwarepoolService = {
  getAvailableHardware: () => api.get('/hardwarepool'),
  listHardware: (data) => api.post('/hardwarepool', data),
  borrowHardware: (id) => api.post(`/hardwarepool/${id}/borrow`)
};

export const researchmatchService = {
  getPapers: () => api.get('/researchmatch'),
  swipePaper: (id, action) => api.post(`/researchmatch/${id}/swipe`, { action })
};

export const reversementoringService = {
  getMentors: () => api.get('/reversementoring'),
  offerMentoring: (data) => api.post('/reversementoring', data),
  bookMentoring: (id) => api.post(`/reversementoring/${id}/book`)
};

export const alumniofficeService = {
  getLiveRooms: () => api.get('/alumni/rooms'),
  getPendingValidations: () => api.get('/alumni/validations'),
  validateSkill: (requestId, status, feedback) => api.post('/alumni/validate-skill', { requestId, status, feedback })
};

// ─── Phase 25: The True Finale ──────────────────────────────────────────────

export const shadowService = {
  getShadowPrograms: () => api.get('/shadow'),
  joinShadowProgram: (id) => api.post(`/shadow/${id}/join`)
};

export const capstoneService = {
  getCapstones: () => api.get('/capstones'),
  createCapstone: (data) => api.post('/capstones', data),
  investInCapstone: (id, amount) => api.post(`/capstones/${id}/invest`, { amount })
};

export const challengeService = {
  getChallenges: () => api.get('/challenges'),
  submitChallenge: (id, solutionLink) => api.post(`/challenges/${id}/submit`, { solutionLink })
};

export const badgeService = {
  getMyBadges: () => api.get('/badge'),
  issueBadge: (data) => api.post('/badge', data)
};

export const galleryService = {
  getMyGallery: () => api.get('/gallery'),
  updateGallery: (data) => api.post('/gallery', data)
};

export const reviewService = {
  getMyReviews: () => api.get('/reviews'),
  submitReview: (data) => api.post('/reviews', data)
};



export const consensusService = {
  getQuestions: () => api.get('/consensus'),
  askQuestion: (data) => api.post('/consensus', data),
  answerQuestion: (id, answer) => api.post(`/consensus/${id}/answer`, { answer })
};

export const contactService = {
  sendMessage: (data) => api.post('/contact', data)
};

export const alumniAuthService = {
  validateInvitation: (token) => api.get(`/alumni-invitations/validate/${token}`),
  register: (token, data) => api.post(`/alumni-invitations/register/${token}`, data)
};

export default api;
