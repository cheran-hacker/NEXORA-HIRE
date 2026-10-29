import React, { useState, useEffect } from "react";
import { hiringDriveService } from "../../services/api";
import { useToast } from '../../context/ToastContext';
import {
  Target,
  Users,
  MapPin,
  Building,
  ChevronRight,
  Activity,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import ChartWidget from "../../widgets/ChartWidget";
import KPIWidget from "../../widgets/KPIWidget";
export default function HiringDrives() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("active");
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await hiringDriveService.getAll();
        setDrives(res.data.data || []);
      } catch (err) {
        addToast("Failed to fetch hiring drives", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, [addToast]);
  const funnelData = [
    { name: "Applied", value: 2130 },
    { name: "Assessed", value: 1450 },
    { name: "Interviewed", value: 210 },
    { name: "Offered", value: 12 },
  ];
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1200px" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h2
            className="fw-black mb-1 d-flex align-items-center gap-2"
            style={{ color: "var(--text)" }}
          >
            {" "}
            <Target size={32} className="text-primary" /> Hiring Drives{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage large-scale campus recruitment and off-campus drives.
          </p>{" "}
        </div>{" "}
        <button
          onClick={() => addToast("Opening Create New Drive modal", 'info')}
          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 hover-lift"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--purple))",
            color: "#fff",
            border: "none",
          }}
        >
          {" "}
          <Plus size={18} /> Create New Drive{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4 mb-4">
        {" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Total Applicants"
            value="2,580"
            change="+12% this week"
            trend="up"
            icon={Users}
            colorClass="text-primary"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Assessments Taken"
            value="1,450"
            change="56% conversion"
            trend="up"
            icon={Activity}
            colorClass="text-warning"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Active Drives"
            value="2"
            change="1 Upcoming"
            trend="up"
            icon={Target}
            colorClass="text-success"
          />{" "}
        </div>{" "}
        <div className="col-md-3">
          {" "}
          <KPIWidget
            title="Offers Rolled Out"
            value="12"
            change="+3 today"
            trend="up"
            icon={Building}
            colorClass="text-info"
          />{" "}
        </div>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        <div className="col-xl-8">
          {" "}
          <div className="bento-card p-0 overflow-hidden h-100 d-flex flex-column">
            {" "}
            <div
              className="d-flex border-bottom"
              style={{
                borderColor: "var(--border) !important",
                background: "var(--surface-2)",
              }}
            >
              {" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "active" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "active"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("active")}
              >
                {" "}
                Active Drives{" "}
              </button>{" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "upcoming" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "upcoming"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("upcoming")}
              >
                {" "}
                Upcoming{" "}
              </button>{" "}
              <button
                className={`flex-grow-1 py-3 text-center fw-bold transition-fast ${activeTab === "completed" ? "border-bottom border-2 border-primary" : ""}`}
                style={{
                  background: "transparent",
                  color:
                    activeTab === "completed"
                      ? "var(--text)"
                      : "var(--text-secondary)",
                  border: "none",
                }}
                onClick={() => setActiveTab("completed")}
              >
                {" "}
                Completed{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex-grow-1 p-4 d-flex flex-column gap-3 overflow-auto">
              {" "}
              {drives
                .filter(
                  (d) =>
                    activeTab === "all" || d.status.toLowerCase() === activeTab,
                )
                .map((drive, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={drive._id}
                    className="p-4 rounded-4 position-relative overflow-hidden hover-scale cursor-pointer"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {" "}
                    <div
                      className="position-absolute top-0 bottom-0 start-0"
                      style={{
                        width: "4px",
                        background:
                          drive.status === "Active"
                            ? "var(--success)"
                            : "var(--warning)",
                      }}
                    />{" "}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {" "}
                      <div>
                        {" "}
                        <h5
                          className="fw-bold mb-1"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.name}
                        </h5>{" "}
                        <p className="text-muted fw-medium small m-0 d-flex align-items-center gap-2">
                          {" "}
                          <Building size={14} /> {drive.company}{" "}
                          <span className="text-muted mx-1">•</span>{" "}
                          <MapPin size={14} /> {drive.locations.join(", ")}{" "}
                        </p>{" "}
                      </div>{" "}
                      <span
                        className={`badge rounded-pill px-3 py-2 fw-bold ${drive.status === "Active" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}
                      >
                        {" "}
                        {drive.status}{" "}
                      </span>{" "}
                    </div>{" "}
                    <div
                      className="row g-2 text-center mt-2 pt-3 border-top"
                      style={{ borderColor: "var(--border) !important" }}
                    >
                      {" "}
                      <div className="col-3">
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.applied}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Applied
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.assessed}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Assessed
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span
                          className="d-block fw-black fs-5"
                          style={{ color: "var(--text)" }}
                        >
                          {drive.interviewed}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Interviewed
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="col-3"
                        style={{ borderLeft: "1px solid var(--border)" }}
                      >
                        {" "}
                        <span className="d-block fw-black fs-5 text-primary">
                          {drive.offered}
                        </span>{" "}
                        <span
                          className="text-muted small fw-bold text-uppercase"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Offered
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                  </motion.div>
                ))}{" "}
              {drives.filter((d) => d.status.toLowerCase() === activeTab)
                .length === 0 && (
                <div className="text-center p-5">
                  {" "}
                  <p className="text-muted fw-bold">
                    {loading ? "Loading drives..." : `No ${activeTab} drives found.`}
                  </p>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="col-xl-4">
          {" "}
          <div className="bento-card p-4 h-100 d-flex flex-column">
            {" "}
            <h5
              className="fw-bold mb-4 d-flex align-items-center gap-2"
              style={{ color: "var(--text)" }}
            >
              {" "}
              <Activity size={20} className="text-primary" /> Overall
              Funnel{" "}
            </h5>{" "}
            <div className="flex-grow-1 d-flex flex-column justify-content-center">
              {" "}
              <ChartWidget
                data={funnelData}
                xKey="name"
                yKey="value"
                height={250}
                color="#10b981"
              />{" "}
            </div>{" "}
            <div className="mt-4">
              {" "}
              <button
                onClick={() => addToast("Viewing detailed reports", 'info')}
                className="btn btn-outline-secondary w-100 rounded-pill fw-bold d-flex align-items-center justify-content-between p-3 hover-lift"
              >
                {" "}
                <span>View Detailed Reports</span>{" "}
                <ChevronRight size={18} />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
