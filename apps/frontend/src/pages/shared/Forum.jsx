import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { communityService } from "../../services/api.js";
import { io } from "socket.io-client";
const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
const Forum = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]); // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  useEffect(() => {
    fetchPosts(); // WebSocket Real-time Connection
    const socket = io(SOCKET_URL);
    socket.on("new_post", (post) => {
      setPosts((prev) => [post, ...prev]);
    });
    socket.on("post_liked", ({ postId, likesCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: Array(likesCount).fill("placeholder") }
            : p,
        ),
      );
    });
    socket.on("new_comment", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p,
        ),
      );
    });
    return () => socket.disconnect();
  }, []);
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPosts();
      setPosts(res.data.data || []);
    } catch (err) {
      addToast("Failed to load discussions", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    try {
      const tagsArray = newPost.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await communityService.createPost({ ...newPost, tags: tagsArray });
      addToast("Discussion posted to the campus network!", "success");
      setShowModal(false);
      setNewPost({ title: "", content: "", tags: "" }); // The socket will push the new post to us, no need to refetch
    } catch (err) {
      addToast("Failed to post discussion", "error");
    }
  };
  const handleLike = async (postId) => {
    try {
      // Optimistic UI update
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const isLiked = p.likes?.includes(user?.id);
            const newLikes = isLiked
              ? p.likes.filter((id) => id !== user?.id)
              : [...(p.likes || []), user?.id];
            return { ...p, likes: newLikes };
          }
          return p;
        }),
      );
      await communityService.toggleLike(postId);
    } catch (err) {
      addToast("Action failed", "error");
    }
  };
  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.content?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  if (loading)
    return (
      <div className="p-5 text-center">
        <span className="spinner-border text-primary" />
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3"
      >
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-3"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <MessageSquare size={32} className="text-primary" /> Campus
            Forum{" "}
          </h2>{" "}
          <p className="text-muted fw-medium m-0">
            Discuss, ask questions, and share knowledge in real-time.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-primary rounded-pill fw-bold px-4 d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          {" "}
          <Plus size={18} /> New Discussion{" "}
        </button>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-lg-3">
          {" "}
          <div className="bento-card p-4 mb-4">
            {" "}
            <h6 className="fw-bold mb-3">Categories</h6>{" "}
            <div className="d-flex flex-column gap-2">
              {" "}
              {[
                "Live Feed",
                "General",
                "Academics",
                "Career",
                "Projects",
                "Events",
              ].map((cat) => (
                <button
                  onClick={() => addToast("Filter by category: " + cat, "info")}
                  key={cat}
                  className={`btn text-start rounded-3 px-3 py-2 fw-semibold ${cat === "Live Feed" ? "bg-primary-subtle text-primary" : "btn-outline-secondary border-0 text-muted hover-bg"}`}
                >
                  {" "}
                  {cat === "Live Feed" ? (
                    <span className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-danger animate-pulse"
                        style={{ width: 8, height: 8 }}
                      ></div>{" "}
                      {cat}
                    </span>
                  ) : (
                    cat
                  )}{" "}
                </button>
              ))}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="col-lg-9">
          {" "}
          <div className="position-relative mb-4">
            {" "}
            <Search
              size={18}
              className="position-absolute top-50 translate-middle-y ms-3 text-muted"
            />{" "}
            <input
              type="text"
              className="form-control form-control-lg rounded-pill ps-5 border"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ color: "var(--text)" }}
            />{" "}
          </div>{" "}
          <div className="d-flex flex-column gap-3">
            {" "}
            <AnimatePresence>
              {" "}
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post._id || idx}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bento-card p-4 hover-glow transition-fast cursor-pointer position-relative"
                >
                  {" "}
                  <div className="d-flex align-items-start gap-3 mb-3">
                    {" "}
                    <img
                      src={
                        post.author?.avatar ||
                        `https://ui-avatars.com/api/?name=${post.author?.name || "User"}`
                      }
                      alt="avatar"
                      className="rounded-circle"
                      width={40}
                      height={40}
                    />{" "}
                    <div>
                      {" "}
                      <h6 className="fw-bold mb-0">
                        {post.author?.name || "Anonymous User"}
                      </h6>{" "}
                      <small className="text-muted">
                        {new Date(
                          post.createdAt || Date.now(),
                        ).toLocaleTimeString()}{" "}
                        •{" "}
                        {new Date(
                          post.createdAt || Date.now(),
                        ).toLocaleDateString()}
                      </small>{" "}
                    </div>{" "}
                  </div>{" "}
                  <h5 className="fw-bold mb-2">{post.title}</h5>{" "}
                  <p className="text-muted mb-3 lh-base">{post.content}</p>{" "}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {" "}
                    {post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="badge bg-light border text-muted rounded-pill px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}{" "}
                  </div>{" "}
                  <div className="d-flex gap-4 pt-3 border-top border">
                    {" "}
                    <button
                      className="btn btn-sm btn-link text-muted text-decoration-none p-0 d-flex align-items-center gap-2 hover-text-primary"
                      onClick={() => handleLike(post._id)}
                    >
                      {" "}
                      <ThumbsUp
                        size={16}
                        className={
                          post.likes?.includes(user?.id) ? "text-primary" : ""
                        }
                      />{" "}
                      <span className="fw-bold">
                        {post.likes?.length || 0}
                      </span>{" "}
                    </button>{" "}
                    <button
                      onClick={() => addToast("View comments", "info")}
                      className="btn btn-sm btn-link text-muted text-decoration-none p-0 d-flex align-items-center gap-2 hover-text-primary"
                    >
                      {" "}
                      <MessageCircle size={16} />{" "}
                      <span className="fw-bold">
                        {post.comments?.length || 0}
                      </span>{" "}
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-link text-muted text-decoration-none p-0 d-flex align-items-center gap-2 hover-text-primary ms-auto"
                      onClick={() =>
                        addToast("Link copied to clipboard!", "info")
                      }
                    >
                      {" "}
                      <Share2 size={16} /> Share{" "}
                    </button>{" "}
                  </div>{" "}
                </motion.div>
              ))}{" "}
            </AnimatePresence>{" "}
            {filteredPosts.length === 0 && (
              <div className="text-center p-5 text-muted fw-bold bento-card ">
                {" "}
                <MessageSquare size={48} className="mb-3 opacity-50" />{" "}
                <p>No discussions found.</p>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* New Post Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showModal && (
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
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bento-card bg-card p-0 overflow-hidden"
              style={{ width: "90%", maxWidth: "600px" }}
            >
              {" "}
              <div className="bg-light p-4 border-bottom d-flex justify-content-between align-items-center">
                {" "}
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Plus className="text-primary" /> Create New Discussion
                </h5>{" "}
                <button
                  className="btn btn-sm btn-light rounded-circle p-2"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>{" "}
              </div>{" "}
              <form onSubmit={handleCreatePost} className="p-4">
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="fw-bold mb-1">Title</label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What do you want to ask or share?"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    required
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="fw-bold mb-1">Content</label>{" "}
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Elaborate on your topic..."
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    required
                  ></textarea>{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="fw-bold mb-1">
                    Tags (Comma Separated)
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Frontend, Networking, Help"
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost({ ...newPost, tags: e.target.value })
                    }
                  />{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    Post Discussion
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </motion.div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default Forum;
