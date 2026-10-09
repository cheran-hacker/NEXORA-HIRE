import React, { useState, useEffect, Suspense, lazy } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "../context/AuthContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layouts
import PublicLayout from "../layouts/PublicLayout.jsx";
import StudentLayout from "../layouts/StudentLayout.jsx";
import PlacementLayout from "../layouts/PlacementLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AlumniLayout from "../layouts/AlumniLayout.jsx";

// Public & Auth Pages
const Landing = lazy(() => import("../pages/public/Landing.jsx"));
const About = lazy(() => import("../pages/public/About.jsx"));
const Maintenance = lazy(() => import("../pages/public/Maintenance.jsx"));
const Contact = lazy(() => import("../pages/public/Contact.jsx"));
const FAQ = lazy(() => import("../pages/public/FAQ.jsx"));
const PublicProfile = lazy(() => import("../pages/public/PublicProfile.jsx"));
const Privacy = lazy(() => import("../pages/public/Privacy.jsx"));
const Terms = lazy(() => import("../pages/public/Terms.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail.jsx"));
const Onboarding = lazy(() => import("../pages/auth/Onboarding.jsx"));
const ActivateAccount = lazy(() => import("../pages/auth/ActivateAccount.jsx"));
const AlumniRegistration = lazy(() => import("../pages/auth/AlumniRegistration.jsx"));

// Student Pages
const StudentDashboard = lazy(() => import("../pages/student/Dashboard.jsx"));
const ResumeAnalyzer = lazy(() => import("../pages/student/ResumeAnalyzer.jsx"));
const InterviewSimulator = lazy(() => import("../pages/student/InterviewSimulator.jsx"));
const CareerRoadmap = lazy(() => import("../pages/student/CareerRoadmap.jsx"));
const Assessments = lazy(() => import("../pages/student/Assessments.jsx"));
const AssessmentEngine = lazy(() => import("../pages/student/AssessmentEngine.jsx"));
const MockInterview = lazy(() => import("../pages/student/MockInterview.jsx"));
const JobBoard = lazy(() => import("../pages/student/JobBoard.jsx"));
const StudentProfile = lazy(() => import("../pages/student/Profile.jsx"));
const MyApplications = lazy(() => import("../pages/student/MyApplications.jsx"));
const MatchMaker = lazy(() => import("../pages/student/MatchMaker.jsx"));
const BountyBoard = lazy(() => import("../pages/student/BountyBoard.jsx"));
const CodeRoast = lazy(() => import("../pages/student/CodeRoast.jsx"));
const SynergyMatch = lazy(() => import("../pages/student/SynergyMatch.jsx"));
const TalentExchange = lazy(() => import("../pages/student/TalentExchange.jsx"));
const ARTour = lazy(() => import("../pages/student/ARTour.jsx"));
const ReferralEngine = lazy(() => import("../pages/student/ReferralEngine.jsx"));
const EquipmentSharing = lazy(() => import("../pages/student/EquipmentSharing.jsx"));
const TimeBank = lazy(() => import("../pages/student/TimeBank.jsx"));
const Crowdfunding = lazy(() => import("../pages/student/Crowdfunding.jsx"));
const PivotPortfolio = lazy(() => import("../pages/student/PivotPortfolio.jsx"));
const CampusPulse = lazy(() => import("../pages/student/CampusPulse.jsx"));
const PulseCheckin = lazy(() => import("../pages/student/PulseCheckin.jsx"));
const KarmaLeaderboard = lazy(() => import("../pages/student/KarmaLeaderboard.jsx"));
const GeoRadar = lazy(() => import("../pages/student/GeoRadar.jsx"));
const WhisperNetwork = lazy(() => import("../pages/student/WhisperNetwork.jsx"));
const Marketplace = lazy(() => import("../pages/student/Marketplace.jsx"));
const LostFound = lazy(() => import("../pages/student/LostFound.jsx"));
const EventDAO = lazy(() => import("../pages/student/EventDAO.jsx"));
const FreshmanARG = lazy(() => import("../pages/student/FreshmanARG.jsx"));
const SmartResume = lazy(() => import("../pages/student/SmartResume.jsx"));
const PlagiarismCourt = lazy(() => import("../pages/student/PlagiarismCourt.jsx"));
const Colosseum = lazy(() => import("../pages/student/Colosseum.jsx"));
const AutopsyBoard = lazy(() => import("../pages/student/AutopsyBoard.jsx"));
const HackathonBox = lazy(() => import("../pages/student/HackathonBox.jsx"));
const StartupSprints = lazy(() => import("../pages/student/StartupSprints.jsx"));

