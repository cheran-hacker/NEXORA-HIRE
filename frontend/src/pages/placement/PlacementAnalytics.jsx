import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Building2,
  Briefcase,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { placementService } from "../../services/api";
import ChartWidget from "../../widgets/ChartWidget";
import { useToast } from "../../context/ToastContext";
export default function PlacementAnalytics() {
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState("6M");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await placementService.getAnalyticsReports();
        setData(res.data.data);
      } catch (err) {
        addToast("Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [addToast]);

  const handleDownload = () => {
    try {
      setDownloading(true);
      const rows = [
        ["Metric", "Value"],
        ["Total Offers", data?.overview?.totalOffers || 0],
        ["Placed Students", data?.overview?.placedStudents || 0],
        ["Average Package (LPA)", data?.overview?.avgPackage || "0"],
        ["Highest Package (LPA)", data?.overview?.highestPackage || "0"],
        [],
        ["Month", "Offers"],
        ...(data?.placementTrend || []).map(t => [t.month, t.offers])
      ];
      const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `placement_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Placement analytics exported successfully!", "success");
    } catch {
      addToast("Export failed", "error");
    } finally {
      setDownloading(false);
    }
  };
  if (loading)
    return (
      <div className="d-flex vh-100 align-items-center justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="container-fluid py-4 px-xl-5">
      {" "}
      {/* Header Info */}{" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 mb-5">
        {" "}
        <div>
          {" "}
          <h2 className="fw-black mb-2 text-gradient-primary">
            {" "}
            Placement Analytics 📊{" "}
          </h2>{" "}
          <p className="text-muted mb-0">
            Deep dive into placement metrics, trends, and department breakdowns.
          </p>{" "}
        </div>{" "}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
        >
          {" "}
          {downloading ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <Download size={18} />
          )}{" "}
          {downloading ? "Generating Report..." : "Export Report"}{" "}
        </button>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {/* Main Chart Area */}{" "}
        <div className="col-lg-8">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card h-100 p-4"
          >
            {" "}
            <div className="d-flex justify-content-between align-items-center mb-4">
              {" "}
              <h5 className="fw-bold m-0">
                Placement Trend ({trendPeriod === "6M" ? "Last 6 Months" : "Full Year View"})
              </h5>{" "}
              <button
                type="button"
                onClick={() => setTrendPeriod(p => p === "6M" ? "1Y" : "6M")}
                className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2"
              >
                {" "}
                <Filter size={14} /> {trendPeriod === "6M" ? "Show Full Year" : "Last 6 Months"}{" "}
              </button>{" "}
            </div>{" "}
            {data?.placementTrend?.length > 0 ? (
              <ChartWidget
                data={data.placementTrend}
                xKey="month"
                yKey="offers"
                type="area"
                height={350}
                color="var(--success)"
              />
            ) : (
              <div className="text-center p-5 text-muted border border-dashed rounded-3">
                No trend data available.
              </div>
            )}{" "}
          </motion.div>{" "}
        </div>{" "}
        {/* Department Breakdown */}{" "}
        <div className="col-lg-4">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bento-card h-100 p-4"
          >
            {" "}
            <h5 className="fw-bold mb-4">Offers by Department</h5>{" "}
            <div className="d-flex flex-column gap-3 mt-4">
              {" "}
              {data?.departmentBreakdown?.map((dept, i) => (
                <div key={i} className="mb-2">
                  {" "}
                  <div className="d-flex justify-content-between small fw-bold mb-1">
                    {" "}
                    <span>{dept.name}</span>{" "}
                    <span className="text-primary">{dept.value}%</span>{" "}
                  </div>{" "}
                  <div className="progress" style={{ height: "8px" }}>
                    {" "}
                    <div
                      className="progress-bar bg-primary rounded-pill"
                      role="progressbar"
                      style={{ width: `${dept.value}%` }}
                      aria-valuenow={dept.value}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
              {(!data?.departmentBreakdown ||
                data.departmentBreakdown.length === 0) && (
                <div className="text-center p-4 small text-muted border border-dashed rounded-3">
                  No department data.
                </div>
              )}{" "}
            </div>{" "}
          </motion.div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
