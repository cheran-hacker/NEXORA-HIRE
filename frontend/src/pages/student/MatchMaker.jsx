import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Home,
  Code,
  MessageSquare,
  Plus,
  Check,
  X,
  Shield,
  Search,
} from "lucide-react";
import { synergyService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
export default function MatchMaker() {
  const { addToast } = useToast();
  const [matchType, setMatchType] = useState("project");
  const [matches, setMatches] = useState({ project: [], roommate: [] });
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());
  React.useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await synergyService.getMatches();
        setMatches(res.data.data || { project: [], roommate: [] });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);
  const currentList = matches[matchType] || [];
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{
        background: "var(--bg)",
        minHeight: "100dvh",
        color: "var(--text)",
      }}
    >
      {" "}
      {/* Header Info */}{" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 bento-card p-4 mb-5 position-relative overflow-hidden">
        {" "}
        <div
          className="position-absolute top-0 end-0 bg-secondary opacity-25 blur-3 rounded-circle pe-none"
          style={{ width: 250, height: 250, filter: "blur(100px)" }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{
              fontSize: "2.5rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            {" "}
            <Users className="text-secondary" size={32} /> AI MatchMaker{" "}
          </h2>{" "}
          <p
            className="mb-0 fw-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover your perfect hackathon co-founder or ideal roommate based
            on deep compatibility vectors.
          </p>{" "}
        </div>{" "}
        <div
          className="position-relative z-1 d-flex gap-3 p-2 rounded-4"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          {" "}
          <button
            onClick={() => setMatchType("project")}
            className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${matchType === "project" ? "shadow-sm text-foreground" : "text-muted"}`}
            style={{
              background:
                matchType === "project" ? "var(--secondary)" : "transparent",
              border: "none",
            }}
          >
            {" "}
            <Code size={18} /> Project Partners{" "}
          </button>{" "}
          <button
            onClick={() => setMatchType("roommate")}
            className={`btn rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${matchType === "roommate" ? "shadow-sm text-foreground" : "text-muted"}`}
            style={{
              background:
                matchType === "roommate" ? "var(--success)" : "transparent",
              border: "none",
            }}
          >
            {" "}
            <Home size={18} /> Roommates{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* Main Grid */}{" "}
      <div className="row g-4">
        {" "}
        {/* Left Column: Matches */}{" "}
        <div className="col-lg-8 space-y-6">
          {" "}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {" "}
            <h4 className="fw-bold m-0" style={{ color: "var(--text)" }}>
              Suggested Matches
            </h4>{" "}
            <div className="position-relative">
              {" "}
              <Search
                className="position-absolute text-muted"
                size={16}
                style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
              />{" "}
              <input
                type="text"
                placeholder="Filter matches..."
                className="form-control rounded-pill ps-5 bg-transparent"
                style={{ color: "var(--text)", borderColor: "var(--border)" }}
              />{" "}
            </div>{" "}
          </div>{" "}
          <AnimatePresence mode="wait">
            {" "}
            <motion.div
              key={matchType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="d-flex flex-column gap-3"
            >
              {" "}
              {currentList.map((match) => (
                <div
                  key={match._id || match.id}
                  className="bento-card p-4 d-flex flex-column flex-md-row gap-4 align-items-md-center hover-glow"
                >
                  {" "}
                  {/* Avatar & Score */}{" "}
                  <div className="d-flex flex-column align-items-center flex-shrink-0">
                    {" "}
                    <div
                      className="rounded-4 d-flex align-items-center justify-content-center position-relative shadow-sm"
                      style={{
                        width: 80,
                        height: 80,
                        background: "var(--surface-2)",
                        border: "2px solid var(--border)",
                      }}
                    >
                      {" "}
                      <Users size={32} className="text-muted" />{" "}
                      <div
                        className="position-absolute rounded-circle d-flex align-items-center justify-content-center fw-bold text-foreground shadow-sm"
                        style={{
                          top: -10,
                          right: -10,
                          width: 32,
                          height: 32,
                          background: "var(--secondary)",
                          fontSize: "12px",
                        }}
                      >
                        {" "}
                        {match.compatibility}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Info */}{" "}
                  <div className="flex-grow-1">
                    {" "}
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {" "}
                      <h4
                        className="fw-bold m-0"
                        style={{ color: "var(--text)" }}
                      >
                        {match.name || match.title}
                      </h4>{" "}
                      <Shield size={16} className="text-success" />{" "}
                    </div>{" "}
                    <div
                      className="fw-bold mb-3"
                      style={{ color: "var(--secondary)", fontSize: "14px" }}
                    >
                      {" "}
                      {matchType === "project" ? match.role : match.course}{" "}
                    </div>{" "}
                    <p
                      className="small mb-3"
                      style={{
                        color: "var(--text-secondary)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {match.bio}
                    </p>{" "}
                    <div className="d-flex flex-wrap gap-2">
                      {" "}
                      {(match.skills || match.habits || []).map((tag, i) => (
                        <span
                          key={i}
                          className="badge rounded-pill fw-medium"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {" "}
                          {tag}{" "}
                        </span>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  {/* Actions */}{" "}
                  <div
                    className="d-flex flex-md-column gap-2 flex-shrink-0 mt-3 mt-md-0 w-100"
                    style={{ maxWidth: "160px" }}
                  >
                    {" "}
                    <button
                      onClick={async () => {
                        try {
                          await synergyService.connectWithMatch(
                            match._id || match.userId,
                          );
                          addToast(
                            `Connection request sent to ${match.name}! 🤝`,
                            "success",
                          );
                        } catch (err) {
                          addToast(err.message || "Failed to connect", "error");
                        }
                      }}
                      className="btn rounded-pill w-100 fw-bold d-flex align-items-center justify-content-center gap-2 hover-lift"
                      style={{
                        background: "var(--secondary)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      {" "}
                      <MessageSquare size={16} /> Connect{" "}
                    </button>{" "}
                    <button
                      onClick={() =>
                        setDismissed((prev) =>
                          new Set(prev).add(match._id || match.userId),
                        )
                      }
                      className="btn rounded-pill w-100 fw-bold"
                      style={{
                        background: "transparent",
                        color: "var(--text)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {" "}
                      Pass{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
        </div>{" "}
        {/* Right Column: AI Profile Tuning */}{" "}
        <div className="col-lg-4">
          {" "}
          <div
            className="bento-card p-4 position-sticky"
            style={{ top: "80px" }}
          >
            {" "}
            <h4 className="fw-bold mb-3" style={{ color: "var(--text)" }}>
              Your Matching Vectors
            </h4>{" "}
            <p
              className="small mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              The AI compares these vectors against other students to generate
              your compatibility score.
            </p>{" "}
            {matchType === "project" ? (
              <div className="d-flex flex-column gap-3">
                {" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Frontend Focus
                    </span>{" "}
                    <span style={{ color: "var(--secondary)" }}>80%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--secondary)", width: "80%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Backend Focus
                    </span>{" "}
                    <span style={{ color: "var(--secondary)" }}>30%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--secondary)", width: "30%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Design Systems
                    </span>{" "}
                    <span style={{ color: "var(--secondary)" }}>60%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--secondary)", width: "60%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Cleanliness
                    </span>{" "}
                    <span style={{ color: "var(--success)" }}>90%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--success)", width: "90%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Social Activity
                    </span>{" "}
                    <span style={{ color: "var(--success)" }}>40%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--success)", width: "40%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span style={{ color: "var(--text-muted)" }}>
                      Early Riser
                    </span>{" "}
                    <span style={{ color: "var(--success)" }}>20%</span>{" "}
                  </div>{" "}
                  <div
                    className="progress rounded-pill shadow-sm"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    <div
                      className="progress-bar rounded-pill"
                      style={{ background: "var(--success)", width: "20%" }}
                    ></div>
                  </div>{" "}
                </div>{" "}
              </div>
            )}{" "}
            <button
              onClick={() =>
                addToast(
                  "Edit your synergy profile to refine AI matching vectors",
                  "info",
                )
              }
              className="btn rounded-pill w-100 fw-bold mt-4"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            >
              {" "}
              Edit Preferences{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
