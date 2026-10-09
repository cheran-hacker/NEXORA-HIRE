import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Briefcase,
  User,
  Users,
  Award,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchService } from "../services/api";

const FEATURE_INDEX = [
  { id: "resume", title: "Resume Builder", keywords: ["resume", "cv", "builder"], path: "/student/resume" },
  { id: "job", title: "Jobs & Internships", keywords: ["job", "jobs", "internship", "internships", "career"], path: "/student/jobs" },
  { id: "application", title: "Applications", keywords: ["application", "applications", "applied"], path: "/student/applications" },
  { id: "profile", title: "My Profile", keywords: ["profile", "me", "account"], path: "/student/profile" },
  { id: "alumni", title: "Alumni Network / Ask Alumni", keywords: ["alumni", "network", "ask"], path: "/student/alumni" },
  { id: "assessment", title: "Assessments", keywords: ["assessment", "assessments", "test"], path: "/student/assessments" },
  { id: "community", title: "Community Forum", keywords: ["community", "forum", "discuss"], path: "/student/community" },
  { id: "industry", title: "Industry Hub", keywords: ["industry", "hub"], path: "/student/industry" },
  { id: "dashboard", title: "Dashboard", keywords: ["dashboard", "home", "main"], path: "/student/dashboard" }
];

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [localFeatures, setLocalFeatures] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        setLocalFeatures([]);
        return;
      }
      
      const qLower = query.toLowerCase();
      const matchedFeatures = FEATURE_INDEX.filter(f => 
        f.title.toLowerCase().includes(qLower) || 
        f.keywords.some(k => k.includes(qLower))
      );
      setLocalFeatures(matchedFeatures);
      setLoading(true);
      try {
        const res = await searchService.globalSearch(query);
        setResults(res.data.data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);
  if (!isOpen) return null;
  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };
  const hasResults =
    (localFeatures && localFeatures.length > 0) ||
    (results &&
      (results.users?.length > 0 ||
        results.jobs?.length > 0 ||
        results.clubs?.length > 0 ||
        results.bounties?.length > 0));
  return (
    <AnimatePresence>
      {" "}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 z-3 d-flex justify-content-center pt-5 px-3"
        style={{ zIndex: 9999 }}
      >
        {" "}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.6 }}
          onClick={onClose}
        />{" "}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="position-relative w-100 bento-card glass-panel rounded-4 shadow-lg overflow-hidden d-flex flex-column"
          style={{ maxWidth: "600px", maxHeight: "80vh" }}
        >
          {" "}
          {/* Search Input */}{" "}
          <div
            className="p-3 border-bottom d-flex align-items-center gap-3"
            style={{ borderColor: "rgba(0,0,0,0.05)" }}
          >
            {" "}
            <Search className="text-muted" size={24} />{" "}
            <input
              ref={inputRef}
              type="text"
              className="flex-grow-1 bg-transparent border-0 fs-5 text-foreground shadow-none"
              style={{ outline: "none" }}
              placeholder="Search people, jobs, clubs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />{" "}
            {loading && (
              <span className="spinner-border spinner-border-sm text-primary" />
            )}{" "}
            <button
              onClick={onClose}
              className="btn btn-sm text-muted hover-bg-subtle transition-fast p-1"
            >
              {" "}
              <X size={20} />{" "}
            </button>{" "}
          </div>{" "}
          {/* Results Area */}{" "}
          <div className="flex-grow-1 overflow-y-auto p-3 custom-scrollbar">
            {" "}
            {!query && !results && (
              <div className="text-center text-muted py-5">
                {" "}
                <Search size={48} className="mx-auto mb-3 opacity-25" />{" "}
                <p>
                  Start typing to search across the campus ecosystem...
                </p>{" "}
              </div>
            )}{" "}
            {query && !loading && !hasResults && results && (
              <div className="text-center text-muted py-5">
                {" "}
                <p>No results found for "{query}"</p>{" "}
              </div>
            )}{" "}
            {hasResults && (
              <div className="space-y-6">
                {" "}
                {/* Features Section */} 
                {localFeatures.length > 0 && (
                  <div>
                    <h6 className="small fw-bold text-muted text-uppercase tracking-wider mb-2 px-2 d-flex align-items-center gap-2">
                      <Briefcase size={14} /> Features 
                    </h6>
                    <div className="d-flex flex-column gap-1">
                      {localFeatures.map((f) => (
                        <div
                          key={f.id}
                          className="p-2 rounded-3 hover-bg-subtle cursor-pointer transition-fast d-flex align-items-center gap-3"
                          onClick={() => handleNavigate(f.path)}
                        >
                          <div className="bg-primary-subtle text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
                            <ChevronRight size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-foreground">{f.title}</div>
                            <div className="small text-muted">Go to module</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Users Section */}{" "}
                {results?.users?.length > 0 && (
                  <div>
                    {" "}
                    <h6 className="small fw-bold text-muted text-uppercase tracking-wider mb-2 px-2 d-flex align-items-center gap-2">
                      {" "}
                      <User size={14} /> People{" "}
                    </h6>{" "}
                    <div className="d-flex flex-column gap-1">
                      {" "}
                      {results.users.map((user) => (
                        <div
                          key={user._id}
                          onClick={() =>
                            handleNavigate(`/student/profile?id=${user._id}`)
                          }
                          className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer hover-bg-subtle transition-fast group"
                        >
                          {" "}
                          <div className="d-flex align-items-center gap-3">
                            {" "}
                            <img
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
                              }
                              className="rounded-circle"
                              style={{ width: "32px", height: "32px" }}
                              alt=""
                            />{" "}
                            <div>
                              {" "}
                              <div className="small fw-bold text-foreground">
                                {user.name}
                              </div>{" "}
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {user.role}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                          <ChevronRight
                            size={16}
                            className="text-muted opacity-50 transition-opacity"
                          />{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {/* Jobs Section */}{" "}
                {results.jobs?.length > 0 && (
                  <div>
                    {" "}
                    <h6 className="small fw-bold text-muted text-uppercase tracking-wider mb-2 px-2 d-flex align-items-center gap-2 mt-4">
                      {" "}
                      <Briefcase size={14} /> Opportunities{" "}
                    </h6>{" "}
                    <div className="d-flex flex-column gap-1">
                      {" "}
                      {results.jobs.map((job) => (
                        <div
                          key={job._id}
                          onClick={() => handleNavigate("/student/jobs")}
                          className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer hover-bg-subtle transition-fast group"
                        >
                          {" "}
                          <div className="d-flex align-items-center gap-3">
                            {" "}
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                background: "rgba(var(--success-rgb), 0.2)",
                                color: "var(--success)",
                              }}
                            >
                              {" "}
                              <Briefcase size={16} />{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="small fw-bold text-foreground">
                                {job.title}
                              </div>{" "}
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {job.company} • {job.type}
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                          <ChevronRight
                            size={16}
                            className="text-muted opacity-50 transition-opacity"
                          />{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
                {/* Clubs Section */}{" "}
                {results.clubs?.length > 0 && (
                  <div>
                    {" "}
                    <h6 className="small fw-bold text-muted text-uppercase tracking-wider mb-2 px-2 d-flex align-items-center gap-2 mt-4">
                      {" "}
                      <Users size={14} /> Clubs & Communities{" "}
                    </h6>{" "}
                    <div className="d-flex flex-column gap-1">
                      {" "}
                      {results.clubs.map((club) => (
                        <div
                          key={club._id}
                          onClick={() => handleNavigate("/student/clubs")}
                          className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer hover-bg-subtle transition-fast group"
                        >
                          {" "}
                          <div className="d-flex align-items-center gap-3">
                            {" "}
                            <div
                              className="rounded-3 d-flex align-items-center justify-content-center"
                              style={{
                                width: "32px",
                                height: "32px",
                                background: "rgba(var(--primary-rgb), 0.2)",
                                color: "var(--primary)",
                              }}
                            >
                              {" "}
                              <Users size={16} />{" "}
                            </div>{" "}
                            <div>
                              {" "}
                              <div className="small fw-bold text-foreground">
                                {club.name}
                              </div>{" "}
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {club.category} • {club.memberCount} members
                              </div>{" "}
                            </div>{" "}
                          </div>{" "}
                          <ChevronRight
                            size={16}
                            className="text-muted opacity-50 transition-opacity"
                          />{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Footer Info */}{" "}
          <div
            className="p-2 border-top d-flex justify-content-between align-items-center small text-muted"
            style={{
              borderColor: "rgba(0,0,0,0.05)",
              background: "rgba(0,0,0,0.05)",
            }}
          >
            {" "}
            <div className="d-flex align-items-center gap-3">
              {" "}
              <span className="d-flex align-items-center gap-1">
                <kbd className="badge bg-light border text-muted">↑</kbd>
                <kbd className="badge bg-light border text-muted">↓</kbd> to
                navigate
              </span>{" "}
              <span className="d-flex align-items-center gap-1">
                <kbd className="badge bg-light border text-muted">↵</kbd> to
                select
              </span>{" "}
            </div>{" "}
            <span>Global Search</span>{" "}
          </div>{" "}
        </motion.div>{" "}
      </div>{" "}
    </AnimatePresence>
  );
}
