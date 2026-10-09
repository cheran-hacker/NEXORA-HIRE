import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  BarChart2,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { placementService } from "../../services/api";
import Chart from "../../shared/components/Chart";
import { useToast } from "../../context/ToastContext";
export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("2026");
  const { addToast } = useToast();
  useEffect(() => {
    fetchData();
  }, [dateRange]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await placementService.getAnalyticsReports();
      setData(res.data.data);
    } catch (err) {
      addToast("Failed to load analytics data", "error");
    } finally {
      setLoading(false);
    }
  };
  if (loading || !data)
    return (
      <div className="p-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return (
    <div className="p-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {" "}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        {" "}
        <div>
          {" "}
          <h1
            className="fw-bold mb-2"
            style={{
              fontSize: "2rem",
              color: "var(--text)",
              letterSpacing: "-0.03em",
            }}
          >
            Analytics Reports
          </h1>{" "}
          <p
            className="fw-medium m-0"
            style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
          >
            Deep dive into placement metrics, hiring trends, and company
            performance.
          </p>{" "}
        </div>{" "}
        <div className="d-flex gap-3 align-items-center">
          {" "}
          <select
            className="form-select rounded-pill bg-transparent border text-body"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            {" "}
            <option value="2026">Class of 2026</option>{" "}
            <option value="2025">Class of 2025</option>{" "}
            <option value="2024">Class of 2024</option>{" "}
          </select>{" "}
          <button
            onClick={() => addToast("Generating PDF Report...", 'info')}
            className="btn fw-semibold rounded-pill d-flex align-items-center gap-2"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            {" "}
            <Download size={16} /> Export PDF{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      {/* KPI Row */}{" "}
      <div className="row g-4 mb-4">
        {" "}
        {[
          {
            label: "Total Offers Extended",
            value: data.kpis.totalOffers,
            icon: Target,
            color: "var(--primary)",
          },
          {
            label: "Average CTC",
            value: data.kpis.avgCtc,
            icon: TrendingUp,
            color: "var(--success)",
          },
          {
            label: "Highest CTC",
            value: data.kpis.highestCtc,
            icon: BarChart2,
            color: "var(--info)",
          },
          {
            label: "Placement Rate",
            value: data.kpis.placementRate,
            icon: Users,
            color: "var(--warning)",
          },
        ].map((kpi, i) => (
          <div key={i} className="col-md-6 col-xl-3">
            {" "}
            <div className="bento-card p-4 d-flex align-items-center gap-3 h-100">
              {" "}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  background: `rgba(0,0,0,0.05)`,
                  color: kpi.color,
                  border: `1px solid ${kpi.color}22`,
                }}
              >
                {" "}
                <kpi.icon size={28} />{" "}
              </div>{" "}
              <div>
                {" "}
                <p
                  className="mb-1 fw-semibold small"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {kpi.label}
                </p>{" "}
                <h3
                  className="fw-black mb-0"
                  style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                >
                  {kpi.value}
                </h3>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
      <div className="row g-4 mb-4">
        {" "}
        {/* Hiring Trends Chart */}{" "}
        <div className="col-xl-8">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Year-over-Year Hiring Trends
            </h5>{" "}
            <Chart
              type="line"
              height={320}
              labels={data.hiringTrends.labels}
              datasets={[
                {
                  label: "Offers Made",
                  data: data.hiringTrends.offers,
                  fill: true,
                  tension: 0.4,
                },
              ]}
            />{" "}
          </div>{" "}
        </div>{" "}
        {/* Department Breakdown */}{" "}
        <div className="col-xl-4">
          {" "}
          <div className="bento-card p-4 h-100">
            {" "}
            <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
              Offers by Department
            </h5>{" "}
            <Chart
              type="doughnut"
              height={320}
              labels={data.departmentBreakdown.labels}
              datasets={[{ data: data.departmentBreakdown.data }]}
            />{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Top Companies Table */}{" "}
      <div className="bento-card overflow-hidden p-0">
        {" "}
        <div className="p-4 border-bottom border">
          {" "}
          <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
            Top Companies
          </h5>{" "}
        </div>{" "}
        <div className="table-responsive">
          <table
            className="table table-hover mb-0"
            style={{
              "--bs-table-bg": "transparent",
              "--bs-table-color": "var(--text)",
              "--bs-table-hover-bg": "rgba(var(--primary-rgb), 0.05)",
            }}
          >
            <thead style={{ background: "var(--surface-2)" }}>
              <tr>
                <th className="py-3 px-4 fw-semibold border-bottom border text-muted">
                  Company Name
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted text-center">
                  Total Offers
                </th><th className="py-3 px-4 fw-semibold border-bottom border text-muted text-end">
                  Avg CTC
                </th></tr></thead>
            <tbody>
              {data.topCompanies.map((company, i) => (
                <tr key={i} className="border-bottom border">
                  <td className="py-3 px-4 align-middle fw-bold">
                    {company.name}
                  </td><td className="py-3 px-4 align-middle text-center">
                    
                    <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2 rounded-pill fw-bold">
                      {company.offers}
                    </span>
                  </td><td className="py-3 px-4 align-middle text-end text-success fw-semibold">
                    {company.avg}
                  </td></tr>
              ))}</tbody></table>
        </div>{" "}
      </div>{" "}
    </div>
  );
}
