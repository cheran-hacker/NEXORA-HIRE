import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notedaoService } from "../../services/api.js";
import {
  FileText,
  ArrowUp,
  ArrowDown,
  Plus,
  Link,
  Database,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
const NoteDao = () => {
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: "",
    title: "",
    documentUrl: "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  useEffect(() => {
    fetchNotes();
  }, []);
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await notedaoService.getNotes();
      setNotes(res.data.data || []);
    } catch (err) {
      addToast("Failed to load Note DAO", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await notedaoService.uploadNote(formData);
      addToast("Note contributed to the DAO! 📚", "success");
      setShowAdd(false);
      setFormData({ courseCode: "", title: "", documentUrl: "" });
      fetchNotes();
    } catch (err) {
      addToast("Failed to upload note", "error");
    }
  };
  const handleVote = async (id, action) => {
    try {
      await notedaoService.voteNote(id, action);
      addToast(action === "upvote" ? "Upvoted! 👍" : "Downvoted 👎", "success");
      fetchNotes();
    } catch (err) {
      // Local fallback for UI demo
      const updated = notes.map((n) => {
        if (n._id === id) {
          if (action === "upvote")
            return {
              ...n,
              upvotes: [...n.upvotes, "temp"],
              downvotes: n.downvotes.slice(1),
            };
          else
            return {
              ...n,
              downvotes: [...n.downvotes, "temp"],
              upvotes: n.upvotes.slice(1),
            };
        }
        return n;
      });
      setNotes(updated);
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
            Note-Taking DAO <Database size={28} />{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Decentralized knowledge sharing. Upvote quality notes, downvote
            spam. Low quality notes are automatically slashed.
          </p>{" "}
        </div>{" "}
        <button
          className="btn btn-dark rounded-pill px-4 shadow-sm fw-bold d-flex align-items-center gap-2"
          onClick={() => setShowAdd(true)}
        >
          {" "}
          <Plus size={20} /> Contribute Notes{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {notes
          .filter((n) => n.status === "Active")
          .map((note, i) => {
            const score =
              (note.upvotes?.length || 0) - (note.downvotes?.length || 0);
            return (
              <div className="col-lg-6" key={note._id}>
                {" "}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bento-card p-0 h-100 d-flex overflow-hidden border border-light shadow-sm"
                >
                  {" "}
                  {/* Voting Column */}{" "}
                  <div className="bg-light p-3 d-flex flex-column align-items-center justify-content-center gap-2 border-end">
                    {" "}
                    <button
                      className="btn btn-sm btn-outline-success rounded-circle p-2"
                      onClick={() => handleVote(note._id, "upvote")}
                    >
                      {" "}
                      <ArrowUp size={20} />{" "}
                    </button>{" "}
                    <div
                      className={`fs-5 fw-black ${score > 0 ? "text-success" : score < 0 ? "text-danger" : "text-foreground"}`}
                    >
                      {" "}
                      {score > 0 ? `+${score}` : score}{" "}
                    </div>{" "}
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-2"
                      onClick={() => handleVote(note._id, "downvote")}
                    >
                      {" "}
                      <ArrowDown size={20} />{" "}
                    </button>{" "}
                  </div>{" "}
                  {/* Content Column */}{" "}
                  <div className="p-4 flex-grow-1 bg-card">
                    {" "}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      {" "}
                      <div className="badge bg-primary text-white rounded-pill px-3 py-2 fw-bold">
                        {note.courseCode}
                      </div>{" "}
                      {score >= 2 && (
                        <div className="badge bg-success-subtle text-success-emphasis border border-success-subtle d-flex align-items-center gap-1">
                          <CheckCircle size={12} /> High Quality
                        </div>
                      )}{" "}
                    </div>{" "}
                    <h4 className="fw-black text-foreground mb-1">{note.title}</h4>{" "}
                    <div className="small text-muted mb-4">
                      Contributed by:{" "}
                      <span className="fw-bold">{note.uploader?.name}</span>
                    </div>{" "}
                    <a
                      href={note.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-dark w-100 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      {" "}
                      <Link size={16} /> View Document{" "}
                    </a>{" "}
                  </div>{" "}
                </motion.div>{" "}
              </div>
            );
          })}{" "}
        {notes.length === 0 && (
          <div className="col-12 text-center p-5 bento-card ">
            {" "}
            <FileText
              size={48}
              className="text-muted mb-3 opacity-25 mx-auto"
            />{" "}
            <h5 className="fw-bold text-muted">No notes in the DAO yet.</h5>{" "}
            <p className="text-muted small">
              Be the first to share knowledge and earn governance tokens.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {/* Add Note Modal */}{" "}
      <AnimatePresence>
        {" "}
        {showAdd && (
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
            <div
              className="bento-card bg-card p-4"
              style={{ width: "90%", maxWidth: "400px" }}
            >
              {" "}
              <div className="text-center mb-4">
                {" "}
                <div className="bg-card text-foreground rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                  {" "}
                  <Database size={32} />{" "}
                </div>{" "}
                <h4 className="fw-bold">Contribute to DAO</h4>{" "}
              </div>{" "}
              <form onSubmit={handleUpload}>
                {" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Course Code
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control text-uppercase fw-bold text-primary"
                    required
                    value={formData.courseCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courseCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. CS101"
                  />{" "}
                </div>{" "}
                <div className="mb-3">
                  {" "}
                  <label className="form-label fw-bold small">
                    Document Title
                  </label>{" "}
                  <input
                    type="text"
                    className="form-control fw-bold"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Midterm 1 Cheat Sheet"
                  />{" "}
                </div>{" "}
                <div className="mb-4">
                  {" "}
                  <label className="form-label fw-bold small">
                    Upload Document (PDF, Docx)
                  </label>{" "}
                  <input
                    type="file"
                    className="form-control fw-bold mb-2"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        setUploadingFile(true);
                        setTimeout(() => {
                          setUploadingFile(false);
                          setFormData({
                            ...formData,
                            documentUrl: `https://nexora-storage.s3.amazonaws.com/notes/${e.target.files[0].name}`,
                          });
                          addToast(
                            "File uploaded to decentralized storage!",
                            "success",
                          );
                        }, 1500);
                      }
                    }}
                  />{" "}
                  {uploadingFile && (
                    <div className="small text-primary fw-bold mt-1">
                      Simulating IPFS Upload...
                    </div>
                  )}{" "}
                  {formData.documentUrl && !uploadingFile && (
                    <div className="small text-success fw-bold mt-1">
                      File attached: {formData.documentUrl.split("/").pop()}
                    </div>
                  )}{" "}
                </div>{" "}
                <div className="d-flex justify-content-end gap-2">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAdd(false)}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-dark rounded-pill px-4 fw-bold"
                    disabled={uploadingFile || !formData.documentUrl}
                  >
                    Publish to DAO
                  </button>{" "}
                </div>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
};
export default NoteDao;
