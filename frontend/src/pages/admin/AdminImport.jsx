import React, { useState } from "react";
import {
  UploadCloud,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { motion } from "framer-motion";
import { adminService } from "../../services/api.js";

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const { addToast } = useToast();

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processValidation = async () => {
    if (!file) {
      addToast("Please select a file first", "error");
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await adminService.validateStudentsImport(formData);
      const res = response.data || response;

      if (res.success) {
        addToast(res.message, "success");
        setImportResult(res.results);
      } else {
        addToast(res.message || "Validation failed", "error");
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || err.message || "Error processing validation",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const confirmImport = async () => {
    if (!importResult || !importResult.validData || importResult.validData.length === 0) {
      addToast("No valid records to import.", "error");
      return;
    }

    setConfirming(true);
    try {
      const response = await adminService.confirmStudentsImport(importResult.validData);
      const res = response.data || response;
      
      if (res.success) {
        addToast(res.message, "success");
        // Reset everything
        setFile(null);
        setImportResult(null);
      } else {
        addToast(res.message || "Import failed", "error");
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || err.message || "Error confirming import",
        "error"
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-xl-5">
      <div className="mb-5">
        <h2 className="fw-black mb-1 text-gradient-primary">
          Bulk Data Import
        </h2>
        <p className="text-muted fw-medium">
          Upload Excel files to safely populate the database.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-4 h-100"
          >
            <h5 className="fw-bold mb-4">Select Import Destination</h5>
            <div className="d-flex gap-3 mb-4">
              <button
                type="button"
                className="btn d-flex align-items-center gap-2 px-4 py-3 rounded-4 transition-fast btn-primary shadow-sm"
              >
                <GraduationCap size={20} />
                <span className="fw-bold">Students Directory</span>
              </button>
            </div>

            {!importResult ? (
              <>
                <div
                  className={`border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center p-5 text-center transition-fast ${
                    file ? "border-success bg-success-subtle" : "border-primary"
                  }`}
                  style={{
                    minHeight: "300px",
                    cursor: "pointer",
                    background: file ? "" : "rgba(var(--primary-rgb), 0.02)",
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="d-none"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileSelect}
                  />

                  {file ? (
                    <>
                      <div
                        className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3"
                        style={{ width: "64px", height: "64px" }}
                      >
                        <CheckCircle2 size={32} />
                      </div>
                      <h5 className="fw-bold text-success mb-1">{file.name}</h5>
                      <p className="text-muted mb-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm"
                        style={{ width: "64px", height: "64px" }}
                      >
                        <UploadCloud size={32} />
                      </div>
                      <h5 className="fw-bold mb-2">Drag & drop your file here</h5>
                      <p className="text-muted mb-4">or click to browse</p>
                      <span className="badge bg-light text-foreground border px-3 py-2">
                        Supported: .xlsx, .xls
                      </span>
                    </>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    className="btn btn-primary px-4 py-2 rounded-3 fw-bold"
                    onClick={processValidation}
                    disabled={!file || uploading}
                  >
                    {uploading ? "Validating..." : "Validate Data"}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 border rounded-4 bg-light">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <CheckCircle2 className="text-success" /> Validation Complete
                </h5>
                <div className="row g-3 mb-4">
                  <div className="col-sm-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-card text-center">
                      <h3 className="fw-bold text-primary mb-0">{importResult.totalRows}</h3>
                      <span className="text-muted small">Total Rows</span>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-card text-center">
                      <h3 className="fw-bold text-success mb-0">{importResult.validStudents}</h3>
                      <span className="text-muted small">Valid Records</span>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-card text-center">
                      <h3 className="fw-bold text-danger mb-0">{importResult.invalidStudents}</h3>
                      <span className="text-muted small">Invalid Records</span>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-card text-center">
                      <h3 className="fw-bold text-warning mb-0">{importResult.duplicateStudents}</h3>
                      <span className="text-muted small">Duplicates</span>
                    </div>
                  </div>
                </div>

                {importResult.invalidRecords?.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-danger mb-2">Issues Found:</h6>
                    <div className="list-group list-group-flush border rounded-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {importResult.invalidRecords.map((record, i) => (
                        <div key={i} className="list-group-item d-flex align-items-center gap-3">
                          <AlertTriangle className="text-danger" size={16} />
                          <div>
                            <strong className="d-block small">Row {record.row} ({record.email})</strong>
                            <span className="text-muted small">{record.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold"
                    onClick={() => { setImportResult(null); setFile(null); }}
                    disabled={confirming}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success px-4 py-2 rounded-3 fw-bold"
                    onClick={confirmImport}
                    disabled={confirming || importResult.validStudents === 0}
                  >
                    {confirming ? "Importing..." : `Confirm Import (${importResult.validStudents})`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="col-lg-4">
          <div className="bento-card p-4 h-100 bg-light border-0">
            <h5 className="fw-bold mb-4">Import Guidelines</h5>

            <div className="d-flex flex-column gap-4">
              <div className="d-flex gap-3">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                  style={{ width: "32px", height: "32px" }}
                >
                  1
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Format your data</h6>
                  <p className="text-muted small mb-0">
                    Use our template to ensure your data matches the required
                    schema. Required columns: Register Number, Student Name, Email
                  </p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                  style={{ width: "32px", height: "32px" }}
                >
                  2
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Upload & Validate</h6>
                  <p className="text-muted small mb-0">
                    The system will automatically validate emails (must be @bitsathy.ac.in) and check for duplicates.
                  </p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                  style={{ width: "32px", height: "32px" }}
                >
                  3
                </div>
                <div>
                  <h6 className="fw-bold mb-1">Confirm Import</h6>
                  <p className="text-muted small mb-0">
                    Review the validation summary. Only valid records will be imported into the database.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 bg-card rounded-4 border">
              <h6 className="fw-bold mb-2">Need a template?</h6>
              <p className="text-muted small mb-3">
                Download our sample Excel file to get started quickly.
              </p>
              <a href="/student_import_template.xlsx" download className="btn btn-outline-primary btn-sm rounded-3 fw-bold w-100">
                Download Sample Template
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
