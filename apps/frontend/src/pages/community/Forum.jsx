import React, { useState } from "react";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Award,
  Tag,
  Flame,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import Modal from "../../shared/components/Modal";
export default function Forum() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("trending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { communityService } = await import("../../services/api");
        const res = await communityService.getPosts();
        setPosts(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, []);
  const handleCreatePost = (e) => {
    e.preventDefault();
    setIsModalOpen(false);
    addToast("Your discussion thread has been posted!", "success");
  };
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1200px" }}>
      {" "}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)", fontSize: "2rem" }}
          >
            {" "}
            <MessageSquare className="text-primary" size={32} /> Campus
            Forum{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Discuss academics, interviews, and campus life.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn rounded-pill px-4 fw-bold shadow-sm hover-lift flex-shrink-0"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          {" "}
          Create Post{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Main Feed */}{" "}
        <div className="col-lg-9 space-y-4">
          {" "}
          {/* Controls */}{" "}
          <div className="bento-card p-2 d-flex align-items-center justify-content-between mb-4">
            {" "}
            <div className="d-flex gap-2">
              {" "}
              <button
                onClick={() => setActiveTab("trending")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${activeTab === "trending" ? "shadow-sm" : ""}`}
                style={{
                  background:
                    activeTab === "trending"
                      ? "rgba(var(--primary-rgb), 0.1)"
                      : "transparent",
                  color:
                    activeTab === "trending"
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
              >
                {" "}
                <Flame size={16} /> Trending{" "}
              </button>{" "}
              <button
                onClick={() => setActiveTab("new")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${activeTab === "new" ? "shadow-sm" : ""}`}
                style={{
                  background:
                    activeTab === "new"
                      ? "rgba(var(--primary-rgb), 0.1)"
                      : "transparent",
                  color:
                    activeTab === "new"
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
              >
                {" "}
                New{" "}
              </button>{" "}
              <button
                onClick={() => setActiveTab("top")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${activeTab === "top" ? "shadow-sm" : ""}`}
                style={{
                  background:
                    activeTab === "top"
                      ? "rgba(var(--primary-rgb), 0.1)"
                      : "transparent",
                  color:
                    activeTab === "top"
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
              >
                {" "}
                Top{" "}
              </button>{" "}
            </div>{" "}
            <div
              className="position-relative d-none d-md-block"
              style={{ width: "250px" }}
            >
              {" "}
              <Search
                className="position-absolute text-muted"
                size={16}
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />{" "}
              <input
                type="text"
                placeholder="Search discussions..."
                className="form-control bg-transparent rounded-pill ps-5"
                style={{ color: "var(--text)", borderColor: "var(--border)" }}
              />{" "}
            </div>{" "}
          </div>{" "}
          {/* Posts list */}{" "}
          <div className="d-flex flex-column gap-3">
            {" "}
            {posts.map((post) => (
              <div
                key={post._id || post.id}
                className="bento-card p-4 d-flex gap-4 hover-lift hover-glow cursor-pointer"
              >
                {" "}
                {/* Voting Column */}{" "}
                <div className="d-flex flex-column align-items-center gap-2 flex-shrink-0">
                  {" "}
                  <button
                    onClick={() => addToast("Upvoted! 👍", "success")}
                    className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center transition-fast"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      color: "var(--text-secondary)",
                      border: "none",
                    }}
                  >
                    {" "}
                    <ThumbsUp size={18} />{" "}
                  </button>{" "}
                  <span className="fw-bold" style={{ color: "var(--text)" }}>
                    {post.upvotes}
                  </span>{" "}
                  <button
                    onClick={() => addToast("Downvoted.", "info")}
                    className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center transition-fast"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      color: "var(--text-secondary)",
                      border: "none",
                    }}
                  >
                    {" "}
                    <ThumbsDown size={18} />{" "}
                  </button>{" "}
                </div>{" "}
                {/* Content */}{" "}
                <div className="flex-grow-1 text-truncate">
                  {" "}
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {" "}
                    {post.isTrending && (
                      <span
                        className="badge rounded-pill d-flex align-items-center gap-1 text-uppercase tracking-wider"
                        style={{
                          background: "rgba(var(--danger-rgb), 0.1)",
                          color: "var(--danger)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {" "}
                        <Flame size={12} /> Hot{" "}
                      </span>
                    )}{" "}
                    <span className="small fw-medium text-muted">
                      Posted by <span className="text-foreground">{post.author}</span>{" "}
                      • {post.authorRole} • {post.time}
                    </span>{" "}
                  </div>{" "}
                  <h5 className="fw-bold text-foreground mb-2 cursor-pointer transition-fast hover-text-primary">
                    {" "}
                    {post.title}{" "}
                  </h5>{" "}
                  <p className="small text-muted mb-4 line-clamp-2">
                    {" "}
                    {post.content}{" "}
                  </p>{" "}
                  <div className="d-flex align-items-center justify-content-between">
                    {" "}
                    <div className="d-flex gap-2 flex-wrap">
                      {" "}
                      {(post.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="badge rounded-pill fw-medium d-flex align-items-center gap-1 cursor-pointer transition-fast"
                          style={{
                            background: "rgba(0,0,0,0.05)",
                            color: "var(--text-secondary)",
                            border: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          {" "}
                          <Tag size={10} /> {tag}{" "}
                        </span>
                      ))}{" "}
                    </div>{" "}
                    <button
                      onClick={() =>
                        addToast(
                          `Opening ${post.comments} comments on "${post.title?.substring(0, 30)}..."`,
                          "info",
                        )
                      }
                      className="btn btn-sm d-flex align-items-center gap-2 fw-medium text-muted transition-fast hover-text-foreground p-0 border-0 bg-transparent"
                    >
                      {" "}
                      <MessageSquare size={16} /> {post.comments} Comments{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
        {/* Sidebar */}
        <div className="d-flex flex-column gap-4">
          <div className="bento-card p-4 rounded-4 text-center text-muted">
             <Filter size={32} className="mb-3 opacity-25" />
             <h6 className="fw-bold">Popular Topics</h6>
             <p className="small">Loading trending tags...</p>
          </div>
          
          <div className="bento-card p-4 rounded-4 text-center text-muted">
             <Award size={32} className="mb-3 opacity-25" />
             <h6 className="fw-bold">Top Contributors</h6>
             <p className="small">Loading leaderboard...</p>
          </div>
        </div>
      </div>{" "}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Discussion"
      >
        {" "}
        <form onSubmit={handleCreatePost} className="space-y-4 text-body">
          {" "}
          <div>
            {" "}
            <label
              className="form-label small fw-medium"
              style={{ color: "var(--text)" }}
            >
              Title
            </label>{" "}
            <input
              type="text"
              required
              placeholder="What do you want to discuss?"
              className="form-control text-foreground border shadow-none"
              style={{ background: "rgba(0,0,0,0.02)" }}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label
              className="form-label small fw-medium"
              style={{ color: "var(--text)" }}
            >
              Tags (comma separated)
            </label>{" "}
            <input
              type="text"
              placeholder="e.g. Internships, FAANG, Resume"
              className="form-control text-foreground border shadow-none"
              style={{ background: "rgba(0,0,0,0.02)" }}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label
              className="form-label small fw-medium"
              style={{ color: "var(--text)" }}
            >
              Content
            </label>{" "}
            <textarea
              required
              rows="6"
              placeholder="Provide details..."
              className="form-control text-foreground border shadow-none resize-none"
              style={{ background: "rgba(0,0,0,0.02)" }}
            ></textarea>{" "}
          </div>{" "}
          <div className="flex justify-content-end gap-3 pt-4">
            {" "}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-muted hover:text-foreground transition-fast"
            >
              {" "}
              Cancel{" "}
            </button>{" "}
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-foreground px-6 py-2 rounded-3 fw-medium shadow-lg shadow-primary/20 transition-fast"
            >
              {" "}
              Post Discussion{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </Modal>{" "}
    </div>
  );
}
