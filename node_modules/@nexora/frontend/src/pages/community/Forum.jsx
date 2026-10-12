import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Award,
  Tag,
  Flame,
  Plus,
  Send,
  Clock,
  Sparkles,
  X,
  Share2,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { postService } from "../../services/api";
import Modal from "../../shared/components/Modal";

export default function Forum() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("trending"); // 'trending' | 'new' | 'top'
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newContent, setNewContent] = useState("");

  // Comment expand and reply state
  const [expandedComments, setExpandedComments] = useState({}); // postId -> boolean
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string
  const [commentingMap, setCommentingMap] = useState({}); // postId -> boolean
  const [votingMap, setVotingMap] = useState({}); // postId -> boolean

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await postService.getPosts();
      setPosts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load forum posts:", err);
      addToast("Failed to load forum discussions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      addToast("Please provide both a title and details for your discussion", "warning");
      return;
    }

    try {
      setSubmittingPost(true);
      const tagsArray = newTags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const res = await postService.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        tags: tagsArray.length > 0 ? tagsArray : ["General"]
      });

      const created = res.data?.data;
      if (created) {
        setPosts((prev) => [created, ...prev]);
      } else {
        await fetchPosts();
      }

      setNewTitle("");
      setNewTags("");
      setNewContent("");
      setIsModalOpen(false);
      addToast("Your discussion thread has been posted!", "success");
    } catch (err) {
      console.error("Error creating post:", err);
      addToast(err.response?.data?.message || "Failed to create post. Please try again.", "error");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (votingMap[postId]) return;

    const currentUserId = user?._id || user?.id;
    // Optimistic toggle
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;
        const likes = Array.isArray(post.likes) ? [...post.likes] : [];
        const userLikedIndex = likes.findIndex(
          (id) => String(id) === String(currentUserId)
        );

        if (userLikedIndex >= 0) {
          likes.splice(userLikedIndex, 1);
        } else if (currentUserId) {
          likes.push(currentUserId);
        }

        return { ...post, likes };
      })
    );

    try {
      setVotingMap((prev) => ({ ...prev, [postId]: true }));
      const res = await postService.toggleLike(postId);
      const isLiked = res.data?.isLiked;
      addToast(isLiked ? "Upvoted discussion 👍" : "Upvote removed", "info");
    } catch (err) {
      console.error("Error toggling like:", err);
      addToast("Could not update vote", "error");
      fetchPosts(); // Rollback on failure
    } finally {
      setVotingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      setCommentingMap((prev) => ({ ...prev, [postId]: true }));
      const res = await postService.addComment(postId, { content: text });
      const newComment = res.data?.data;

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== postId) return post;
          const comments = Array.isArray(post.comments) ? [...post.comments] : [];
          if (newComment) {
            comments.push(newComment);
          } else {
            comments.push({
              _id: Date.now().toString(),
              content: text,
              author: { name: user?.name || "You", role: user?.role || "Member" },
              createdAt: new Date().toISOString()
            });
          }
          return { ...post, comments };
        })
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      // Ensure comments section stays open to view new comment
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      addToast("Reply added to thread!", "success");
    } catch (err) {
      console.error("Error adding comment:", err);
      addToast(err.response?.data?.message || "Failed to add reply", "error");
    } finally {
      setCommentingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Extract all unique tags
  const popularTags = useMemo(() => {
    const tagCount = {};
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const clean = t.trim();
        if (clean) tagCount[clean] = (tagCount[clean] || 0) + 1;
      });
    });

    const fallbackDefaults = ["Interviews", "Alumni", "Resume", "SystemDesign", "Internships", "Career"];
    fallbackDefaults.forEach((t) => {
      if (!tagCount[t]) tagCount[t] = 1;
    });

    return ["All", ...Object.keys(tagCount).slice(0, 10)];
  }, [posts]);

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Tag filter
        if (selectedTag !== "All") {
          const hasTag = (post.tags || []).some(
            (t) => t.toLowerCase() === selectedTag.toLowerCase()
          );
          if (!hasTag) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title?.toLowerCase().includes(q);
          const matchContent = post.content?.toLowerCase().includes(q);
          const matchAuthor = (post.author?.name || post.author || "").toLowerCase().includes(q);
          const matchTags = (post.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchAuthor && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const likesA = Array.isArray(a.likes) ? a.likes.length : a.upvotes || 0;
        const likesB = Array.isArray(b.likes) ? b.likes.length : b.upvotes || 0;
        const commentsA = Array.isArray(a.comments) ? a.comments.length : a.commentsCount || 0;
        const commentsB = Array.isArray(b.comments) ? b.comments.length : b.commentsCount || 0;

        if (activeTab === "trending") {
          return likesB * 2 + commentsB - (likesA * 2 + commentsA);
        }
        if (activeTab === "top") {
          return likesB - likesA;
        }
        // 'new'
        const dateA = new Date(a.createdAt || a.time || 0).getTime();
        const dateB = new Date(b.createdAt || b.time || 0).getTime();
        return dateB - dateA;
      });
  }, [posts, activeTab, selectedTag, searchQuery]);

  const currentUserId = user?._id || user?.id;

  return (
    <div className="container-fluid py-2 space-y-4" style={{ maxWidth: "1280px" }}>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)", fontSize: "2rem", letterSpacing: "-0.02em" }}
          >
            <MessageSquare className="text-primary" size={32} /> Campus Forum
          </h2>
          <p className="fw-medium mb-0" style={{ color: "var(--text-secondary)" }}>
            Connect with peers and alumni: discuss interview experiences, tech stacks, and career milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 flex-shrink-0 text-white"
          style={{ background: "var(--primary)" }}
        >
          <Plus size={18} /> Create Discussion
        </button>
      </div>

      <div className="row g-4">
        {/* Main Feed Column */}
        <div className="col-lg-8 col-xl-9">
          {/* Controls Bar */}
          <div
            className="bento-card p-2 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4"
            style={{ background: "var(--surface)" }}
          >
            {/* Tabs */}
            <div className="d-flex gap-2">
              <button
                onClick={() => setActiveTab("trending")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${
                  activeTab === "trending" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "trending" ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
                  color: activeTab === "trending" ? "var(--primary)" : "var(--text-secondary)",
                  border: "none",
                }}
              >
                <Flame size={16} /> Trending
              </button>

              <button
                onClick={() => setActiveTab("new")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${
                  activeTab === "new" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "new" ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
                  color: activeTab === "new" ? "var(--primary)" : "var(--text-secondary)",
                  border: "none",
                }}
              >
                <Clock size={16} /> Newest
              </button>

              <button
                onClick={() => setActiveTab("top")}
                className={`btn rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-fast ${
                  activeTab === "top" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "top" ? "rgba(var(--primary-rgb), 0.15)" : "transparent",
                  color: activeTab === "top" ? "var(--primary)" : "var(--text-secondary)",
                  border: "none",
                }}
              >
                <TrendingUp size={16} /> Top Voted
              </button>
            </div>

            {/* Search Input */}
            <div className="position-relative w-100" style={{ maxWidth: "300px" }}>
              <Search
                className="position-absolute text-muted"
                size={16}
                style={{
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, authors..."
                className="form-control rounded-pill ps-5 py-2"
                style={{
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  background: "var(--surface-2, rgba(255,255,255,0.03))",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-link position-absolute p-0 text-muted"
                  style={{ right: "12px", top: "50%", transform: "translateY(-50%)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTag !== "All" && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="small text-muted">Filtered by topic:</span>
              <span
                className="badge rounded-pill d-flex align-items-center gap-1 px-3 py-2"
                style={{ background: "rgba(var(--primary-rgb), 0.15)", color: "var(--primary)" }}
              >
                <Tag size={12} /> #{selectedTag}
                <button
                  onClick={() => setSelectedTag("All")}
                  className="btn btn-link p-0 ms-1 text-primary border-0"
                  style={{ textDecoration: "none" }}
                >
                  <X size={12} />
                </button>
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bento-card p-5 text-center" style={{ background: "var(--surface)" }}>
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p className="text-muted fw-medium mb-0">Loading campus discussions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div
              className="bento-card p-5 text-center rounded-4"
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border)",
              }}
            >
              <MessageSquare size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="fw-bold mb-1" style={{ color: "var(--text)" }}>
                No discussions found
              </h5>
              <p className="text-muted small mb-4">
                {searchQuery || selectedTag !== "All"
                  ? "Try clearing your search query or topic filter."
                  : "Be the first to start a conversation in the campus community!"}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                  setIsModalOpen(true);
                }}
                className="btn btn-primary rounded-pill px-4 fw-bold"
              >
                Start a Discussion
              </button>
            </div>
          )}

          {/* Posts List */}
          {!loading && filteredPosts.length > 0 && (
            <div className="d-flex flex-column gap-3">
              {filteredPosts.map((post) => {
                const likesCount = Array.isArray(post.likes)
                  ? post.likes.length
                  : post.upvotes || 0;
                const isLikedByMe =
                  Array.isArray(post.likes) &&
                  currentUserId &&
                  post.likes.some((id) => String(id) === String(currentUserId));
                const commentsCount = Array.isArray(post.comments)
                  ? post.comments.length
                  : post.comments || 0;
                const isExpanded = !!expandedComments[post._id];
                const authorName = post.author?.name || (typeof post.author === "string" ? post.author : "Community Member");
                const authorRole = post.author?.role || post.authorRole || "Student";
                const isHot = likesCount >= 5 || commentsCount >= 5 || post.isTrending;

                return (
                  <div
                    key={post._id}
                    className="bento-card p-4 rounded-4 transition-all"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="d-flex gap-3 gap-md-4">
                      {/* Vote Column */}
                      <div className="d-flex flex-column align-items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleToggleLike(post._id)}
                          disabled={votingMap[post._id]}
                          className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center transition-fast"
                          title={isLikedByMe ? "Remove upvote" : "Upvote this discussion"}
                          style={{
                            background: isLikedByMe
                              ? "rgba(var(--primary-rgb), 0.2)"
                              : "var(--surface-2, rgba(0,0,0,0.05))",
                            color: isLikedByMe ? "var(--primary)" : "var(--text-secondary)",
                            border: isLikedByMe
                              ? "1px solid rgba(var(--primary-rgb), 0.4)"
                              : "1px solid transparent",
                          }}
                        >
                          <ThumbsUp size={18} fill={isLikedByMe ? "currentColor" : "none"} />
                        </button>
                        <span className="fw-bold small" style={{ color: "var(--text)" }}>
                          {likesCount}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow-1 overflow-hidden">
                        {/* Meta */}
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                          {isHot && (
                            <span
                              className="badge rounded-pill d-flex align-items-center gap-1 text-uppercase tracking-wider fw-bold"
                              style={{
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                fontSize: "0.68rem",
                              }}
                            >
                              <Flame size={12} /> Hot Thread
                            </span>
                          )}

                          <span className="small fw-medium text-muted">
                            Posted by{" "}
                            <span className="fw-bold text-foreground" style={{ color: "var(--text)" }}>
                              {authorName}
                            </span>{" "}
                            • <span className="badge bg-secondary bg-opacity-25 text-muted px-2 py-0.5 rounded-pill small">{authorRole}</span> •{" "}
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
                          </span>
                        </div>

                        {/* Title */}
                        <h5
                          className="fw-bold mb-2"
                          style={{
                            color: "var(--text)",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.35,
                          }}
                        >
                          {post.title}
                        </h5>

                        {/* Body */}
                        <p
                          className="text-muted small mb-3"
                          style={{
                            whiteSpace: "pre-line",
                            lineHeight: 1.6,
                          }}
                        >
                          {post.content}
                        </p>

                        {/* Tags & Action Bar */}
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top" style={{ borderColor: "var(--border)" }}>
                          <div className="d-flex gap-2 flex-wrap">
                            {(post.tags || []).map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className="badge rounded-pill fw-medium d-flex align-items-center gap-1 transition-fast border-0"
                                style={{
                                  background: "var(--surface-2, rgba(255,255,255,0.05))",
                                  color: "var(--text-secondary)",
                                  cursor: "pointer",
                                  padding: "6px 12px",
                                }}
                              >
                                <Tag size={11} /> {tag}
                              </button>
                            ))}
                          </div>

                          <div className="d-flex align-items-center gap-3">
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(window.location.href);
                                addToast("Thread link copied to clipboard!", "success");
                              }}
                              className="btn btn-sm d-flex align-items-center gap-1 text-muted border-0 bg-transparent p-0"
                              title="Share thread"
                            >
                              <Share2 size={15} />
                              <span className="small">Share</span>
                            </button>

                            <button
                              onClick={() => toggleComments(post._id)}
                              className="btn btn-sm d-flex align-items-center gap-1 fw-bold border-0 bg-transparent p-0"
                              style={{ color: isExpanded ? "var(--primary)" : "var(--text-secondary)" }}
                            >
                              <MessageSquare size={16} />
                              <span>{commentsCount} {commentsCount === 1 ? "Reply" : "Replies"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable Comments Section */}
                        {isExpanded && (
                          <div
                            className="mt-4 pt-3 border-top"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <h6 className="fw-bold mb-3 small" style={{ color: "var(--text)" }}>
                              Replies & Discussion ({commentsCount})
                            </h6>

                            {/* Comment List */}
                            <div className="d-flex flex-column gap-3 mb-3">
                              {Array.isArray(post.comments) && post.comments.length > 0 ? (
                                post.comments.map((comment, cIdx) => {
                                  const cAuthor = comment.author?.name || "Community Member";
                                  const cRole = comment.author?.role || "Student";
                                  const cTime = comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Recently";

                                  return (
                                    <div
                                      key={comment._id || cIdx}
                                      className="p-3 rounded-3"
                                      style={{
                                        background: "var(--surface-2, rgba(255,255,255,0.03))",
                                        border: "1px solid var(--border)",
                                      }}
                                    >
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <div className="d-flex align-items-center gap-2">
                                          <span className="fw-bold small" style={{ color: "var(--text)" }}>
                                            {cAuthor}
                                          </span>
                                          <span className="badge bg-secondary bg-opacity-25 text-muted small py-0.5">
                                            {cRole}
                                          </span>
                                        </div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                          {cTime}
                                        </span>
                                      </div>
                                      <p className="mb-0 small" style={{ color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                                        {comment.content}
                                      </p>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted small fst-italic mb-0">
                                  No replies yet. Share your thoughts below!
                                </p>
                              )}
                            </div>

                            {/* Reply Form */}
                            <div className="d-flex gap-2 align-items-center">
                              <input
                                type="text"
                                value={commentInputs[post._id] || ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                                placeholder="Write a constructive reply..."
                                className="form-control form-control-sm rounded-pill px-3 py-2"
                                style={{
                                  background: "var(--surface-2, rgba(255,255,255,0.05))",
                                  borderColor: "var(--border)",
                                  color: "var(--text)",
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={
                                  commentingMap[post._id] || !commentInputs[post._id]?.trim()
                                }
                                className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1 fw-bold flex-shrink-0"
                              >
                                {commentingMap[post._id] ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <>
                                    <Send size={14} /> Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="col-lg-4 col-xl-3 d-flex flex-column gap-4">
          {/* Popular Topics / Tags */}
          <div
            className="bento-card p-4 rounded-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <Tag size={18} className="text-primary" />
              <h6 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                Popular Topics
              </h6>
            </div>
            <p className="small text-muted mb-3">
              Filter campus conversations by topic of interest:
            </p>
            <div className="d-flex flex-wrap gap-2">
              {popularTags.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="badge rounded-pill fw-medium transition-fast border-0 text-decoration-none"
                    style={{
                      background: isSelected
                        ? "var(--primary)"
                        : "var(--surface-2, rgba(255,255,255,0.05))",
                      color: isSelected ? "#fff" : "var(--text-secondary)",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Guidelines */}
          <div
            className="bento-card p-4 rounded-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <Sparkles size={18} className="text-warning" />
              <h6 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                Community Guidelines
              </h6>
            </div>
            <ul className="small text-muted space-y-2 ps-3 mb-0" style={{ lineHeight: 1.6 }}>
              <li>Be respectful and supportive of peers & alumni.</li>
              <li>Share honest interview and recruiting experiences.</li>
              <li>Avoid disclosing non-disclosure agreement (NDA) details.</li>
              <li>Keep topics relevant to campus, careers, and engineering.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start a New Campus Discussion"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
              Discussion Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Tips for Google SWE Intern behavioral interview?"
              className="form-control"
              style={{
                background: "var(--surface-2, rgba(255,255,255,0.05))",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
          </div>

          <div>
            <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g. Interviews, Google, Internships, Behavioral"
              className="form-control"
              style={{
                background: "var(--surface-2, rgba(255,255,255,0.05))",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            <div className="form-text small text-muted">
              Add keywords so other students and alumni can discover this topic.
            </div>
          </div>

          <div>
            <label className="form-label small fw-bold" style={{ color: "var(--text)" }}>
              Discussion Content *
            </label>
            <textarea
              required
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share context, questions, or helpful takeaways..."
              className="form-control resize-none"
              style={{
                background: "var(--surface-2, rgba(255,255,255,0.05))",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPost}
              className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2"
            >
              {submittingPost ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span> Posting...
                </>
              ) : (
                <>
                  <Send size={16} /> Post Discussion
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
