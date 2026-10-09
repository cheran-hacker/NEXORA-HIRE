import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Download,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
export default function StudentsDatabase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const { addToast } = useToast();
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await placementService.getStudents();
        setStudents(res.data.data || []);
      } catch (err) {
        addToast("Failed to load students", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [addToast]);
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentProfile?.registerNumber &&
        s.studentProfile.registerNumber.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentProfile?.branch &&
        s.studentProfile.branch.toLowerCase().includes(search.toLowerCase()));
    const matchesDept =
      filterDept === "All" || s.studentProfile?.branch === filterDept;
    return matchesSearch && matchesDept;
  });
  const departments = [
    "All",
    ...new Set(students.map((s) => s.studentProfile?.branch).filter(Boolean)),
  ];
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-1 text-gradient-primary">
            Student Database 🎓
          </h2>{" "}
          <p className="fw-medium m-0 text-muted">
            Track placement readiness, skills, and application progress.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-2">
          {" "}
          <button className="btn btn-outline-primary rounded-pill fw-bold d-flex align-items-center gap-2">
            {" "}
            <Download size={16} /> Export CSV{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card mb-4 p-4">
        {" "}
        <div className="row g-3">
          {" "}
          <div className="col-md-6 col-lg-8">
            {" "}
            <div className="position-relative">
              {" "}
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />{" "}
              <input
                type="text"
                className="form-control ps-5 rounded-pill"
                placeholder="Search students by name, reg no, skills, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: "48px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="col-md-6 col-lg-4 d-flex gap-2">
            {" "}
            <select
              className="form-select rounded-pill ps-4"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{
                height: "48px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {" "}
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="bento-card p-0 overflow-hidden">
        {" "}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom">
                  Student
                </th><th className="py-3 px-4 fw-semibold border-bottom">
                  Department
                </th><th className="py-3 px-4 fw-semibold border-bottom">CGPA</th><th className="py-3 px-4 fw-semibold border-bottom">
                  Applications
                </th><th className="py-3 px-4 fw-semibold border-bottom">Status</th><th className="py-3 px-4 fw-semibold border-bottom text-end">
                  Actions
                </th></tr></thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-muted border border-dashed"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={student._id}
                  >
                    <td className="py-3 px-4 border-bottom">
                      
                      <div className="d-flex align-items-center gap-3">
                        {" "}
                        <div
                          className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "rgba(var(--primary-rgb), 0.1)",
                            color: "var(--primary)",
                          }}
                        >
                          {" "}
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt="avatar"
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <GraduationCap size={20} />
                          )}{" "}
                        </div>{" "}
                        <div>
                          {" "}
                          <h6 className="m-0 fw-bold">{student.name}</h6>{" "}
                          <small className="text-muted d-block">
                            {student.studentProfile?.registerNumber || "No Reg No"}
                          </small>
                          <small className="text-muted">
                            {student.email}
                          </small>{" "}
                        </div>{" "}
                      </div>
                    </td><td className="py-3 px-4 border-bottom text-muted">
                      {student.studentProfile?.branch || "N/A"}
                    </td><td className="py-3 px-4 fw-bold text-primary border-bottom">
                      {student.studentProfile?.cgpa || "N/A"}
                    </td><td className="py-3 px-4 border-bottom fw-bold">
                      {student.applicationsCount || 0}
                    </td><td className="py-3 px-4 border-bottom">
                      
                      {student.placementStatus === "Placed" ? (
                        <span className="badge bg-success-subtle text-success border border-success">
                          <CheckCircle size={12} className="me-1" /> Placed (
                          {student.offersCount})
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning">
                          <AlertCircle size={12} className="me-1" /> Unplaced
                        </span>
                      )}
                    </td><td className="py-3 px-4 text-end border-bottom">
                      
                      <div className="d-flex justify-content-end gap-2">
                        {" "}
                        <button
                          onClick={() =>
                            addToast(`View resume for ${student.name}`, 'info')
                          }
                          className="btn btn-sm rounded-pill btn-outline-primary d-inline-flex align-items-center gap-1"
                        >
                          {" "}
                          <FileText size={14} /> Resume{" "}
                        </button>{" "}
                        <button
                          onClick={() =>
                            addToast(`View full profile for ${student.name}`, 'info')
                          }
                          className="btn btn-sm rounded-pill btn-light border d-inline-flex align-items-center gap-1"
                        >
                          {" "}
                          <Eye size={14} /> Profile{" "}
                        </button>{" "}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}</tbody></table>
        </div>{" "}
      </div>{" "}
    </div>
  );
}
