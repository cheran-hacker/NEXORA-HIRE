# Nexora Hire - The Ultimate Unified Campus Platform

Welcome to **Nexora Hire**, an expansive, state-of-the-art platform designed to unify the entire student lifecycle—from freshman orientation to alumni networking. Nexora acts as a central hub for academics, career development, gamified skill building, and campus social life.

## 🌟 Overview
Nexora Hire consists of **76+ custom-built modules** divided into 5 core pillars:
1. **Academic & Mentorship (The Learning Core):** Mentor/mentee matching algorithms, capstone tracking, and collaborative note-sharing.
2. **Social & Community (The Campus Pulse):** Real-time web-socket feeds, anonymous "whisper" networks, roommate finding, and event DAO voting.
3. **Career & Innovation (The Launchpad):** Startup crowdfunding, open-source bounty boards, equipment sharing, and IP vaults.
4. **Gamification & Training (The Edge):** Live coding challenges (CodeRoast, Colosseum), interactive leaderboards, and mock interviews.
5. **Infrastructure & Ecosystem (The Engine):** Geospatial mapping (GeoRadar, SpotFinder), AR navigation, and emergency SOS mesh networks.

## 🚀 Tech Stack
### Backend
- **Node.js & Express:** Robust, modular API architecture using the MVC (Model-View-Controller) pattern.
- **MongoDB & Mongoose:** Highly relational NoSQL schema design managing everything from User auth to complex DAO voting tallies.
- **Security & Auth:** JWT-based authentication, bcrypt hashing, and role-based access control (Student, Alumni, Admin).

### Frontend
- **React (Vite):** Blazing fast frontend rendering.
- **Styling (CSS):** Custom, premium glassmorphism aesthetics, utilizing Bootstrap 5 utilities and bespoke CSS micro-animations (`theme.css`, `index.css`).
- **Framer Motion:** For fluid, engaging UI transitions.
- **Lucide React:** Modern, clean iconography.

## 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd NEXORA-HIRE
   ```

2. **Install Dependencies:**
   Install for the root, backend, and frontend.
   ```bash
   npm run install-all
   # Or navigate to apps/backend and apps/frontend and run npm install
   ```

3. **Environment Variables:**
   Ensure your `.env` in `apps/backend` contains:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Application:**
   Run both frontend and backend concurrently from the root directory.
   ```bash
   npm start
   # This will launch the backend on port 5000 and the Vite frontend on port 5173
   ```

## 🏗 Architecture Highlights
- **Role-Based Layouts:** The frontend dynamically renders different sidebar navigations depending on the user's role (Student, Recruiter, Alumni, Placement Officer, Admin).
- **Responsive "Bento Box" UI:** The entire interface is built using modern "bento-card" components that adapt perfectly to mobile and desktop displays.
- **Gamified Actions:** Nearly every interaction on the platform ties back to the `KarmaLog` model, rewarding users for positive campus contributions.

## 🤝 Contributing
With over 76 modules, Nexora is highly extensible. To add a new feature:
1. Define your `Schema` in `apps/backend/src/models/`
2. Create your logic in `apps/backend/src/controllers/`
3. Map the endpoint in `apps/backend/src/routes/`
4. Build the stunning UI component in `apps/frontend/src/pages/`
5. Wire it up in `apps/frontend/src/app/App.jsx`

---
*Built with passion, AI, and a vision for the future of higher education ecosystems.*
