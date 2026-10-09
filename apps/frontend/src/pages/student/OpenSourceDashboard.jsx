import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { opensourceService } from "../../services/api.js";
import {
  GitBranch,
  GitPullRequest,
  GitMerge,
  Award,
  RefreshCcw,
  Zap,
  Target,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const OpenSourceDashboard = () => {
  const { addToast } = useToast();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await opensourceService.getLeaderboard();
      setLeaderboard(res.data.data || []);
    } catch (err) {
      addToast("Failed to load leaderboard", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSync = async (e) => {
    e.preventDefault();
    try {
      setSyncing(true);
      await opensourceService.syncGithub({ githubUsername });
      addToast("GitHub synced successfully! PRs tracked.", "success");
      setShowSyncModal(false);
      fetchLeaderboard();
    } catch (err) {
      addToast("Failed to sync GitHub", "error");
    } finally {
      setSyncing(false);
    }
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Open-Source Fellowship <GitBranch size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Link your GitHub and earn Campus Credits for every PR merged into a
            major repository.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowSyncModal(true)}
        >
          {" "}
          <RefreshCcw size={20} className={syncing ? "spin" : ""} /> Sync
          GitHub{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Top 3 Podium MVP */}{" "}
        <div className="col-12 mb-4">
          {" "}
          <div className="bento-card p-5 bg-card text-foreground text-center position-relative overflow-hidden">
            {" "}
            <div className="position-absolute top-50 start-50 translate-middle opacity-10">
              {" "}
              <GitBranch size={200} />{" "}
            </div>{" "}
            <h3 className="fw-black mb-4 position-relative z-1 text-warning">
              Global Campus OS Leaderboard
            </h3>{" "}
            <div
              className="d-flex justify-content-center align-items-end gap-3 position-relative z-1"
              style={{ height: "200px" }}
            >
              {" "}
              {leaderboard[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary bg-opacity-25 rounded-top border border-bottom-0 border p-3 d-flex flex-column align-items-center justify-content-end"
                  style={{ width: "120px", height: "140px" }}
                >
                  {" "}
                  <div className="badge bg-light text-foreground rounded-circle mb-2 fs-5 px-3 py-2">
                    2
                  </div>{" "}
                  <div className="fw-bold fs-5 text-truncate w-100">
                    {leaderboard[1].student.name.split(" ")[0]}
                  </div>{" "}
                  <div className="small text-foreground-50">
                    {leaderboard[1].mergedPRs} PRs
                  </div>{" "}
                </motion.div>
              )}{" "}
              {leaderboard[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-warning bg-opacity-25 rounded-top border border-bottom-0 border-warning p-3 d-flex flex-column align-items-center justify-content-end"
                  style={{ width: "140px", height: "180px" }}
                >
                  {" "}
                  <div className="position-absolute top-0 start-50 translate-middle mt-2">
                    {" "}
                    <Award
                      size={48}
                      className="text-warning fill-warning"
                    />{" "}
                  </div>{" "}
                  <div className="badge bg-warning text-foreground rounded-circle mb-2 fs-4 px-3 py-2">
                    1
                  </div>{" "}
                  <div className="fw-black fs-4 text-warning text-truncate w-100">
                    {leaderboard[0].student.name.split(" ")[0]}
                  </div>{" "}
                  <div className="small text-warning-emphasis fw-bold">
                    {leaderboard[0].mergedPRs} PRs
                  </div>{" "}
                </motion.div>
              )}{" "}
              {leaderboard[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-secondary bg-opacity-25 rounded-top border border-bottom-0 border p-3 d-flex flex-column align-items-center justify-content-end"
                  style={{ width: "120px", height: "120px" }}
                >
                  {" "}
                  <div className="badge bg-light text-foreground rounded-circle mb-2 fs-5 px-3 py-2">
                    3
                  </div>{" "}
                  <div className="fw-bold fs-5 text-truncate w-100">
                    {leaderboard[2].student.name.split(" ")[0]}
                  </div>{" "}
                  <div className="small text-foreground-50">
                    {leaderboard[2].mergedPRs} PRs
                  </div>{" "}
                </motion.div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Leaderboard List */}{" "}
        <div className="col-12">
          {" "}
          <div className="bento-card bg-card p-4">
            {" "}
            <h5 className="fw-black mb-4">All Contributors</h5>{" "}
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Rank</th> <th>Student</th> <th>GitHub</th><th>Merged PRs</th> <th>Top Repos</th><th>Recent Commit</th> <th>Credits Earned</th></tr></thead>
                <tbody>
                  {leaderboard.map((item, index) => (
                    <tr key={item._id}>
                      <td className="fw-bold text-muted">#{index + 1}</td><td className="fw-bold">{item.student.name}</td><td>
                        
                        <a
                          href={`https://github.com/${item.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-decoration-none d-flex align-items-center gap-1"
                        >
                          {" "}
                          <GitBranch size={14} /> {item.githubUsername}{" "}
                        </a>
                      </td><td>
                        
                        <div
                          className="badge bg-success bg-opacity-10 text-success border border-success-subtle d-flex align-items-center gap-1 w-auto"
                          style={{ width: "fit-content" }}
                        >
                          {" "}
                          <GitMerge size={14} /> {item.mergedPRs}{" "}
                        </div>
                      </td><td>
                        
                        <div className="d-flex flex-wrap gap-1">
                          {" "}
                          {item.topRepositories?.map((repo) => (
                            <span key={repo} className="badge bg-light small">
                              {repo}
                            </span>
                          ))}{" "}
                        </div>
                      </td><td>
                        
                        {item.recentCommits?.length > 0 ? (
                          <div
                            className="small text-muted text-truncate"
                            style={{ maxWidth: "200px" }}
                          >
                            {" "}
                            <GitPullRequest size={12} />{" "}
                            {item.recentCommits[0].message}{" "}
                          </div>
                        ) : (
                          <span className="small text-muted fst-italic">
                            No recent commits
                          </span>
                        )}
                      </td><td className="fw-black text-warning d-flex align-items-center gap-1">
                        
                        <Zap size={16} /> {item.campusCreditsEarned}
                      </td></tr>
                  ))}</tbody></table>
              {leaderboard.length === 0 && (
                <div className="text-center text-muted p-4">
                  No open-source tracking data available.
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Sync Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showSyncModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-blur"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.02)",
              zIndex: 1050,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3">
                  {" "}
                  <GitBranch size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Link GitHub</h4>{" "}
                <p className="text-muted small">
                  We'll fetch your merged PRs via webhooks.
                </p>{" "}
              </div>{" "}
              <form onSubmit={handleSync}>
                {" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    GitHub Username
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. torvalds"
                    disabled={syncing}
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowSyncModal(false)}
                    disabled={syncing}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                    disabled={syncing}
                  >
                    {" "}
                    {syncing ? "Syncing..." : "Link Account"}{" "}
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default OpenSourceDashboard;
