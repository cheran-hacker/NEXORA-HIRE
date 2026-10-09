import React, { useState, useEffect } from "react";
import { reviewService } from "../../services/api.js";
import { Users, Star, MessageSquareQuote } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const PeerReviews = () => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchReviews();
  }, []);
  const fetchReviews = async () => {
    try {
      const res = await reviewService.getMyReviews();
      setReviews(res.data.data || []);
    } catch (err) {
      addToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
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
      <div className="mb-5 d-flex justify-content-between align-items-center">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-foreground d-flex align-items-center gap-2">
            {" "}
            Verified Peer Endorsements <Users size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            360-degree reviews locked to verified shared projects.
          </p>{" "}
        </div>{" "}
        <button
          onClick={async () => {
            try {
              await reviewService.requestReview({
                message:
                  "Requesting a peer endorsement for our shared project.",
              });
              addToast(
                "Review request sent! Your peer will be notified.",
                "success",
              );
            } catch (err) {
              addToast(err.message || "Failed to send review request", "error");
            }
          }}
          className="btn btn-dark rounded-pill fw-bold"
        >
          Request Review
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {reviews.map((rev) => (
          <div className="col-lg-6" key={rev._id}>
            {" "}
            <div className="bento-card bg-card p-4 h-100 shadow-sm border">
              {" "}
              <div className="d-flex align-items-center gap-2 text-warning mb-3">
                {" "}
                {[...Array(rev.rating || 5)].map((_, i) => (
                  <Star key={i} size={20} className="fill-warning" />
                ))}{" "}
              </div>{" "}
              <p className="fs-5 text-foreground fst-italic mb-4">
                "{rev.endorsementText}"
              </p>{" "}
              <div className="d-flex align-items-center gap-3 border-top pt-3">
                {" "}
                <div className="bg-light text-muted rounded-circle p-2 border">
                  <MessageSquareQuote size={24} />
                </div>{" "}
                <div>
                  {" "}
                  <div className="fw-bold text-foreground">
                    {rev.reviewer?.name}
                  </div>{" "}
                  <div className="small text-muted">
                    Verified Collaborator: <strong>{rev.sharedProject}</strong>
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default PeerReviews;
