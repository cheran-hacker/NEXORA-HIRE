# NEXORA System Audit

## 1. System Architecture
NEXORA is built on the MERN stack (MongoDB, Express, React, Node.js) with Vite as the frontend build tool. The architecture emphasizes a unified intelligence layer powered by the **Career Digital Twin**, which aggregates user data (academic, resume, skills, target role) to power all subsystems.

## 2. Core Modules
- **Student Module**: Manages the `studentProfile`, dynamically parsing resumes to extract skills and calculating the `CareerTarget`. It natively connects to Assessments, Applications, and Mentorship requests.
- **Alumni Module**: Built with a strict registration/approval lifecycle. Alumni connect with students via the dynamic `AlumniConnection` requests and mentorship sessions.
- **Placement Module**: Creates and manages `Jobs`, `Internships`, and `HiringDrives`. Receives real applications pushed natively through the Student portal.
- **Admin Module**: Manages all RBAC authorizations, user activations, and system health.

## 3. Database & Models
- `User`: Primary collection holding authentication. Differentiates via `role` (Student, Alumni, Admin, Placement). Extended heavily with `studentProfile` and `alumniProfile`.
- `CareerTarget` & `RoleSkillMap`: Relational matrices identifying required skills for positions.
- `StudentSkill`: Explicit skill definitions including proficiency.
- `AlumniConnection` & `MentorshipSession`: N-to-N resolution tables handling bidirectional acceptance.
- `Application` & `Opportunity`: Natively maps students to placement-created roles.
- `AIInterviewSession` & `AssessmentAttempt`: Immutable logs of evaluated readiness.

## 4. Artificial Intelligence & Matching Algorithms
- **Resume Parsing Engine**: Utilizes Gemini to extract skills, calculate ATS scores, and merge missing tags into the student's primary array.
- **Career Readiness Score**: Computed dynamically at runtime, weighting resume density, assessment completion, and target-role match percentage.
- **Job Matching Algorithm**: Uses `RoleSkillMap` intersections. Job relevance is scaled by comparing `studentProfile.skills` against `Opportunity.requiredSkills`.
- **Alumni Matching Algorithm**: Compares the student's detected "Skill Gaps" against active alumni's "Expertise", highly ranking alumni who can specifically mentor the student's weakest required parameters.
- **Continuous Feedback Loop**: Because all matching algorithms compute via dynamic database aggregation (no cached mock arrays), uploading a new resume immediately changes Recommended Jobs and Mentors.

## 5. Security & Authorization
- **Authentication**: JWT-based stateless authentication (`protect` middleware).
- **Authorization**: Role-based access control (`authorize('Admin', 'Placement')`).
- **Data Isolation**: Endpoints validate `req.user.id` against document ownership (e.g., students cannot patch other students' applications).
- **Passwords**: Encrypted using `bcryptjs`. No plain-text transmissions.

## 6. Known Limitations
- The `Community` and `Industry Hub` features require expanded native schemas if external CMS integration is abandoned.
- Extensive caching (Redis) may be required on the `getMatchedAlumniNetwork` and `getMatchedJobs` routes once the userbase exceeds 50,000 active students, as runtime intersection arrays are CPU-heavy.
