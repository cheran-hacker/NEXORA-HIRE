import React, { useState } from "react";
import {
  Trophy,
  Code2,
  Users,
  Calendar,
  ArrowRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Modal from "../../shared/components/Modal";
import { hackathonService } from "../../services/api";
export default function Contests() {
  const { addToast } = useToast();
  const [selectedContest, setSelectedContest] = useState(null);
  const [showRankingsModal, setShowRankingsModal] = useState(false);
  const [activeContests, setActiveContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fullLeaderboard = [
    { rank: 1, name: "David K.", dept: "Computer Science", score: 4520, badge: "Grandmaster" },
    { rank: 2, name: "Alice M.", dept: "Data Science", score: 3890, badge: "Master" },
    { rank: 3, name: "James L.", dept: "Software Eng.", score: 3120, badge: "Expert" },
    { rank: 4, name: "Priya S.", dept: "Artificial Intelligence", score: 2980, badge: "Specialist" },
    { rank: 5, name: "Rahul V.", dept: "Information Tech", score: 2840, badge: "Specialist" },
    { rank: 6, name: "Emma W.", dept: "Cybersecurity", score: 2610, badge: "Knight" },
    { rank: 7, name: "Kiran R.", dept: "Electronics (ECE)", score: 2450, badge: "Knight" },
  ];
  React.useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await hackathonService.getHackathons();
        setActiveContests(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);
  const handleRegister = () => {
    setSelectedContest(null);
    addToast(
      `Successfully registered for ${selectedContest.title}! Good luck!`,
      "success",
    );
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1200px" }}>
      {" "}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", color: "var(--text)" }}
          >
            {" "}
            <Trophy className="text-warning" size={32} /> Hackathons &
            Contests{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Compete with top talent, build portfolio projects, and win massive
            prizes.
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Featured Hero Contest */}{" "}
      <div className="bento-card rounded-4 overflow-hidden position-relative mb-5">
        {" "}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 pe-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(var(--primary-rgb),0.1), rgba(var(--secondary-rgb),0.1))",
          }}
        ></div>{" "}
        <div className="p-4 p-md-5 position-relative z-1 d-flex flex-column flex-md-row align-items-center gap-4">
          {" "}
          <div className="flex-grow-1 space-y-4">
            {" "}
            <div
              className="badge rounded-pill px-3 py-2 fw-bold text-uppercase d-inline-flex align-items-center gap-2 mb-3"
              style={{
                background: "rgba(var(--warning-rgb), 0.2)",
                color: "var(--warning)",
              }}
            >
              {" "}
              <Star size={14} /> Flagship Event{" "}
            </div>{" "}
            <h2
              className="fw-black mb-3"
              style={{ fontSize: "3rem", color: "var(--text)" }}
            >
              {" "}
              Nexora{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Build 2026
              </span>{" "}
            </h2>{" "}
            <p
              className="lead fw-medium"
              style={{ color: "var(--text-secondary)", maxWidth: "600px" }}
            >
              {" "}
              Our biggest annual hackathon. Build the future of AI-driven
              education tools over 48 hours. Mentors from Google, Meta, and
              Microsoft will be present.{" "}
            </p>{" "}
            <div className="d-flex flex-wrap gap-4 pt-3">
              {" "}
              <div className="d-flex align-items-center gap-2">
                {" "}
                <Trophy className="text-warning" />{" "}
                <div>
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Prize Pool
                  </div>{" "}
                  <div
                    className="h5 fw-bold mb-0"
                    style={{ color: "var(--text)" }}
                  >
                    $100,000
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="d-flex align-items-center gap-2">
                {" "}
                <Users className="text-success" />{" "}
                <div>
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Participants
                  </div>{" "}
                  <div
                    className="h5 fw-bold mb-0"
                    style={{ color: "var(--text)" }}
                  >
                    4,200+ Registered
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              <div className="d-flex align-items-center gap-2">
                {" "}
                <Calendar className="text-primary" />{" "}
                <div>
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Date
                  </div>{" "}
                  <div
                    className="h5 fw-bold mb-0"
                    style={{ color: "var(--text)" }}
                  >
                    October 15-17
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() => setSelectedContest({ title: "Nexora Build 2026" })}
              className="btn rounded-pill px-5 py-3 fw-bold mt-4 shadow-sm hover-lift d-inline-flex align-items-center gap-2"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              {" "}
              Register Now <ArrowRight size={20} />{" "}
            </button>{" "}
          </div>{" "}
          <div
            className="d-none d-md-flex align-items-center justify-content-center rounded-circle border border-primary opacity-50"
            style={{
              width: "250px",
              height: "250px",
              borderStyle: "dashed !important",
              borderWidth: "4px !important",
            }}
          >
            {" "}
            <Code2 size={100} className="text-primary" />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        {/* Active Contests Grid */}{" "}
        <div className="lg:col-span-2 space-y-6">
          {" "}
          <div className="flex align-items-center justify-content-between">
            {" "}
            <h3 className="fs-4 fw-bold text-foreground">Active Challenges</h3>{" "}
            <button
              onClick={() => {
                const el = document.getElementById("active-challenges-grid");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-primary small fw-medium hover:underline bg-transparent border-0 p-0"
            >
              View All
            </button>{" "}
          </div>{" "}
          <div id="active-challenges-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {" "}
            {activeContests.map((contest) => (
              <div
                key={contest._id || contest.id}
                className="rounded-4 shadow-sm rounded-2xl overflow-hidden d-flex flex-column group cursor-pointer transition-transform hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10"
                onClick={() => setSelectedContest(contest)}
              >
                {" "}
                <div
                  className="h-32 position-relative"
                  style={{ background: contest.image }}
                >
                  {" "}
                  {contest.isHot && (
                    <div className="position-absolute top-4 right-4 bg-card/20 backdrop-blur-md text-foreground small fw-bold px-3 py-1 rounded-circle flex align-items-center gap-1">
                      {" "}
                      <TrendingUp size={12} /> Trending{" "}
                    </div>
                  )}{" "}
                </div>{" "}
                <div className="p-6 flex-grow-1 d-flex flex-column">
                  {" "}
                  <div className="small text-primary fw-bold tracking-wide mb-1 uppercase">
                    {contest.organizer}
                  </div>{" "}
                  <h4 className="fs-5 fw-bold text-foreground mb-2 group-hover:text-primary transition-fast">
                    {contest.title}
                  </h4>{" "}
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {" "}
                    {(contest.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="badge rounded-pill fw-medium"
                        style={{
                          background: "rgba(0,0,0,0.05)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {" "}
                        {tag}{" "}
                      </span>
                    ))}{" "}
                  </div>{" "}
                  <div
                    className="mt-auto pt-4 border-top row g-3"
                    style={{ borderColor: "rgba(0,0,0,0.05)" }}
                  >
                    {" "}
                    <div className="col-6">
                      {" "}
                      <div className="small text-muted mb-1">Prize</div>{" "}
                      <div
                        className="fw-bold"
                        style={{ color: "var(--success)" }}
                      >
                        {contest.prize}
                      </div>{" "}
                    </div>{" "}
                    <div className="col-6">
                      {" "}
                      <div className="small text-muted mb-1">Status</div>{" "}
                      <div className="fw-bold text-foreground">
                        {contest.deadline}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Global Leaderboard Sidebar */}{" "}
        <div className="space-y-6">
          {" "}
          <div className="rounded-4 shadow-sm p-4 rounded-4">
            {" "}
            <h3 className="text-foreground fw-bold mb-4 d-flex align-items-center gap-2">
              {" "}
              <Trophy size={20} className="text-warning" /> Global
              Leaderboard{" "}
            </h3>{" "}
            <div className="d-flex flex-column gap-3">
              {" "}
              {/* Rank 1 */}{" "}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4"
                style={{
                  background:
                    "linear-gradient(to right, rgba(var(--warning-rgb), 0.2), transparent)",
                  border: "1px solid rgba(var(--warning-rgb), 0.3)",
                }}
              >
                {" "}
                <div
                  className="fw-black fs-5 text-center"
                  style={{ color: "var(--warning)", width: "24px" }}
                >
                  1
                </div>{" "}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-foreground shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--warning)",
                  }}
                >
                  {" "}
                  D{" "}
                </div>{" "}
                <div className="flex-grow-1 text-truncate">
                  {" "}
                  <h5 className="fw-bold m-0 text-foreground text-truncate">
                    David K.
                  </h5>{" "}
                  <p className="small m-0 text-muted">CS Senior</p>{" "}
                </div>{" "}
                <div className="text-end">
                  {" "}
                  <div className="fw-bold" style={{ color: "var(--warning)" }}>
                    4,520
                  </div>{" "}
                  <div
                    className="text-uppercase tracking-wide text-muted"
                    style={{ fontSize: "0.65rem" }}
                  >
                    Points
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Rank 2 */}{" "}
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.05), transparent)",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {" "}
                <div
                  className="fw-black fs-5 text-center text-muted"
                  style={{ width: "24px" }}
                >
                  2
                </div>{" "}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-foreground shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--surface-2)",
                  }}
                >
                  {" "}
                  A{" "}
                </div>{" "}
                <div className="flex-grow-1 text-truncate">
                  {" "}
                  <h5 className="fw-bold m-0 text-foreground text-truncate">
                    Alice M.
                  </h5>{" "}
                  <p className="small m-0 text-muted">Data Science</p>{" "}
                </div>{" "}
                <div className="text-end">
                  {" "}
                  <div
                    className="fw-bold"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    3,890
                  </div>{" "}
                </div>{" "}
              </div>{" "}
              {/* Rank 3 */}{" "}
              <div
                className="d-flex align-items-center gap-4 p-3 rounded-4"
                style={{
                  background:
                    "linear-gradient(to right, rgba(var(--danger-rgb), 0.1), transparent)",
                  border: "1px solid rgba(var(--danger-rgb), 0.2)",
                }}
              >
                {" "}
                <div
                  className="fw-black fs-5 text-center"
                  style={{ color: "var(--danger)", width: "24px" }}
                >
                  3
                </div>{" "}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-foreground shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--danger)",
                  }}
                >
                  {" "}
                  J{" "}
                </div>{" "}
                <div className="flex-grow-1 text-truncate">
                  {" "}
                  <h5 className="fw-bold m-0 text-foreground text-truncate">
                    James L.
                  </h5>{" "}
                  <p className="small m-0 text-muted">Software Eng.</p>{" "}
                </div>{" "}
                <div className="text-end">
                  {" "}
                  <div
                    className="small fw-bold"
                    style={{ color: "var(--danger)" }}
                  >
                    3,120
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() => setShowRankingsModal(true)}
              className="btn w-100 mt-4 small fw-medium text-muted transition-fast hover-text-foreground"
            >
              {" "}
              View Full Rankings{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <Modal
        isOpen={!!selectedContest}
        onClose={() => setSelectedContest(null)}
        title="Contest Registration"
        actions={
          <>
            {" "}
            <button
              className="btn bg-transparent fw-medium transition-fast hover-text-foreground"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setSelectedContest(null)}
            >
              {" "}
              Cancel{" "}
            </button>{" "}
            <button
              className="btn rounded-3 fw-medium px-4 py-2 hover-lift d-flex align-items-center gap-2"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.2)",
              }}
              onClick={handleRegister}
            >
              {" "}
              Confirm Registration{" "}
            </button>{" "}
          </>
        }
      >
        {" "}
        {selectedContest && (
          <div style={{ color: "var(--text-secondary)" }}>
            {" "}
            <p className="mb-4">
              You are about to register for{" "}
              <strong className="text-foreground">{selectedContest.title}</strong>.
            </p>{" "}
            <div
              className="p-3 rounded-3 mb-3 d-flex flex-column gap-3 small"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              <div className="d-flex align-items-center gap-3">
                {" "}
                <Users size={16} style={{ color: "var(--primary)" }} />{" "}
                <span>You will be added to the participant roster.</span>{" "}
              </div>{" "}
              <div className="d-flex align-items-center gap-3">
                {" "}
                <Calendar size={16} style={{ color: "var(--primary)" }} />{" "}
                <span>
                  Ensure you are available during the event dates.
                </span>{" "}
              </div>{" "}
              <div className="d-flex align-items-center gap-3">
                {" "}
                <Code2 size={16} style={{ color: "var(--primary)" }} />{" "}
                <span>Any code submitted must be original work.</span>{" "}
              </div>{" "}
            </div>{" "}
            <p className="small text-muted mb-0">
              By registering, you agree to the community code of conduct and
              hackathon rules.
            </p>{" "}
          </div>
        )}{" "}
      </Modal>{" "}
      <Modal
        isOpen={showRankingsModal}
        onClose={() => setShowRankingsModal(false)}
        title="🏆 Campus Contest Leaderboard"
        actions={
          <button
            className="btn btn-primary rounded-pill px-4 py-2 fw-bold"
            onClick={() => setShowRankingsModal(false)}
          >
            Close
          </button>
        }
      >
        <div className="d-flex flex-column gap-2" style={{ maxHeight: "400px", overflowY: "auto" }}>
          {fullLeaderboard.map((item) => (
            <div
              key={item.rank}
              className="d-flex align-items-center justify-content-between p-3 rounded-3"
              style={{
                background: item.rank <= 3 ? "rgba(var(--primary-rgb), 0.08)" : "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span
                  className="fw-black fs-6 text-center"
                  style={{
                    width: 28,
                    color: item.rank === 1 ? "var(--warning)" : item.rank === 2 ? "var(--text-secondary)" : item.rank === 3 ? "var(--danger)" : "var(--muted)",
                  }}
                >
                  #{item.rank}
                </span>
                <div>
                  <h6 className="fw-bold mb-0 text-foreground">{item.name}</h6>
                  <small className="text-muted">{item.dept}</small>
                </div>
              </div>
              <div className="text-end">
                <div className="fw-black text-primary">{item.score.toLocaleString()} pts</div>
                <span className="badge bg-secondary-subtle text-secondary small">{item.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
