# NEXORA Intelligence Data Flow

The core architecture of NEXORA relies on the **Continuous Career Feedback Loop**. Student intelligence is never static; it mutates instantly as new evidence is introduced to the system.

## 1. Data Ingestion (The Evidence Layer)
The data flow begins when a student takes an action that provides career evidence:
- **Profile Initialization**: Form submission (College, Target Role).
- **Resume Upload**: Passed to the `analyzeResume` AI controller.
- **Mock Interviews**: Recorded sessions evaluated for technical/soft capabilities.
- **Assessment Attempts**: Graded scores on technical proficiency.

## 2. Digital Twin Normalization (The Processing Layer)
Evidence is normalized into the `studentProfile`:
- Extracted resume string arrays are merged into `StudentSkill` sets dynamically.
- `Target Role` updates trigger queries against the `RoleSkillMap` matrix.
- The Backend calculates `Skill Gaps` by executing a diff between the user's `skills` array and the role's required skill definitions.

## 3. Intelligence Distribution (The Output Layer)
When the student navigates the platform, the frontend does not receive static cards. Instead:
- **Adaptive Job Matching**: The engine compares the newly merged `studentProfile.skills` against available `Opportunity` documents.
- **Alumni Matching Engine**: The engine scans the Alumni collection for users who possess the exact skills identified in the student's `Skill Gaps`. 

## 4. The Action Trigger (The Application Layer)
Students consume these outputs:
- They press "Apply" to a recommended Job.
- They press "Request Connection" to a recommended Alumni.
- *This writes to the `Application` or `AlumniConnection` collections.*

## 5. The Recalculation Loop
- Once connected, the Alumni reviews the request and accepts.
- The student undergoes Mentorship and completes an Assessment.
- The Assessment result adds a new "Skill" to the student's normalized array.
- **The loop resets**: The `Skill Gap` array shrinks, the `Career Readiness` percentage increases, and the AI Job Matcher automatically pivots to suggest higher-tier job opportunities.
