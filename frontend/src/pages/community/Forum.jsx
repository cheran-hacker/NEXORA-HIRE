import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Tag,
  Flame,
  Plus,
  Send,
  Clock,
  Sparkles,
  X,
  Share2,
  TrendingUp,
  CheckCircle2,
  Activity,
  Layers,
  ArrowUpRight,
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { postService } from "../../services/api";
import Modal from "../../shared/components/Modal";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const STANDARD_TOPICS = [
  "Career",
  "Interviews",
  "Academics",
  "Resume",
  "Projects",
  "Internships",
  "React",
  "Open Source",
  "System Design",
  "General"
];

export default function Forum() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("trending"); // 'trending' | 'new' | 'top'
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalDiscussions: 0,
    activeDiscussions: 0,
    totalReplies: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Career");
  const [newTags, setNewTags] = useState("");
  const [newContent, setNewContent] = useState("");

  // Comment expand and reply state
  const [expandedComments, setExpandedComments] = useState({}); // postId -> boolean
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string
  const [commentingMap, setCommentingMap] = useState({}); // postId -> boolean
  const [votingMap, setVotingMap] = useState({}); // postId -> boolean

  useEffect(() => {
    fetchPosts();
    fetchStats();

    const socket = io(SOCKET_URL);
    socket.on("new_post", (post) => {
      setPosts((prev) => {
        if (prev.some((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
      fetchStats();
    });

    socket.on("post_liked", ({ postId, likesCount }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: Array(likesCount).fill("placeholder") }
            : p
        )
      );
    });

    socket.on("new_comment", ({ postId, comment }) => {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const exists = (p.comments || []).some((c) => c._id === comment._id);
          if (exists) return p;
          return { ...p, comments: [...(p.comments || []), comment] };
        })
      );
      fetchStats();
    });

    return () => socket.disconnect();
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

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await postService.getStats();
      if (res?.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      // Fallback: calculate stats locally from posts
      console.warn("Using fallback local stats calculation:", err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  // Derive dynamic stats from current posts if API stats are not yet loaded
  const derivedStats = useMemo(() => {
    if (stats.totalDiscussions > 0) return stats;
    const totalDiscussions = posts.length;
    const activeDiscussions = posts.filter((p) => p.status !== "Hidden").length;
    let totalReplies = 0;
    let totalVotes = 0;
    posts.forEach((p) => {
      totalReplies += Array.isArray(p.comments) ? p.comments.length : p.comments || 0;
      totalVotes += Array.isArray(p.likes) ? p.likes.length : p.upvotes || 0;
    });
    return {
      totalDiscussions,
      activeDiscussions,
      totalReplies,
      totalVotes
    };
  }, [stats, posts]);

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

      if (newTopic && !tagsArray.includes(newTopic)) {
        tagsArray.unshift(newTopic);
      }

      const res = await postService.createPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        topic: newTopic,
        tags: tagsArray.length > 0 ? tagsArray : [newTopic || "General"]
      });

      const created = res.data?.data;
      if (created) {
        setPosts((prev) => [created, ...prev]);
      } else {
        await fetchPosts();
      }

      await fetchStats();

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
      fetchStats();
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
      setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      addToast("Reply added to thread!", "success");
      fetchStats();
    } catch (err) {
      console.error("Error adding comment:", err);
      addToast(err.response?.data?.message || "Failed to add reply", "error");
    } finally {
      setCommentingMap((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Tag frequency counts across all discussions
  const topicCounts = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        const clean = t.trim();
        if (clean) {
          const lower = clean.toLowerCase();
          map[lower] = (map[lower] || 0) + 1;
        }
      });
      if (p.topic) {
        const lower = p.topic.toLowerCase().trim();
        map[lower] = (map[lower] || 0) + 1;
      }
    });
    return map;
  }, [posts]);

  // Combined topic list
  const popularTopicsList = useMemo(() => {
    const combinedSet = new Set(STANDARD_TOPICS);
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        if (t && t.length < 20) combinedSet.add(t.trim());
      });
    });
    return Array.from(combinedSet);
  }, [posts]);

  // Filter & Sort
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Tag / Category filter
        if (selectedTag !== "All") {
          const sTag = selectedTag.toLowerCase();
          const hasTag = (post.tags || []).some((t) =>
            t.toLowerCase().includes(sTag)
          );
          const hasTopic = post.topic && post.topic.toLowerCase().includes(sTag);
          const matchTitleOrContent =
            post.title?.toLowerCase().includes(sTag) ||
            post.content?.toLowerCase().includes(sTag);
          if (!hasTag && !hasTopic && !matchTitleOrContent) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title?.toLowerCase().includes(q);
          const matchContent = post.content?.toLowerCase().includes(q);
          const matchAuthor = (post.author?.name || post.author || "")
            .toLowerCase()
            .includes(q);
          const matchTags = (post.tags || []).some((t) =>
            t.toLowerCase().includes(q)
          );
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

  // Highlights for Top Area: 2 highest engagement discussions
  const trendingHighlights = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const scoreA =
          (Array.isArray(a.likes) ? a.likes.length : 0) * 2 +
          (Array.isArray(a.comments) ? a.comments.length : 0);
        const scoreB =
          (Array.isArray(b.likes) ? b.likes.length : 0) * 2 +
          (Array.isArray(b.comments) ? b.comments.length : 0);
        return scoreB - scoreA;
      })
      .slice(0, 2);
  }, [posts]);

  const currentUserId = user?._id || user?.id;

  return (
    <div className="container-fluid py-3 px-xl-4" style={{ maxWidth: "1320px" }}>
      {/* ─── 1. Page Header ─── */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div>
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)", fontSize: "1.85rem", letterSpacing: "-0.02em" }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3 p-2"
              style={{ background: "rgba(99, 102, 241, 0.12)", color: "var(--primary, #6366f1)" }}
            >
              <MessageSquare size={24} strokeWidth={2.2} />
            </div>
            <span>Campus Forum</span>
          </h2>
          <p className="fw-medium text-muted small mb-0">
            Connect with peers and alumni: discuss interview experiences, tech stacks, and career milestones.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn rounded-pill px-4 py-2.5 fw-bold shadow-sm d-flex align-items-center gap-2 flex-shrink-0 text-white hover-lift"
          style={{
            background: "linear-gradient(135deg, var(--primary, #6366f1), var(--purple, #a855f7))",
            border: "none"
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Create Discussion</span>
        </button>
      </div>

      {/* ─── 2. Compact Statistics Row (MongoDB Real Data) ─── */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3">
          <div
            className="p-3 rounded-3 border d-flex align-items-center gap-3 transition-fast"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
              style={{
                width: "42px",
                height: "42px",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--primary, #6366f1)"
              }}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                Total Discussions
              </div>
              <h5 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.25rem" }}>
                {loadingStats ? "..." : derivedStats.totalDiscussions}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 rounded-3 border d-flex align-items-center gap-3 transition-fast"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
              style={{
                width: "42px",
                height: "42px",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--success, #10b981)"
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                Active Discussions
              </div>
              <h5 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.25rem" }}>
                {loadingStats ? "..." : derivedStats.activeDiscussions}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 rounded-3 border d-flex align-items-center gap-3 transition-fast"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
              style={{
                width: "42px",
                height: "42px",
                background: "rgba(6, 182, 212, 0.1)",
                color: "var(--info, #06b6d4)"
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                Total Replies
              </div>
              <h5 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.25rem" }}>
                {loadingStats ? "..." : derivedStats.totalReplies}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div
            className="p-3 rounded-3 border d-flex align-items-center gap-3 transition-fast"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-2"
              style={{
                width: "42px",
                height: "42px",
                background: "rgba(245, 158, 11, 0.1)",
                color: "var(--warning, #f59e0b)"
              }}
            >
              <ThumbsUp size={19} />
            </div>
            <div>
              <div className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                Total Votes
              </div>
              <h5 className="fw-black mb-0 text-foreground" style={{ fontSize: "1.25rem" }}>
                {loadingStats ? "..." : derivedStats.totalVotes}
              </h5>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Trending Highlights (Compact Carousel / Cards) ─── */}
      {trendingHighlights.length > 0 && !loading && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="small fw-bold text-muted text-uppercase d-flex align-items-center gap-1.5" style={{ fontSize: "0.72rem", letterSpacing: "0.05em" }}>
              <Flame size={14} className="text-danger" /> Trending Highlights
            </span>
            <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
              Most active campus topics
            </span>
          </div>

          <div className="row g-3">
            {trendingHighlights.map((hl) => {
              const likes = Array.isArray(hl.likes) ? hl.likes.length : hl.upvotes || 0;
              const replies = Array.isArray(hl.comments) ? hl.comments.length : hl.comments || 0;
              const author = hl.author?.name || (typeof hl.author === "string" ? hl.author : "Community Member");
              const role = hl.author?.role || hl.authorRole || "Student";

              return (
                <div key={`hl-${hl._id}`} className="col-md-6">
                  <div
                    onClick={() => {
                      setExpandedComments((prev) => ({ ...prev, [hl._id]: true }));
                      const el = document.getElementById(`post-${hl._id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="p-3 rounded-3 border cursor-pointer hover-glow transition-all"
                    style={{
                      background: "rgba(99, 102, 241, 0.03)",
                      borderColor: "rgba(99, 102, 241, 0.2)",
                      height: "100%"
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1.5">
                      <span className="badge rounded-pill bg-danger-subtle text-danger small fw-bold px-2 py-0.5" style={{ fontSize: "0.68rem" }}>
                        <Flame size={10} className="me-1 d-inline" /> Trending
                      </span>
                      <span className="text-muted small" style={{ fontSize: "0.72rem" }}>
                        {hl.createdAt ? new Date(hl.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recent"}
                      </span>
                    </div>

                    <h6 className="fw-bold text-foreground mb-1 text-truncate" style={{ fontSize: "0.92rem" }}>
                      {hl.title}
                    </h6>

                    <p
                      className="text-muted small mb-2"
                      style={{
                        fontSize: "0.78rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {hl.content}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                      <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: "0.74rem" }}>
                        <span className="fw-semibold text-foreground">{author}</span>
                        <span className="badge bg-secondary-subtle text-muted rounded-pill px-1.5 py-0.5" style={{ fontSize: "0.65rem" }}>
                          {role}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-3 small text-muted" style={{ fontSize: "0.75rem" }}>
                        <span className="d-flex align-items-center gap-1 text-primary fw-bold">
                          <ThumbsUp size={12} /> {likes}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <MessageSquare size={12} /> {replies}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 4. Main Two-Column Layout (Desktop Grid) ─── */}
      <div className="row g-4 align-items-start">
        {/* ─── Left Column: Main Discussion Feed ─── */}
        <div className="col-lg-8 col-xl-8">
          {/* Controls Bar: Compact height */}
          <div
            className="p-2.5 rounded-3 border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2.5 mb-3"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              height: "auto",
              minHeight: "0"
            }}
          >
            {/* Sorting Tabs */}
            <div className="d-flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("trending")}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 transition-fast ${
                  activeTab === "trending" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "trending"
                      ? "rgba(99, 102, 241, 0.15)"
                      : "transparent",
                  color:
                    activeTab === "trending"
                      ? "var(--primary, #6366f1)"
                      : "var(--text-secondary)",
                  border: "none",
                  fontSize: "0.82rem"
                }}
              >
                <Flame size={14} /> Trending
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 transition-fast ${
                  activeTab === "new" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "new"
                      ? "rgba(99, 102, 241, 0.15)"
                      : "transparent",
                  color:
                    activeTab === "new"
                      ? "var(--primary, #6366f1)"
                      : "var(--text-secondary)",
                  border: "none",
                  fontSize: "0.82rem"
                }}
              >
                <Clock size={14} /> Newest
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("top")}
                className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 transition-fast ${
                  activeTab === "top" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    activeTab === "top"
                      ? "rgba(99, 102, 241, 0.15)"
                      : "transparent",
                  color:
                    activeTab === "top"
                      ? "var(--primary, #6366f1)"
                      : "var(--text-secondary)",
                  border: "none",
                  fontSize: "0.82rem"
                }}
              >
                <TrendingUp size={14} /> Top Voted
              </button>
            </div>

            {/* Search Input */}
            <div className="position-relative w-100" style={{ maxWidth: "280px" }}>
              <Search
                className="position-absolute text-muted"
                size={14}
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, authors..."
                className="form-control form-control-sm rounded-pill ps-4 py-1.5"
                style={{
                  color: "var(--text)",
                  borderColor: "var(--border)",
                  background: "var(--bg-secondary)",
                  fontSize: "0.82rem"
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn btn-link position-absolute p-0 text-muted"
                  style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Active Tag Filter Indicator */}
          {selectedTag !== "All" && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="small text-muted" style={{ fontSize: "0.8rem" }}>Filtered by:</span>
              <span
                className="badge rounded-pill d-flex align-items-center gap-1 px-3 py-1.5 fw-semibold"
                style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "var(--primary, #6366f1)",
                  fontSize: "0.78rem"
                }}
              >
                <Tag size={12} /> #{selectedTag}
                <button
                  type="button"
                  onClick={() => setSelectedTag("All")}
                  className="btn btn-link p-0 ms-1 text-primary border-0"
                  style={{ textDecoration: "none" }}
                >
                  <X size={12} />
                </button>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag("All")}
                className="btn btn-link p-0 text-muted small text-decoration-none"
                style={{ fontSize: "0.78rem" }}
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-4 rounded-3 border text-center my-3" style={{ background: "var(--surface)" }}>
              <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
              <p className="text-muted fw-medium small mb-0">Loading campus discussions...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div
              className="p-5 text-center rounded-3 border my-3"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                borderStyle: "dashed"
              }}
            >
              <MessageSquare size={38} className="text-muted mb-2.5 opacity-30" />
              <h6 className="fw-bold mb-1 text-foreground">No discussions found</h6>
              <p className="text-muted small mb-3">
                {searchQuery || selectedTag !== "All"
                  ? "Try adjusting your search query or clearing topic filters."
                  : "Be the first to start a conversation in the NEXORA campus community!"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("All");
                  setIsModalOpen(true);
                }}
                className="btn btn-primary btn-sm rounded-pill px-3.5 py-1.5 fw-bold"
              >
                Start a Discussion
              </button>
            </div>
          )}

          {/* Posts Feed List */}
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
                const authorName =
                  post.author?.name ||
                  (typeof post.author === "string" ? post.author : "Community Member");
                const authorRole = post.author?.role || post.authorRole || "Student";
                const isHot = likesCount >= 5 || commentsCount >= 5 || post.isTrending;

                return (
                  <div
                    key={post._id}
                    id={`post-${post._id}`}
                    className="p-3.5 rounded-3 border transition-all"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)"
                    }}
                  >
                    <div className="d-flex gap-3">
                      {/* Vote Button Column */}
                      <div className="d-flex flex-column align-items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post._id)}
                          disabled={votingMap[post._id]}
                          className="btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center transition-fast"
                          title={isLikedByMe ? "Remove upvote" : "Upvote this discussion"}
                          style={{
                            background: isLikedByMe
                              ? "rgba(99, 102, 241, 0.15)"
                              : "var(--bg-secondary)",
                            color: isLikedByMe
                              ? "var(--primary, #6366f1)"
                              : "var(--text-secondary)",
                            border: isLikedByMe
                              ? "1px solid rgba(99, 102, 241, 0.3)"
                              : "1px solid transparent",
                            width: "36px",
                            height: "36px"
                          }}
                        >
                          <ThumbsUp size={16} fill={isLikedByMe ? "currentColor" : "none"} />
                        </button>
                        <span className="fw-bold small" style={{ fontSize: "0.8rem", color: "var(--text)" }}>
                          {likesCount}
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="flex-grow-1 overflow-hidden">
                        {/* Meta: Author & Date */}
                        <div className="d-flex align-items-center gap-2 mb-1.5">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 shadow-sm"
                            style={{
                              width: 28,
                              height: 28,
                              background: "linear-gradient(135deg, var(--primary, #6366f1), #7c3aed)",
                              fontSize: "0.75rem"
                            }}
                          >
                            {authorName ? authorName.charAt(0).toUpperCase() : "U"}
                          </div>

                          <div className="d-flex align-items-center flex-wrap gap-2">
                            {isHot && (
                              <span
                                className="badge rounded-pill d-flex align-items-center gap-1 fw-bold"
                                style={{
                                  background: "rgba(239, 68, 68, 0.15)",
                                  color: "#ef4444",
                                  fontSize: "0.68rem"
                                }}
                              >
                                <Flame size={11} /> Hot
                              </span>
                            )}

                            <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
                              Posted by{" "}
                              <strong className="text-foreground" style={{ color: "var(--text)" }}>
                                {authorName}
                              </strong>{" "}
                              •{" "}
                              <span
                                className={`badge rounded-pill px-2 py-0.5 small ${
                                  authorRole === "Alumni"
                                    ? "bg-purple-subtle text-purple border border-purple-subtle"
                                    : authorRole === "Placement"
                                    ? "bg-warning-subtle text-warning border border-warning-subtle"
                                    : "bg-secondary-subtle text-muted"
                                }`}
                                style={{ fontSize: "0.68rem" }}
                              >
                                {authorRole}
                              </span>{" "}
                              •{" "}
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric"
                                  })
                                : "Recently"}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h6
                          className="fw-bold mb-1.5 text-foreground cursor-pointer"
                          style={{
                            fontSize: "1.05rem",
                            lineHeight: 1.35
                          }}
                          onClick={() => toggleComments(post._id)}
                        >
                          {post.title}
                        </h6>

                        {/* Content Body */}
                        <p
                          className="text-muted small mb-2.5"
                          style={{
                            whiteSpace: "pre-line",
                            lineHeight: 1.5,
                            fontSize: "0.84rem"
                          }}
                        >
                          {post.content}
                        </p>

                        {/* Tags & Action Bar */}
                        <div
                          className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div className="d-flex gap-1.5 flex-wrap">
                            {(post.tags || []).map((tag) => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => setSelectedTag(tag)}
                                className="badge rounded-pill fw-medium d-flex align-items-center gap-1 transition-fast border-0"
                                style={{
                                  background: "var(--bg-secondary)",
                                  color: "var(--text-secondary)",
                                  cursor: "pointer",
                                  padding: "4px 9px",
                                  fontSize: "0.74rem"
                                }}
                              >
                                <Tag size={10} /> {tag}
                              </button>
                            ))}
                          </div>

                          <div className="d-flex align-items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(window.location.href);
                                addToast("Discussion link copied to clipboard!", "success");
                              }}
                              className="btn btn-sm d-flex align-items-center gap-1 text-muted border-0 bg-transparent p-0 small"
                              title="Share thread"
                            >
                              <Share2 size={14} />
                              <span style={{ fontSize: "0.78rem" }}>Share</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleComments(post._id)}
                              className="btn btn-sm d-flex align-items-center gap-1.5 fw-bold border-0 bg-transparent p-0"
                              style={{
                                color: isExpanded ? "var(--primary, #6366f1)" : "var(--text-secondary)",
                                fontSize: "0.82rem"
                              }}
                            >
                              <MessageSquare size={14} />
                              <span>
                                {commentsCount} {commentsCount === 1 ? "Reply" : "Replies"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable Comments / Replies Section */}
                        {isExpanded && (
                          <div
                            className="mt-3 pt-3 border-top"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <h6 className="fw-bold mb-2.5 small" style={{ color: "var(--text)", fontSize: "0.82rem" }}>
                              Replies & Discussion ({commentsCount})
                            </h6>

                            {/* Comment List */}
                            <div className="d-flex flex-column gap-2 mb-3">
                              {Array.isArray(post.comments) && post.comments.length > 0 ? (
                                post.comments.map((comment, cIdx) => {
                                  const cAuthor = comment.author?.name || "Community Member";
                                  const cRole = comment.author?.role || "Student";
                                  const cTime = comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })
                                    : "Recently";

                                  return (
                                    <div
                                      key={comment._id || cIdx}
                                      className="p-2.5 rounded-3 border"
                                      style={{
                                        background: "var(--bg-secondary)",
                                        borderColor: "var(--border)"
                                      }}
                                    >
                                      <div className="d-flex justify-content-between align-items-center mb-1">
                                        <div className="d-flex align-items-center gap-1.5">
                                          <div
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                            style={{
                                              width: 20,
                                              height: 20,
                                              background: "var(--primary, #6366f1)",
                                              fontSize: "0.65rem"
                                            }}
                                          >
                                            {cAuthor ? cAuthor.charAt(0).toUpperCase() : "U"}
                                          </div>
                                          <span className="fw-bold small" style={{ fontSize: "0.78rem", color: "var(--text)" }}>
                                            {cAuthor}
                                          </span>
                                          <span className="badge bg-secondary-subtle text-muted small py-0.5" style={{ fontSize: "0.65rem" }}>
                                            {cRole}
                                          </span>
                                        </div>
                                        <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                          {cTime}
                                        </span>
                                      </div>
                                      <p className="mb-0 small text-muted" style={{ fontSize: "0.8rem", whiteSpace: "pre-line" }}>
                                        {comment.content}
                                      </p>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted small fst-italic mb-0" style={{ fontSize: "0.78rem" }}>
                                  No replies yet. Share your thoughts below!
                                </p>
                              )}
                            </div>

                            {/* Reply Input Form */}
                            <div className="d-flex gap-2 align-items-center">
                              <input
                                type="text"
                                value={commentInputs[post._id] || ""}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                                placeholder="Write a constructive reply..."
                                className="form-control form-control-sm rounded-pill px-3 py-1.5"
                                style={{
                                  background: "var(--bg-secondary)",
                                  borderColor: "var(--border)",
                                  color: "var(--text)",
                                  fontSize: "0.8rem"
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddComment(post._id)}
                                disabled={
                                  commentingMap[post._id] || !commentInputs[post._id]?.trim()
                                }
                                className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1 fw-bold flex-shrink-0"
                                style={{ fontSize: "0.78rem" }}
                              >
                                {commentingMap[post._id] ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <>
                                    <Send size={13} /> Reply
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

        {/* ─── Right Column: Popular Topics & Guidelines ─── */}
        <div className="col-lg-4 col-xl-4 d-flex flex-column gap-3">
          {/* Popular Topics Panel */}
          <div
            className="p-3.5 rounded-3 border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              height: "auto",
              minHeight: "0"
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <Tag size={16} className="text-primary" />
                <h6 className="fw-bold mb-0 text-foreground" style={{ fontSize: "0.95rem" }}>
                  Popular Topics
                </h6>
              </div>
              {selectedTag !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedTag("All")}
                  className="btn btn-link p-0 text-primary small text-decoration-none fw-bold"
                  style={{ fontSize: "0.75rem" }}
                >
                  Reset
                </button>
              )}
            </div>

            <p className="small text-muted mb-2.5" style={{ fontSize: "0.78rem" }}>
              Filter campus conversations by topic:
            </p>

            {/* Topic Chips with Real Counts */}
            <div className="d-flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTag("All")}
                className={`badge rounded-pill fw-semibold transition-fast border-0 ${
                  selectedTag === "All" ? "shadow-sm" : ""
                }`}
                style={{
                  background:
                    selectedTag === "All"
                      ? "var(--primary, #6366f1)"
                      : "var(--bg-secondary)",
                  color: selectedTag === "All" ? "#fff" : "var(--text-secondary)",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "0.76rem"
                }}
              >
                All Topics ({posts.length})
              </button>

              {popularTopicsList.map((tag) => {
                const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                const count = topicCounts[tag.toLowerCase()] || 0;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className="badge rounded-pill fw-medium transition-fast border-0 d-flex align-items-center gap-1.5"
                    style={{
                      background: isSelected
                        ? "var(--primary, #6366f1)"
                        : "var(--bg-secondary)",
                      color: isSelected ? "#fff" : "var(--text-secondary)",
                      padding: "6px 11px",
                      cursor: "pointer",
                      fontSize: "0.76rem"
                    }}
                  >
                    <span>#{tag}</span>
                    {count > 0 && (
                      <span
                        className="rounded-circle px-1"
                        style={{
                          background: isSelected
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(0,0,0,0.08)",
                          fontSize: "0.68rem"
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Community Guidelines */}
          <div
            className="p-3.5 rounded-3 border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              height: "auto",
              minHeight: "0"
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <Sparkles size={16} className="text-warning" />
              <h6 className="fw-bold mb-0 text-foreground" style={{ fontSize: "0.95rem" }}>
                Community Guidelines
              </h6>
            </div>
            <ul className="small text-muted ps-3 mb-0" style={{ lineHeight: 1.55, fontSize: "0.78rem" }}>
              <li className="mb-1">Be respectful and supportive of peers & alumni.</li>
              <li className="mb-1">Share authentic interview and recruitment experiences.</li>
              <li className="mb-1">Avoid disclosing company non-disclosure agreement (NDA) details.</li>
              <li>Keep discussions constructive, relevant to engineering and career growth.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── 5. Create Discussion Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Start a New Campus Discussion"
        subtitle="Share technical insights, ask interview questions, or start career discussions"
        icon={MessageSquare}
      >
        <form onSubmit={handleCreatePost} className="d-flex flex-column gap-3">
          <div>
            <label className="nexora-form-label">
              Discussion Title <span className="nexora-form-req">*</span>
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Tips for Google SWE Intern behavioral interview?"
              className="nexora-form-input"
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="nexora-form-label">
                Primary Topic <span className="nexora-form-req">*</span>
              </label>
              <select
                className="nexora-form-select"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              >
                {STANDARD_TOPICS.map((top) => (
                  <option key={top} value={top}>
                    {top}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="nexora-form-label">
                Custom Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="e.g. Google, SystemDesign, Tips"
                className="nexora-form-input"
              />
            </div>
          </div>

          <div>
            <label className="nexora-form-label">
              Discussion Content <span className="nexora-form-req">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Share your context, questions, takeaways, or tips with fellow students and alumni..."
              className="nexora-form-textarea"
            />
          </div>

          <div className="d-flex align-items-center justify-content-between pt-3 mt-1 border-top" style={{ borderColor: "#f1f5f9" }}>
            <span className="nexora-modal-footer-hint d-none d-sm-inline">
              * Required fields must be completed
            </span>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="nexora-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPost}
                className="nexora-modal-btn-primary"
              >
                {submittingPost ? (
                  <>
                    <span className="spinner-border spinner-border-sm" /> Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Post Discussion
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
