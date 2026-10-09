import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  ChevronDown,
  CheckCircle,
  TrendingUp,
  BarChart,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import ChartWidget from "../../widgets/ChartWidget.jsx";
import { assessmentService } from "../../services/api";
const Grades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await assessmentService.getMyAssessments();
        setGrades(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);
  if (loading) {
    return (
      <div className="p-5 text-center">
        <span className="spinner-border text-primary" />
      </div>
    );
  }
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        {" "}
        <h2
          className="fw-black mb-1 d-flex align-items-center gap-3"
          style={{ color: "var(--text)" }}
        >
          {" "}
          <Award size={32} className="text-primary" /> Academic Grades{" "}
        </h2>{" "}
        <p className="text-muted fw-medium">
          View your latest academic performance and assessment scores.
        </p>{" "}
      </motion.div>{" "}
      <div className="row g-4">
        {" "}
        {/* GPA Summary */}{" "}
        <div className="col-lg-4">
          {" "}
          <motion.div
            className="bento-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {" "}
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <TrendingUp size={20} className="text-success" /> Performance
              Overview
            </h5>{" "}
            <div
              className="text-center p-4 rounded-4 mb-3"
              style={{ background: "var(--surface-2)" }}
            >
              {" "}
              <h1
                className="fw-black text-primary mb-0"
                style={{ fontSize: "3rem" }}
              >
                3.8
              </h1>{" "}
              <span className="text-muted fw-bold">Current CGPA</span>{" "}
            </div>{" "}
            <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 mb-2">
              {" "}
              <span className="fw-semibold">Total Credits</span>{" "}
              <span className="fw-bold">120</span>{" "}
            </div>{" "}
            <div className="d-flex justify-content-between align-items-center p-3 border rounded-3">
              {" "}
              <span className="fw-semibold">Credits Earned</span>{" "}
              <span className="fw-bold text-success">90</span>{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Detailed Grades */}{" "}
        <div className="col-lg-8">
          {" "}
          <motion.div
            className="bento-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {" "}
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <BookOpen size={20} className="text-info" /> Recent Assessments
            </h5>{" "}
            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0">
                <thead style={{ borderBottom: "1px solid var(--border)" }}>
                  <tr>
                    <th className="text-muted fw-bold small text-uppercase">
                      Course
                    </th><th className="text-muted fw-bold small text-uppercase">
                      Assessment
                    </th><th className="text-muted fw-bold small text-uppercase">
                      Date
                    </th><th className="text-muted fw-bold small text-uppercase text-end">
                      Score
                    </th></tr></thead>
                <tbody>
                  {grades.map((grade) => (
                    <tr
                      key={grade._id || grade.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="py-3">
                        
                        <h6 className="fw-bold mb-0">
                          {grade.course || grade.title}
                        </h6>{" "}
                        <small className="text-muted">
                          {grade.code || grade.topic}
                        </small>
                      </td><td className="fw-semibold">
                        {grade.assessment || grade.type}
                      </td><td className="text-muted">
                        {new Date(
                          grade.date || grade.createdAt,
                        ).toLocaleDateString()}
                      </td><td className="text-end">
                        
                        <span
                          className={`badge rounded-pill ${(grade.score || 0) / (grade.max || 100) >= 0.8 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} fw-bold px-3 py-2`}
                        >
                          {" "}
                          {grade.score || 0} / {grade.max || 100}{" "}
                        </span>
                      </td></tr>
                  ))}</tbody></table>
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default Grades;
