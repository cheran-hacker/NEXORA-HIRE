import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { reelService } from "../../services/api.js";
import { Video, Heart, Share2, MessageCircle, Play, Plus } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const CampusReels = () => {
  const { addToast } = useToast();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  useEffect(() => {
    fetchReels();
  }, []);
  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await reelService.getReels();
      setReels(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Reels", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleLike = async (id) => {
    try {
      await reelService.likeReel(id);
      addToast("Liked! ❤️", "success");
      setReels(
        reels.map((r) =>
          r._id === id ? { ...r, likes: [...r.likes, "new"] } : r,
        ),
      );
    } catch (err) {
      addToast("Failed to like reel", "error");
    }
  };
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight; // Basic logic for scrolling to next (In a real app, use IntersectionObserver)
  };
  if (loading)
    return (
      <div className="container-fluid py-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div
      className="container-fluid py-4 px-xl-5"
      style={{ height: "calc(100dvh - 80px)", overflow: "hidden" }}
    >
      {" "}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary d-flex align-items-center gap-2">
            {" "}
            Campus Reels <Video size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Short-form vertical videos. Only campus and tech content allowed.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() =>
            addToast(
              "Upload a video URL below to share your reel with the campus!",
              "info",
            )
          }
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
        >
          {" "}
          <Plus size={20} /> Upload Reel{" "}
        </button>{" "}
      </div>{" "}
      {/* Upload Prompt */}{" "}
      <div
        className="mb-3 d-flex gap-2"
        style={{ maxWidth: 400, margin: "0 auto 1rem" }}
      >
        {" "}
        <input
          id="reel-url-input"
          type="url"
          className="form-control"
          placeholder="Paste video URL (YouTube, MP4)..."
          onKeyDown={async (e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              try {
                await reelService.uploadReel({
                  videoUrl: e.target.value.trim(),
                  title: "My Campus Reel",
                });
                addToast(
                  "Reel uploaded! It will appear after review.",
                  "success",
                );
                e.target.value = "";
                fetchReels();
              } catch (err) {
                addToast(err.message || "Upload failed", "error");
              }
            }
          }}
        />{" "}
      </div>{" "}
      <div className="d-flex justify-content-center h-100 pb-5">
        {" "}
        {/* TikTok-style Vertical Container */}{" "}
        <div
          className="bento-card bg-black p-0 position-relative overflow-hidden shadow-lg border"
          style={{ width: "400px", height: "100%", borderRadius: "24px" }}
          onScroll={handleScroll}
        >
          {" "}
          {reels.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-foreground p-4 text-center">
              {" "}
              <Video size={48} className="mb-3 opacity-50" />{" "}
              <h5 className="fw-bold">No reels yet</h5>{" "}
              <p className="text-muted small">
                Be the first to upload a campus reel!
              </p>{" "}
            </div>
          ) : (
            reels.map((reel, i) => (
              <motion.div
                key={reel._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: i === currentReelIndex ? 1 : 0 }}
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                style={{
                  zIndex: i === currentReelIndex ? 10 : 1,
                  pointerEvents: i === currentReelIndex ? "auto" : "none",
                }}
              >
                {" "}
                {/* Play Button overlay */}{" "}
                <div className="position-absolute top-50 start-50 translate-middle opacity-50">
                  {" "}
                  <Play size={80} className="text-foreground" />{" "}
                </div>{" "}
                {/* Side Actions */}{" "}
                <div className="position-absolute end-0 bottom-0 mb-5 me-3 d-flex flex-column gap-4 align-items-center z-3">
                  {" "}
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => handleLike(reel._id)}
                  >
                    {" "}
                    <div className="bg-light bg-opacity-50 p-3 rounded-circle text-foreground shadow">
                      {" "}
                      <Heart
                        size={28}
                        className={
                          reel.likes?.length > 3
                            ? "text-danger fill-danger"
                            : ""
                        }
                      />{" "}
                    </div>{" "}
                    <span className="text-foreground small fw-bold mt-1 d-block">
                      {reel.likes?.length || 0}
                    </span>{" "}
                  </div>{" "}
                  <div className="text-center cursor-pointer">
                    {" "}
                    <div className="bg-light bg-opacity-50 p-3 rounded-circle text-foreground shadow">
                      {" "}
                      <MessageCircle size={28} />{" "}
                    </div>{" "}
                    <span className="text-foreground small fw-bold mt-1 d-block">
                      0
                    </span>{" "}
                  </div>{" "}
                  <div className="text-center cursor-pointer">
                    {" "}
                    <div className="bg-light bg-opacity-50 p-3 rounded-circle text-foreground shadow">
                      {" "}
                      <Share2 size={28} />{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Bottom Info */}{" "}
                <div
                  className="position-absolute bottom-0 start-0 w-100 p-4 z-2 text-foreground"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.02), transparent)",
                  }}
                >
                  {" "}
                  <h5 className="fw-black mb-1">
                    @{reel.author?.name?.replace(/\s+/g, "") || "User"}
                  </h5>{" "}
                  <p className="small mb-2 fw-semibold">
                    {reel.caption || reel.title}
                  </p>{" "}
                  <div className="badge bg-primary rounded-pill bg-opacity-75">
                    #{reel.category || "General"}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ))
          )}{" "}
          {/* Navigation Controls */}{" "}
          {reels.length > 0 && (
            <div className="position-absolute end-0 top-50 translate-middle-y me-4 z-3 d-flex flex-column gap-2 d-none d-md-flex">
              {" "}
              <button
                className="btn btn-light rounded-circle p-2 shadow-lg"
                onClick={() =>
                  setCurrentReelIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentReelIndex === 0}
              >
                ▲
              </button>{" "}
              <button
                className="btn btn-light rounded-circle p-2 shadow-lg"
                onClick={() =>
                  setCurrentReelIndex((prev) =>
                    Math.min(reels.length - 1, prev + 1),
                  )
                }
                disabled={currentReelIndex === reels.length - 1}
              >
                ▼
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default CampusReels;
