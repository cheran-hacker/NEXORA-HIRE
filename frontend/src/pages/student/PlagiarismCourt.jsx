import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Gavel,
  FileCode,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { courtService } from "../../services/api.js";
import { useToast } from "../../context/ToastContext";
export default function PlagiarismCourt() {
  const { addToast } = useToast();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState({}); // Static demo case for when no API data exists
  const [activeCase, setActiveCase] = useState(null);
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        const res = await courtService.getAppeals();
        const data = res.data.data || [];
        setAppeals(data);
        if (data.length > 0) setActiveCase(data[0]);
      } catch (err) {
        // Fall back to demo case on error
        setActiveCase(demoCase);
      } finally {
        setLoading(false);
      }
    };
    fetchAppeals();
  }, []);
  const handleVote = async (id, vote) => {
    try {
      await courtService.voteOnAppeal(
        id,
        vote,
        `Voted ${vote} based on code review`,
      );
      addToast(
        `Verdict cast: ${vote === "guilty" ? "Guilty ⚖️" : "Not Guilty ✅"}`,
        "success",
      );
      setVoted((prev) => ({ ...prev, [id]: vote }));
    } catch (err) {
      addToast(err.message || "Failed to cast vote", "error");
    }
  };
  const demoCase = {
    id: "CASE-2901",
    defendant: "Anonymous_Student_49",
    plaintiff: "AutoGrader_AI",
    similarityScore: 92,
    originalCode: `function calculatePath(start, end, grid) { let openSet = [start]; let closedSet = []; while(openSet.length > 0) { let current = getLowestFScore(openSet); if(current === end) return reconstructPath(current); openSet.remove(current); closedSet.push(current); for(let neighbor of current.neighbors) { if(closedSet.includes(neighbor)) continue; // Calculate heuristics
let tempG = current.g + heuristic(current, neighbor); } } }`,
    submittedCode: `const getPath = (startNode, endNode, gridMatrix) => { let openList = [startNode]; let closedList = []; while(openList.length > 0) { let current = findMinFScore(openList); if(current === endNode) return buildPath(current); openList.splice(openList.indexOf(current), 1); closedList.push(current); for(let adj of current.neighbors) { if(closedList.includes(adj)) continue; // Calc scores
let gScore = current.g + getHeuristic(current, adj); } } }`,
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1400px" }}>
      {" "}
      {/* Header Info */}{" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bento-card p-4 mb-4 position-relative overflow-hidden">
        {" "}
        <div
          className="position-absolute rounded-circle pe-none"
          style={{
            top: 0,
            right: 0,
            width: "250px",
            height: "250px",
            background: "rgba(var(--danger-rgb), 0.2)",
            filter: "blur(100px)",
          }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", color: "var(--text)" }}
          >
            {" "}
            <Gavel className="text-danger" size={32} /> The Plagiarism
            Court{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)", maxWidth: "800px" }}
          >
            As a High-Karma student, you have been selected for jury duty.
            Review the flagged submission and cast your vote.
          </p>{" "}
        </div>{" "}
        <div
          className="position-relative z-1 d-flex gap-4 p-3 rounded-4"
          style={{
            background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {" "}
          <div>
            {" "}
            <div
              className="small fw-bold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Your Karma
            </div>{" "}
            <div
              className="h4 fw-bold mb-0"
              style={{ color: "var(--primary)" }}
            >
              8,450
            </div>{" "}
          </div>{" "}
          <div className="vr" style={{ background: "rgba(0,0,0,0.05)" }}></div>{" "}
          <div>
            {" "}
            <div
              className="small fw-bold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Jury Accuracy
            </div>{" "}
            <div
              className="h4 fw-bold mb-0"
              style={{ color: "var(--success)" }}
            >
              94%
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Case Details */}{" "}
      <div className="bento-card d-flex flex-column overflow-hidden p-0 mb-4">
        {" "}
        <div
          className="d-flex justify-content-between align-items-center p-3"
          style={{
            background: "rgba(var(--danger-rgb), 0.1)",
            borderBottom: "1px solid rgba(var(--danger-rgb), 0.2)",
          }}
        >
          {" "}
          <div
            className="d-flex align-items-center gap-2 fw-bold"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <AlertTriangle className="text-danger" size={20} />{" "}
            {activeCase.id}{" "}
          </div>{" "}
          <div
            className="badge rounded-pill px-3 py-2 fw-bold"
            style={{
              background: "rgba(var(--danger-rgb), 0.2)",
              color: "var(--danger)",
              border: "1px solid rgba(var(--danger-rgb), 0.3)",
            }}
          >
            {" "}
            {activeCase.similarityScore}% AI Similarity Match{" "}
          </div>{" "}
        </div>{" "}
        {/* Diff Viewer */}{" "}
        <div className="row g-0">
          {" "}
          {/* Original Source */}{" "}
          <div
            className="col-12 col-md-6 d-flex flex-column border-md-end"
            style={{ borderColor: "rgba(0,0,0,0.05)", height: "500px" }}
          >
            {" "}
            <div
              className="d-flex align-items-center gap-2 p-3 small font-monospace"
              style={{
                background: "rgba(0,0,0,0.02)",
                color: "var(--text-secondary)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {" "}
              <FileCode size={16} className="text-muted" /> Original Source
              (StackOverflow / AutoGrader){" "}
            </div>{" "}
            <div
              className="flex-grow-1 p-3 overflow-auto"
              style={{ background: "var(--bg-light)" }}
            >
              {" "}
              <pre
                className="small font-monospace mb-0"
                style={{ color: "var(--text-secondary)" }}
              >
                {" "}
                <code>{activeCase.originalCode}</code>{" "}
              </pre>{" "}
            </div>{" "}
          </div>{" "}
          {/* Submitted Code */}{" "}
          <div className="p-0 d-flex flex-column" style={{ height: "500px" }}>
            {" "}
            <div
              className="p-3 d-flex align-items-center gap-2 small font-monospace border-bottom"
              style={{
                background: "rgba(0,0,0,0.02)",
                color: "var(--text-secondary)",
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              {" "}
              <FileCode size={16} className="text-danger" /> Submitted by:{" "}
              {activeCase.defendant}{" "}
            </div>{" "}
            <div
              className="flex-grow-1 p-4 overflow-auto"
              style={{ background: "rgba(var(--danger-rgb), 0.05)" }}
            >
              {" "}
              <pre
                className="small font-monospace"
                style={{ color: "var(--text-secondary)" }}
              >
                {" "}
                <code>
                  {" "}
                  {/* Naive syntax highlighting for the diff effect */}{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{`const getPath = (startNode, endNode, gridMatrix) => {`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` let openList = [startNode];`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` let closedList = [];`}</span>{" "}
                  <span className="d-block text-muted">{` `}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` while(openList.length > 0) {`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` let current = findMinFScore(openList);`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` if(current === endNode) return buildPath(current);`}</span>{" "}
                  <span className="d-block text-muted">{` `}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` openList.splice(openList.indexOf(current), 1);`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` closedList.push(current);`}</span>{" "}
                  <span className="d-block text-muted">{` `}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` for(let adj of current.neighbors) {`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` if(closedList.includes(adj)) continue;`}</span>{" "}
                  <span className="d-block text-muted">{` // Calc scores`}</span>{" "}
                  <span
                    className="d-block text-danger"
                    style={{ background: "rgba(var(--danger-rgb), 0.1)" }}
                  >{` let gScore = current.g + getHeuristic(current, adj);`}</span>{" "}
                  <span className="d-block text-muted">{` }`}</span>{" "}
                  <span className="d-block text-muted">{` }`}</span>{" "}
                  <span className="d-block text-muted">{`}`}</span>{" "}
                </code>{" "}
              </pre>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div
          className="p-4 text-center border-top"
          style={{
            background: "rgba(0,0,0,0.02)",
            borderColor: "rgba(0,0,0,0.05)",
          }}
        >
          {" "}
          <h3 className="h5 fw-bold text-foreground mb-3">Cast Your Verdict</h3>{" "}
          <p
            className="small mb-4 mx-auto"
            style={{ color: "var(--text-secondary)", maxWidth: "600px" }}
          >
            Does this submission constitute plagiarism? Note that variable
            renaming and loop-structure changes without architectural difference
            strongly imply academic dishonesty.
          </p>{" "}
          {voted[activeCase?._id || "demo"] ? (
            <div
              className="badge px-4 py-3 fs-6 fw-bold"
              style={{
                background:
                  voted[activeCase?._id || "demo"] === "guilty"
                    ? "rgba(var(--danger-rgb),0.2)"
                    : "rgba(var(--success-rgb),0.2)",
                color:
                  voted[activeCase?._id || "demo"] === "guilty"
                    ? "var(--danger)"
                    : "var(--success)",
              }}
            >
              {" "}
              Verdict Cast:{" "}
              {voted[activeCase?._id || "demo"] === "guilty"
                ? "Guilty ⚖️"
                : "Not Guilty ✅"}{" "}
            </div>
          ) : (
            <div className="d-flex justify-content-center gap-3">
              {" "}
              <button
                onClick={() =>
                  handleVote(activeCase?._id || "demo", "not_guilty")
                }
                className="btn rounded-4 fw-bold d-flex align-items-center gap-2 px-4 py-2 hover-lift"
                style={{
                  background: "rgba(var(--success-rgb), 0.1)",
                  color: "var(--success)",
                  border: "1px solid rgba(var(--success-rgb), 0.2)",
                }}
              >
                {" "}
                <CheckCircle size={20} /> Acquit (Not Plagiarism){" "}
              </button>{" "}
              <button
                onClick={() => handleVote(activeCase?._id || "demo", "guilty")}
                className="btn rounded-4 fw-bold d-flex align-items-center gap-2 px-4 py-2 shadow-sm hover-lift"
                style={{
                  background: "var(--danger)",
                  color: "#fff",
                  border: "none",
                }}
              >
                {" "}
                <XCircle size={20} /> Convict (Deduct 500 Karma){" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
