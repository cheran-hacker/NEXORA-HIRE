import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scholarshipService } from "../../services/api.js";
import {
  GraduationCap,
  Briefcase,
  Zap,
  Search,
  Target,
  Settings2,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const ScholarshipMatchmaker = () => {
  const { addToast } = useToast();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    amount: 1000,
    matchCriteria: { major: "CS", minGpa: 3.5, hometown: "NY" },
  }); // Simulated student profile for matching
  const studentProfile = { major: "CS", gpa: 3.8, hometown: "NY" };
  useEffect(() => {
    fetchScholarships();
  }, []);
  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await scholarshipService.getScholarships(); // Compute match score locally for demo
      let data = res.data.data || [];
      data = data.map((sch) => {
        let score = 0;
        let totalCriteria = 3;
        if (sch.matchCriteria.major === studentProfile.major) score++;
        if (studentProfile.gpa >= sch.matchCriteria.minGpa) score++;
        if (sch.matchCriteria.hometown === studentProfile.hometown) score++;
        sch.matchPercentage = Math.round((score / totalCriteria) * 100);
        return sch;
      }); // Sort by match percentage data.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setScholarships(data);
    } catch (err) {
      addToast("Failed to load scholarships", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleAutoApply = async (id) => {
    try {
      await scholarshipService.autoApply(id);
      addToast("Auto-Application Sent! 🚀", "success");
    } catch (err) {
      addToast("Failed to auto-apply", "error");
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
            Scholarship Matchmaker <GraduationCap size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Cross-reference your academic profile with live micro-scholarships
            and one-click auto-apply.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <div className="bg-light px-4 py-2 rounded-pill d-flex align-items-center gap-3 border shadow-sm me-3">
            {" "}
            <span className="small text-muted fw-bold">My Profile:</span>{" "}
            <span className="badge bg-light">
              Major: {studentProfile.major}
            </span>{" "}
            <span className="badge bg-light">GPA: {studentProfile.gpa}</span>{" "}
            <span className="badge bg-light">
              From: {studentProfile.hometown}
            </span>{" "}
            <Settings2 size={16} className="text-primary cursor-pointer" />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {scholarships.map((sch, i) => (
          <div className="col-lg-4 col-md-6" key={sch._id}>
            {" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`bento-card p-0 h-100 overflow-hidden d-flex flex-column ${sch.matchPercentage >= 80 ? "border border-success border-2 shadow-lg " : "border border-light bg-card"}`}
            >
              {" "}
              <div
                className={`p-3 d-flex justify-content-between align-items-center ${sch.matchPercentage >= 80 ? "bg-success-subtle" : "bg-light"}`}
              >
                {" "}
                <div className="d-flex align-items-center gap-2">
                  {" "}
                  <Target
                    size={20}
                    className={
                      sch.matchPercentage >= 80 ? "text-success" : "text-muted"
                    }
                  />{" "}
                  <span
                    className={`fw-black fs-5 ${sch.matchPercentage >= 80 ? "text-success-emphasis" : "text-foreground"}`}
                  >
                    {sch.matchPercentage}% Match
                  </span>{" "}
                </div>{" "}
                <div className="badge bg-light rounded-pill fs-6 px-3 shadow-sm">
                  {" "}
                  ${sch.amount}{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-4 flex-grow-1">
                {" "}
                <h5 className="fw-bold mb-1">{sch.name}</h5>{" "}
                <p className="text-muted small fw-bold mb-4">{sch.provider}</p>{" "}
                <div className="bg-light p-3 rounded-3 mb-4">
                  {" "}
                  <div className="small fw-bold text-muted mb-2 text-uppercase">
                    Required Criteria:
                  </div>{" "}
                  <ul className="list-unstyled mb-0 small">
                    {" "}
                    <li className="mb-1 d-flex justify-content-between">
                      <span>Major:</span>{" "}
                      <span className="fw-semibold">
                        {sch.matchCriteria.major}
                      </span>
                    </li>{" "}
                    <li className="mb-1 d-flex justify-content-between">
                      <span>Min GPA:</span>{" "}
                      <span className="fw-semibold">
                        {sch.matchCriteria.minGpa}
                      </span>
                    </li>{" "}
                    <li className="mb-0 d-flex justify-content-between">
                      <span>Hometown:</span>{" "}
                      <span className="fw-semibold">
                        {sch.matchCriteria.hometown}
                      </span>
                    </li>{" "}
                  </ul>{" "}
                </div>{" "}
                <button
                  className={`btn w-100 rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2 ${sch.matchPercentage >= 80 ? "btn-success shadow-lg" : "btn-outline-dark"}`}
                  onClick={() => handleAutoApply(sch._id)}
                >
                  {" "}
                  <Zap
                    size={18}
                    className={sch.matchPercentage >= 80 ? "animate-pulse" : ""}
                  />{" "}
                  One-Click Auto-Apply{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>
        ))}{" "}
        {scholarships.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <Search
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No scholarships matched.</h5>{" "}
            <p className="text-muted small">
              Update your profile to find more matches.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default ScholarshipMatchmaker;