const Watercooler = lazy(() => import("../pages/student/Watercooler.jsx"));
const RoomieRadar = lazy(() => import("../pages/student/RoomieRadar.jsx"));
const FoodRescue = lazy(() => import("../pages/student/FoodRescue.jsx"));
const SyllabusExplorer = lazy(() => import("../pages/student/SyllabusExplorer.jsx"));
const TextbookExchange = lazy(() => import("../pages/student/TextbookExchange.jsx"));
const ScholarshipMatchmaker = lazy(() => import("../pages/student/ScholarshipMatchmaker.jsx"));
const CampusReels = lazy(() => import("../pages/student/CampusReels.jsx"));
const ClubTreasury = lazy(() => import("../pages/student/ClubTreasury.jsx"));
const SpotFinder = lazy(() => import("../pages/student/SpotFinder.jsx"));
const SosMesh = lazy(() => import("../pages/student/SosMesh.jsx"));
const DeveloperPortal = lazy(() => import("../pages/student/DeveloperPortal.jsx"));
const StudentAgencies = lazy(() => import("../pages/student/StudentAgencies.jsx"));
const OpenSourceDashboard = lazy(() => import("../pages/student/OpenSourceDashboard.jsx"));
const RoomAuction = lazy(() => import("../pages/student/RoomAuction.jsx"));
const NoteDao = lazy(() => import("../pages/student/NoteDao.jsx"));
const VentSpace = lazy(() => import("../pages/student/VentSpace.jsx"));
const EscapeRoom = lazy(() => import("../pages/student/EscapeRoom.jsx"));
const HotSeat = lazy(() => import("../pages/student/HotSeat.jsx"));
const IpVault = lazy(() => import("../pages/student/IpVault.jsx"));
const HardwarePool = lazy(() => import("../pages/student/HardwarePool.jsx"));
const ResearchMatch = lazy(() => import("../pages/student/ResearchMatch.jsx"));
const ReverseMentoring = lazy(() => import("../pages/student/ReverseMentoring.jsx"));
const AlumniOffice = lazy(() => import("../pages/student/AlumniOffice.jsx"));
const AlumniDirectory = lazy(() => import("../pages/alumni/AlumniDirectory.jsx"));
const Shadowing = lazy(() => import("../pages/student/Shadowing.jsx"));
const Capstones = lazy(() => import("../pages/student/Capstones.jsx"));
const InnovationChallenges = lazy(() => import("../pages/student/InnovationChallenges.jsx"));
const SkillBadges = lazy(() => import("../pages/student/SkillBadges.jsx"));
const PortfolioGallery = lazy(() => import("../pages/student/PortfolioGallery.jsx"));
const PeerReviews = lazy(() => import("../pages/student/PeerReviews.jsx"));
const Grades = lazy(() => import("../pages/student/Grades.jsx"));
const Timetable = lazy(() => import("../pages/student/Timetable.jsx"));
const Offers = lazy(() => import("../pages/student/Offers.jsx"));
const ClubsDirectory = lazy(() => import("../pages/student/ClubsDirectory.jsx"));
const ParkingManager = lazy(() => import("../pages/student/ParkingManager.jsx"));
const StudentSettings = lazy(() => import("../pages/student/Settings.jsx"));

// Internship Pages
const InternshipPortal = lazy(() => import("../pages/internships/InternshipPortal.jsx"));

// Student Novelty Pages
const IndustryHub = lazy(() => import("../pages/student/IndustryHub.jsx"));
const AskConsensus = lazy(() => import("../pages/student/AskConsensus.jsx"));

// Community Pages
const Contests = lazy(() => import("../pages/community/Contests.jsx"));
const Hackathons = lazy(() => import("../pages/community/Hackathons.jsx"));

