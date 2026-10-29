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
  X,
  ExternalLink,
  Briefcase,
  Award,
  Code,
  FolderGit2,
} from "lucide-react";
import { placementService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentsDatabase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  // Profile modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [detailedStudent, setDetailedStudent] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await placementService.getStudents();
      setStudents(res.data.data || []);
    } catch (err) {
      addToast("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const studentName = (s.name || "").toLowerCase();
    const regNo = (s.studentProfile?.registerNumber || s.regNo || "").toLowerCase();
    const dept = (s.studentProfile?.branch || s.department || "").toLowerCase();
    const skills = (s.studentProfile?.skills || s.skills || []).join(" ").toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch =
      !search ||
      studentName.includes(term) ||
      regNo.includes(term) ||
      dept.includes(term) ||
      skills.includes(term);

    const matchesDept =
      filterDept === "All" ||
      (s.studentProfile?.branch && s.studentProfile.branch.trim().toLowerCase() === filterDept.trim().toLowerCase()) ||
      (s.department && s.department.trim().toLowerCase() === filterDept.trim().toLowerCase());

    return matchesSearch && matchesDept;
  });

  const departments = [
    "All",
    ...Array.from(
      new Set(
        students
          .map((s) => (s.studentProfile?.branch || s.department)?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];

  // View Resume action
  const handleViewResume = async (student) => {
    const resumeRef = student.studentProfile?.resumeUrl || student.resumeUrl;
    if (!resumeRef || resumeRef === "NONE" || !resumeRef.trim()) {
      addToast(`Resume not uploaded yet for ${student.name}`, "warning");
      return;
    }

    // External URL support
    if (resumeRef.startsWith("http://") || resumeRef.startsWith("https://")) {
      window.open(resumeRef, "_blank");
      return;
    }

    try {
      const token = localStorage.getItem("nexora_token");
      const response = await fetch(`/api/placements/students/${student._id}/resume`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let msg = "Failed to open resume";
        try {
          const errData = await response.json();
          msg = errData.message || msg;
        } catch (_) {
          msg = response.status === 404 ? "Resume not uploaded yet." : msg;
        }
        addToast(msg, "warning");
        return;
      }

      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, "_blank");
    } catch (err) {
      addToast(err.message || "Error opening resume file", "error");
    }
  };

  // Download Resume action
  const handleDownloadResume = async (student) => {
    const resumeRef = student.studentProfile?.resumeUrl || student.resumeUrl;
    if (!resumeRef || resumeRef === "NONE" || !resumeRef.trim()) {
      addToast(`Resume not uploaded yet for ${student.name}`, "warning");
      return;
    }

    try {
      const token = localStorage.getItem("nexora_token");
      const response = await fetch(`/api/placements/students/${student._id}/resume?download=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let msg = "Failed to download resume";
        try {
          const errData = await response.json();
          msg = errData.message || msg;
        } catch (_) {
          msg = response.status === 404 ? "Resume not uploaded yet." : msg;
        }
        addToast(msg, "warning");
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const cleanName = (student.name || "Student").replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `${cleanName}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      addToast(`Resume downloaded for ${student.name}`, "success");
    } catch (err) {
      addToast(err.message || "Error downloading resume", "error");
    }
  };

  // Profile Modal action
  const handleOpenProfile = async (student) => {
    setDetailedStudent(student); // immediate preview
    setProfileModalOpen(true);
    setProfileLoading(true);

    try {
      const res = await placementService.getStudentById(student._id);
      if (res.data?.data) {
        setDetailedStudent(res.data.data);
      }
    } catch (err) {
      // Fallback already set to student
      console.warn("Could not fetch full student details, using list data:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // CSV export handler
  const handleExportCSV = () => {
    if (!filteredStudents || filteredStudents.length === 0) {
      addToast("No student records available to export", "warning");
      return;
    }
    const headers = [
      "Name",
      "Email",
      "Register Number",
      "Department",
      "CGPA",
      "Applications Count",
      "Placement Status",
      "Resume Uploaded",
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.name || ""}"`,
      `"${s.email || ""}"`,
      `"${s.studentProfile?.registerNumber || s.regNo || ""}"`,
      `"${s.studentProfile?.branch || s.department || ""}"`,
      `"${s.studentProfile?.cgpa || ""}"`,
      s.applicationsCount || 0,
      `"${s.placementStatus || "Unplaced"}"`,
      s.hasResume ? "Yes" : "No",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Nexora_Student_Database_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported student database to CSV", "success");
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      <div className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="fw-black mb-1 text-gradient-primary">
            Student Database 🎓
          </h2>
          <p className="fw-medium m-0 text-muted">
            Track placement readiness, skills, and application progress.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-outline-primary rounded-pill fw-bold d-flex align-items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bento-card mb-4 p-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 col-lg-8">
            <div className="position-relative">
              <Search
                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                size={18}
              />
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
              />
            </div>
          </div>
          <div className="col-md-6 col-lg-4 d-flex gap-2">
            <select
              className="form-select rounded-pill ps-4"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              aria-label="Filter by department"
              style={{
                height: "48px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Departments" : d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bento-card p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom">Student</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Department</th>
                <th className="py-3 px-4 fw-semibold border-bottom">CGPA</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Applications</th>
                <th className="py-3 px-4 fw-semibold border-bottom">Status</th>
                <th className="py-3 px-4 fw-semibold border-bottom text-end">Actions</th>
              </tr>
            </thead>
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
                        <div
                          className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: "rgba(var(--primary-rgb), 0.1)",
                            color: "var(--primary)",
                          }}
                        >
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <GraduationCap size={20} />
                          )}
                        </div>
                        <div>
                          <h6 className="m-0 fw-bold">{student.name}</h6>
                          <small className="text-muted d-block">
                            {student.studentProfile?.registerNumber || student.regNo || "No Reg No"}
                          </small>
                          <small className="text-muted">{student.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-bottom text-muted">
                      {student.studentProfile?.branch || student.department || "N/A"}
                    </td>
                    <td className="py-3 px-4 fw-bold text-primary border-bottom">
                      {student.studentProfile?.cgpa ? Number(student.studentProfile.cgpa).toFixed(2) : "N/A"}
                    </td>
                    <td className="py-3 px-4 border-bottom fw-bold">
                      {student.applicationsCount || 0}
                    </td>
                    <td className="py-3 px-4 border-bottom">
                      {student.placementStatus === "Placed" ? (
                        <span className="badge bg-success-subtle text-success border border-success">
                          <CheckCircle size={12} className="me-1" /> Placed ({student.offersCount || 1})
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning border border-warning">
                          <AlertCircle size={12} className="me-1" /> Unplaced
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end border-bottom">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          onClick={() => handleViewResume(student)}
                          className="btn btn-sm rounded-pill btn-outline-primary d-inline-flex align-items-center gap-1"
                          title="View Student Resume"
                        >
                          <FileText size={14} /> Resume
                        </button>
                        <button
                          onClick={() => handleOpenProfile(student)}
                          className="btn btn-sm rounded-pill btn-light border d-inline-flex align-items-center gap-1"
                          title="View Full Profile"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <Eye size={14} /> Profile
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(6px)",
              zIndex: 1050,
            }}
            onClick={() => setProfileModalOpen(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="modal-content border-0 shadow-lg"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text)",
                  borderRadius: "1.25rem",
                  overflow: "hidden",
                }}
              >
                {/* Modal Header */}
                <div
                  className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <GraduationCap className="text-primary" size={22} />
                    <h5 className="modal-title fw-bold m-0">Student Profile & Academic Record</h5>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon rounded-circle border-0 text-muted"
                    aria-label="Close"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                  {profileLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <p className="text-muted fw-medium mb-0">Loading student details from MongoDB...</p>
                    </div>
                  ) : detailedStudent ? (
                    <div>
                      {/* Student Identity Card */}
                      <div
                        className="p-4 rounded-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
                        style={{
                          background: "var(--surface-2)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center border"
                            style={{
                              width: "64px",
                              height: "64px",
                              background: "rgba(var(--primary-rgb), 0.12)",
                              color: "var(--primary)",
                              borderColor: "var(--border)",
                            }}
                          >
                            {detailedStudent.avatar ? (
                              <img
                                src={detailedStudent.avatar}
                                alt={detailedStudent.name}
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <GraduationCap size={32} />
                            )}
                          </div>
                          <div>
                            <h4 className="fw-black mb-1">{detailedStudent.name}</h4>
                            <div className="d-flex flex-wrap align-items-center gap-2 text-muted small">
                              <span>{detailedStudent.email}</span>
                              {(detailedStudent.studentProfile?.registerNumber || detailedStudent.regNo) && (
                                <>
                                  <span>•</span>
                                  <span className="badge bg-secondary-subtle text-secondary border">
                                    Reg: {detailedStudent.studentProfile?.registerNumber || detailedStudent.regNo}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewResume(detailedStudent)}
                            className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1 fw-bold shadow-sm"
                          >
                            <FileText size={15} /> View Resume
                          </button>
                          {detailedStudent.hasResume && (
                            <button
                              onClick={() => handleDownloadResume(detailedStudent)}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1"
                              title="Download Resume PDF"
                            >
                              <Download size={15} /> Download
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Academic & Placement Highlights */}
                      <div className="row g-3 mb-4">
                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Department</small>
                            <span
                              className="fw-bold small d-block text-truncate"
                              title={detailedStudent.studentProfile?.branch || detailedStudent.department || "N/A"}
                            >
                              {detailedStudent.studentProfile?.branch || detailedStudent.department || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Degree & Year</small>
                            <span className="fw-bold small d-block">
                              {detailedStudent.course || "B.Tech / B.E."}{" "}
                              {detailedStudent.studentProfile?.batchYear
                                ? `'${String(detailedStudent.studentProfile.batchYear).slice(-2)}`
                                : detailedStudent.year
                                ? `(${detailedStudent.year})`
                                : ""}
                            </span>
                          </div>
                        </div>

                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">CGPA</small>
                            <span className="fw-black text-primary fs-5">
                              {detailedStudent.studentProfile?.cgpa
                                ? Number(detailedStudent.studentProfile.cgpa).toFixed(2)
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="col-6 col-md-3">
                          <div
                            className="p-3 rounded-3 text-center h-100"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            <small className="text-muted d-block fw-semibold mb-1">Placement Status</small>
                            {detailedStudent.placementStatus === "Placed" ? (
                              <span className="badge bg-success-subtle text-success border border-success px-2 py-1">
                                <CheckCircle size={12} className="me-1" /> Placed ({detailedStudent.offersCount || 1})
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border border-warning px-2 py-1">
                                <AlertCircle size={12} className="me-1" /> Unplaced
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Career Target & Readiness */}
                      {(detailedStudent.studentProfile?.targetCareerRole ||
                        detailedStudent.studentProfile?.careerTarget ||
                        detailedStudent.studentProfile?.readinessScore !== undefined ||
                        detailedStudent.studentProfile?.resumeScore !== undefined) && (
                        <div
                          className="p-3 rounded-3 mb-4"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <div className="row g-3 align-items-center">
                            <div className="col-md-7">
                              <small className="text-muted d-block fw-semibold mb-1">Target Career Role</small>
                              <h6 className="fw-bold mb-0 text-primary">
                                {detailedStudent.studentProfile?.targetCareerRole ||
                                  detailedStudent.studentProfile?.careerTarget ||
                                  detailedStudent.studentProfile?.preferredRoles ||
                                  "Software Development / Engineering"}
                              </h6>
                            </div>
                            <div className="col-md-5">
                              <div className="d-flex align-items-center justify-content-between mb-1">
                                <small className="text-muted fw-semibold">Career Readiness</small>
                                <span className="fw-bold small text-primary">
                                  {detailedStudent.studentProfile?.readinessScore ||
                                    detailedStudent.studentProfile?.resumeScore ||
                                    0}
                                  %
                                </span>
                              </div>
                              <div className="progress" style={{ height: "6px" }}>
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      detailedStudent.studentProfile?.readinessScore ||
                                        detailedStudent.studentProfile?.resumeScore ||
                                        0
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical Skills */}
                      {((detailedStudent.studentProfile?.skills && detailedStudent.studentProfile.skills.length > 0) ||
                        (detailedStudent.skills && detailedStudent.skills.length > 0)) && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Code size={16} className="text-primary" />
                            <h6 className="fw-bold mb-0">Technical Skills</h6>
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {(detailedStudent.studentProfile?.skills || detailedStudent.skills || []).map(
                              (skill, i) => (
                                <span
                                  key={i}
                                  className="badge rounded-pill px-3 py-2 fw-medium border"
                                  style={{
                                    background: "var(--surface-2)",
                                    color: "var(--text)",
                                    borderColor: "var(--border)",
                                  }}
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {detailedStudent.studentProfile?.projects?.length > 0 && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <FolderGit2 size={16} className="text-primary" />
                            <h6 className="fw-bold mb-0">Projects</h6>
                          </div>
                          <div className="row g-3">
                            {detailedStudent.studentProfile.projects.map((proj, i) => (
                              <div key={i} className="col-12 col-md-6">
                                <div
                                  className="p-3 rounded-3 h-100"
                                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                                >
                                  <div className="d-flex align-items-center justify-content-between mb-1">
                                    <h6 className="fw-bold mb-0 text-truncate">{proj.name}</h6>
                                    {proj.github && (
                                      <a
                                        href={proj.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-primary small text-decoration-none d-inline-flex align-items-center gap-1"
                                      >
                                        GitHub <ExternalLink size={12} />
                                      </a>
                                    )}
                                  </div>
                                  {proj.stack && (
                                    <small className="text-primary d-block mb-1 fw-semibold">{proj.stack}</small>
                                  )}
                                  {proj.desc && (
                                    <p className="text-muted small m-0 text-truncate-2">{proj.desc}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {detailedStudent.studentProfile?.certificates?.length > 0 && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <Award size={16} className="text-primary" />
                            <h6 className="fw-bold mb-0">Certifications</h6>
                          </div>
                          <div className="row g-2">
                            {detailedStudent.studentProfile.certificates.map((cert, i) => (
                              <div key={i} className="col-12 col-sm-6">
                                <div
                                  className="p-3 rounded-3 d-flex align-items-center gap-2"
                                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                                >
                                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                                  <div className="text-truncate">
                                    <span className="fw-semibold small d-block text-truncate">{cert.name}</span>
                                    <small className="text-muted d-block text-truncate">
                                      {cert.issuer} {cert.date ? `• ${cert.date}` : ""}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Applications and Placement History */}
                      <div className="mb-2">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Briefcase size={16} className="text-primary" />
                          <h6 className="fw-bold mb-0">
                            Placement Applications ({detailedStudent.applications?.length || detailedStudent.applicationsCount || 0})
                          </h6>
                        </div>
                        {!detailedStudent.applications || detailedStudent.applications.length === 0 ? (
                          <p
                            className="text-muted small p-3 rounded-3 text-center"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                          >
                            No placement drive applications recorded yet.
                          </p>
                        ) : (
                          <div
                            className="table-responsive rounded-3 border"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <table className="table table-sm align-middle mb-0">
                              <thead style={{ background: "var(--surface-2)" }}>
                                <tr>
                                  <th className="py-2 px-3 small fw-semibold">Company & Role</th>
                                  <th className="py-2 px-3 small fw-semibold">Applied Date</th>
                                  <th className="py-2 px-3 small fw-semibold text-end">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailedStudent.applications.map((app) => (
                                  <tr key={app._id}>
                                    <td className="py-2 px-3">
                                      <span className="fw-semibold small d-block">
                                        {typeof app.jobId?.company === "object"
                                          ? app.jobId?.company?.name
                                          : app.jobId?.company || "Company"}
                                      </span>
                                      <small className="text-muted">{app.jobId?.title || "Role"}</small>
                                    </td>
                                    <td className="py-2 px-3 small text-muted">
                                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="py-2 px-3 text-end">
                                      <span
                                        className={`badge rounded-pill ${
                                          app.status === "Offered"
                                            ? "bg-success-subtle text-success border border-success"
                                            : app.status === "Rejected"
                                            ? "bg-danger-subtle text-danger border border-danger"
                                            : app.status === "Interview"
                                            ? "bg-primary-subtle text-primary border border-primary"
                                            : "bg-secondary-subtle text-secondary border"
                                        }`}
                                      >
                                        {app.status || "Applied"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <p>No student details available.</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div
                  className="modal-footer py-2 px-4 border-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4"
                    onClick={() => setProfileModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