// Alumni Pages
const AlumniDashboard = lazy(() => import("../pages/alumni/Dashboard.jsx"));
const MentorshipBooking = lazy(() => import("../pages/alumni/MentorshipBooking.jsx"));
const MyBounties = lazy(() => import("../pages/alumni/MyBounties.jsx"));
const Donations = lazy(() => import("../pages/alumni/Donations.jsx"));
const Sessions = lazy(() => import("../pages/alumni/Sessions.jsx"));
const Referrals = lazy(() => import("../pages/alumni/Referrals.jsx"));
const AvailabilitySchedule = lazy(() => import("../pages/alumni/AvailabilitySchedule.jsx"));
const AlumniProfile = lazy(() => import("../pages/alumni/AlumniProfile.jsx"));
const AlumniSettings = lazy(() => import("../pages/alumni/AlumniSettings.jsx"));
const ConnectionRequests = lazy(() => import('../pages/alumni/ConnectionRequests.jsx'));
const ValidationInbox = lazy(() => import("../pages/alumni/ValidationInbox.jsx"));

// Admin Pages
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement.jsx"));
const AlumniManagement = lazy(() => import("../pages/admin/AlumniManagement.jsx"));
const AdminSettings = lazy(() => import("../pages/admin/Settings.jsx"));
const AdminHealth = lazy(() => import("../pages/admin/Health.jsx"));
const AdminDatabaseTools = lazy(() => import("../pages/admin/DatabaseTools.jsx"));
const PulseHeatmap = lazy(() => import("../pages/admin/PulseHeatmap.jsx"));
const AdminImport = lazy(() => import("../pages/admin/AdminImport.jsx"));
const SecurityLogs = lazy(() => import("../pages/admin/SecurityLogs.jsx"));

// Shared Pages
const AssessmentManager = lazy(() => import("../pages/shared/AssessmentManager.jsx"));
const SecurityCenter = lazy(() => import("../pages/shared/SecurityCenter.jsx"));
const Forum = lazy(() => import("../pages/shared/Forum.jsx"));
const Events = lazy(() => import("../pages/shared/Events.jsx"));
const Messages = lazy(() => import("../pages/shared/Messages.jsx"));

// Placement (Including former Recruiter/Faculty features)
const ATSDashboard = lazy(() => import("../pages/placement/ATSDashboard.jsx"));
const PlacementDashboard = lazy(() => import("../pages/placement/Dashboard.jsx"));
const PlacementAnalytics = lazy(() => import("../pages/placement/PlacementAnalytics.jsx"));
const JobManagement = lazy(() => import("../pages/placement/JobManagement.jsx"));
const Reports = lazy(() => import("../pages/placement/Reports.jsx"));
const PlacementStudents = lazy(() => import("../pages/placement/Students.jsx"));
const PlacementCompanies = lazy(() => import("../pages/placement/Companies.jsx"));
const ProjectManagement = lazy(() => import("../pages/placement/ProjectManagement.jsx"));
const CareerGuidance = lazy(() => import("../pages/placement/CareerGuidance.jsx"));
const PlacementTracking = lazy(() => import("../pages/placement/PlacementTracking.jsx"));
const RecruiterJobs = lazy(() => import("../pages/placement/Jobs.jsx"));
const CandidateSwipe = lazy(() => import("../pages/placement/CandidateSwipe.jsx"));
const CurriculumVoting = lazy(() => import("../pages/placement/CurriculumVoting.jsx"));
const Candidates = lazy(() => import("../pages/placement/Candidates.jsx"));
const InterviewScheduler = lazy(() => import("../pages/placement/InterviewScheduler.jsx"));
const HiringDrives = lazy(() => import("../pages/placement/HiringDrives.jsx"));

// New components to fix routing bugs
const JobDetails = lazy(() => import("../pages/student/JobDetails.jsx"));
const NotFound = lazy(() => import("../pages/public/NotFound.jsx"));
const AlumniMentors = lazy(() => import('../pages/student/AlumniMentors.jsx'));
const AskAlumni = lazy(() => import("../pages/student/AskAlumni.jsx"));
const Notifications = lazy(() => import("../pages/student/Notifications.jsx"));

import GlobalSearch from "../components/GlobalSearch.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const MaintenanceGuard = ({ children }) => {
  const { user } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.data?.isMaintenanceMode && user?.role !== "Admin") {
          setIsMaintenance(true);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  if (loading) return null;
  if (isMaintenance) return <Navigate to="/maintenance" />;
  return children;
};

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy_client_id"}
    >
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <MaintenanceGuard>
                <Suspense fallback={<div className="flex h-screen align-items-center justify-content-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
                  <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/p/:id" element={<PublicProfile />} />
                  </Route>

                  {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/activate/:token" element={<ActivateAccount />} />
                <Route path="/alumni-register/:token" element={<AlumniRegistration />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Student Routes */}
                <Route path="/student" element={<StudentLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="resume" element={<ResumeAnalyzer />} />
                  <Route path="interviews" element={<MockInterview />} />
                  <Route path="learning" element={<CareerRoadmap />} />
                  <Route path="assessments" element={<Assessments />} />
                  <Route
                    path="assessments/:id"
                    element={<AssessmentEngine />}
                  />
                  <Route path="jobs" element={<JobBoard />} />
                  <Route path="jobs/:id" element={<JobDetails />} />
                  <Route path="match" element={<MatchMaker />} />
                  <Route path="applications" element={<MyApplications />} />
                  <Route path="forum" element={<Forum />} />
                  <Route path="contests" element={<Contests />} />
                  <Route path="hackathons" element={<Hackathons />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route
                    path="alumni-directory"
                    element={<AlumniDirectory />}
                  />
                  <Route path="ask-alumni" element={<AskAlumni />} />
                  <Route path="alumni-mentors" element={<AlumniMentors />} />
                  <Route path="mentorship" element={<MentorshipBooking />} />
                  <Route path="internships" element={<InternshipPortal />} />
                  <Route path="bounties" element={<BountyBoard />} />
                  <Route path="code-roast" element={<CodeRoast />} />
                  <Route path="synergy" element={<SynergyMatch />} />
                  <Route path="talent-exchange" element={<TalentExchange />} />
                  <Route path="ar-tour" element={<ARTour />} />
                  <Route path="referrals" element={<ReferralEngine />} />
                  <Route path="equipment" element={<EquipmentSharing />} />
                  <Route path="timebank" element={<TimeBank />} />
                  <Route path="crowdfunding" element={<Crowdfunding />} />
                  <Route path="pivots" element={<PivotPortfolio />} />
                  <Route path="pulse" element={<CampusPulse />} />
                  <Route path="pulse/checkin" element={<PulseCheckin />} />
                  <Route path="karma" element={<KarmaLeaderboard />} />
                  <Route path="geo-network" element={<GeoRadar />} />
                  <Route path="whisper" element={<WhisperNetwork />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route path="lost-found" element={<LostFound />} />
                  <Route path="event-dao" element={<EventDAO />} />
                  <Route path="arg-hunt" element={<FreshmanARG />} />
                  <Route path="smart-resume" element={<SmartResume />} />
                  <Route
                    path="plagiarism-court"
                    element={<PlagiarismCourt />}
                  />
                  <Route path="colosseum" element={<Colosseum />} />
                  <Route path="autopsy-board" element={<AutopsyBoard />} />
                  <Route path="hackathon-box" element={<HackathonBox />} />
                  <Route path="startup-sprints" element={<StartupSprints />} />
                  <Route path="watercooler" element={<Watercooler />} />
                  <Route path="roomie-radar" element={<RoomieRadar />} />
                  <Route path="food-rescue" element={<FoodRescue />} />
                  <Route path="syllabus-graph" element={<SyllabusExplorer />} />
                  <Route
                    path="textbook-exchange"
                    element={<TextbookExchange />}
                  />
                  <Route
                    path="scholarships"
                    element={<ScholarshipMatchmaker />}
                  />
                  <Route path="reels" element={<CampusReels />} />
                  <Route path="treasury" element={<ClubTreasury />} />
                  <Route path="parking" element={<SpotFinder />} />
                  <Route path="sos-mesh" element={<SosMesh />} />
                  <Route path="dev-portal" element={<DeveloperPortal />} />
                  <Route path="agencies" element={<StudentAgencies />} />
                  <Route path="open-source" element={<OpenSourceDashboard />} />
                  <Route path="room-auction" element={<RoomAuction />} />
                  <Route path="note-dao" element={<NoteDao />} />
                  <Route path="vent-space" element={<VentSpace />} />
                  <Route path="escape-room" element={<EscapeRoom />} />
                  <Route path="hot-seat" element={<HotSeat />} />
                  <Route path="ip-vault" element={<IpVault />} />
                  <Route path="hardware-pool" element={<HardwarePool />} />
                  <Route path="research-match" element={<ResearchMatch />} />
                  <Route
                    path="reverse-mentoring"
                    element={<ReverseMentoring />}
                  />
                  <Route path="alumni-office" element={<AlumniOffice />} />
                  <Route path="shadowing" element={<Shadowing />} />
                  <Route path="capstones" element={<Capstones />} />
                  <Route path="challenges" element={<InnovationChallenges />} />
                  <Route path="skill-badges" element={<SkillBadges />} />
                  <Route path="3d-gallery" element={<PortfolioGallery />} />
                  <Route path="peer-reviews" element={<PeerReviews />} />
                  <Route path="security" element={<SecurityCenter />} />
                  <Route path="grades" element={<Grades />} />
                  <Route path="timetable" element={<Timetable />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="clubs" element={<ClubsDirectory />} />
                  <Route path="forum" element={<Forum />} />
                  <Route path="events" element={<Events />} />
                  <Route path="parking" element={<ParkingManager />} />
                  <Route path="settings" element={<StudentSettings />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="industry-hub" element={<IndustryHub />} />
                  <Route
                    path="notifications"
                    element={<Notifications />}
                  />{" "}
                </Route>

                {/* Alumni Routes */}
                <Route path="/alumni" element={<AlumniLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AlumniDashboard />} />
                  <Route path="mentorship" element={<MentorshipBooking />} />
                  <Route path="bounties" element={<MyBounties />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="forum" element={<Forum />} />
                  <Route path="contests" element={<Contests />} />
                  <Route path="profile" element={<AlumniProfile />} />
                  <Route path="sessions" element={<Sessions />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="referrals" element={<Referrals />} />
                  <Route path="network" element={<AlumniDirectory />} />
                  <Route
                    path="availability"
                    element={<AvailabilitySchedule />}
                  />
                  <Route path="settings" element={<AlumniSettings />} />
                  <Route path="validation-inbox" element={<ValidationInbox />} />
                  <Route path="connections" element={<ConnectionRequests />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users/*" element={<UserManagement />} />
                  <Route path="alumni" element={<AlumniManagement />} />
                  <Route path="pulse" element={<PulseHeatmap />} />
                  <Route path="assessments" element={<AssessmentManager />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="users/import" element={<AdminImport />} />
                  <Route path="health" element={<AdminHealth />} />
                  <Route path="db" element={<AdminDatabaseTools />} />
                  <Route path="logs" element={<SecurityLogs />} />
                </Route>

                {/* Placement Officer Routes */}
                <Route path="/placement" element={<PlacementLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<PlacementDashboard />} />
                  <Route path="analytics" element={<PlacementAnalytics />} />
                  <Route path="assessments" element={<AssessmentManager />} />
                  <Route path="jobs" element={<JobManagement />} />
                  <Route path="students" element={<PlacementStudents />} />
                  <Route path="companies" element={<PlacementCompanies />} />
                  <Route path="drives" element={<HiringDrives />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="guidance" element={<CareerGuidance />} />
                  <Route path="tracking" element={<PlacementTracking />} />
                  <Route path="ats" element={<ATSDashboard />} />
                  <Route path="recruiter-jobs" element={<RecruiterJobs />} />
                  <Route path="match" element={<CandidateSwipe />} />
                  <Route path="curriculum" element={<CurriculumVoting />} />
                  <Route path="candidates" element={<Candidates />} />
                  <Route path="interviews" element={<InterviewScheduler />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </MaintenanceGuard>
            <GlobalSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
