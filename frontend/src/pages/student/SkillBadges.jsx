import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Shield,
  Zap,
  Target,
  Lock,
  Unlock,
  Cpu,
  Globe,
  Database,
  Smartphone,
} from "lucide-react";
import { skillTreeService } from "../../services/api";
export default function SkillBadges() {
  const [nodes, setNodes] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    const fetchSkillTree = async () => {
      try {
        const res = await skillTreeService.getSkillTree();
        setNodes(res.data.data?.nodes || []);
        setPaths(res.data.data?.paths || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillTree();
  }, []);
  return (
    <div className="container-fluid space-y-4" style={{ maxWidth: "1400px" }}>
      {" "}
      {/* Header Info */}{" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4 bento-card p-4 mb-4 position-relative overflow-hidden">
        {" "}
        <div
          className="position-absolute rounded-circle pe-none"
          style={{
            top: 0,
            right: 0,
            width: "250px",
            height: "250px",
            background: "rgba(var(--warning-rgb), 0.2)",
            filter: "blur(100px)",
          }}
        ></div>{" "}
        <div className="position-relative z-1">
          {" "}
          <h2
            className="fw-black mb-2 d-flex align-items-center gap-3"
            style={{ fontSize: "2.5rem", color: "var(--text)" }}
          >
            {" "}
            <Trophy className="text-warning" size={32} /> Skill Tree
            Progression{" "}
          </h2>{" "}
          <p
            className="fw-medium mb-0"
            style={{ color: "var(--text-secondary)" }}
          >
            Unlock nodes by completing assessments and syncing GitHub/LeetCode
            stats.
          </p>{" "}
        </div>{" "}
        <div
          className="position-relative z-1 d-flex gap-4 p-3 rounded-4"
          style={{
            background: "rgba(0,0,0,0.02)",
            border: "1px solid rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {" "}
          <div>
            {" "}
            <div
              className="small fw-bold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Global Rank
            </div>{" "}
            <div className="h4 fw-bold mb-0" style={{ color: "var(--text)" }}>
              #4,291
            </div>{" "}
          </div>{" "}
          <div className="vr" style={{ background: "rgba(0,0,0,0.05)" }}></div>{" "}
          <div>
            {" "}
            <div
              className="small fw-bold mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Total XP
            </div>{" "}
            <div
              className="h4 fw-bold mb-0"
              style={{ color: "var(--primary)" }}
            >
              1,950
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* RPG Skill Tree Canvas */}{" "}
      <div
        className="bento-card position-relative overflow-hidden"
        style={{
          minHeight: "600px",
          backgroundImage:
            'url("https://www.transparenttextures.com/patterns/cubes.png")',
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0,0,0,0.02)",
        }}
      >
        {" "}
        {/* Draw SVG Paths connecting nodes */}{" "}
        <svg
          className="position-absolute w-100 h-100 pe-none z-0"
          style={{
            top: 0,
            left: 0,
            filter: "drop-shadow(0 0 8px rgba(var(--primary-rgb),0.3))",
          }}
        >
          {" "}
          {paths.map((path, index) => {
            const fromNode = nodes.find((n) => n.id === path.from) || {
              x: 0,
              y: 0,
            };
            const toNode = nodes.find((n) => n.id === path.to) || {
              x: 0,
              y: 0,
            };
            return (
              <line
                key={index}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={path.active ? "var(--primary)" : "rgba(0,0,0,0.05)"}
                strokeWidth={path.active ? 4 : 2}
                strokeDasharray={path.active ? "none" : "8,8"}
                className={path.active ? "animate-pulse" : ""}
              />
            );
          })}{" "}
        </svg>{" "}
        {/* Draw Nodes */}{" "}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: node.id * 0.1, type: "spring" }}
            className="position-absolute z-1 d-flex flex-column align-items-center"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {" "}
            {/* Node Circle */}{" "}
            <div
              className={`rounded-4 d-flex align-items-center justify-content-center cursor-pointer transition-fast hover-scale shadow-sm ${node.status === "unlocked" ? "border border-primary" : "border"}`}
              style={{
                width: "80px",
                height: "80px",
                transform: "rotate(45deg)",
                background:
                  node.status === "unlocked"
                    ? "linear-gradient(135deg, var(--surface), var(--bg-light))"
                    : "rgba(0,0,0,0.02)",
                borderColor:
                  node.status === "unlocked"
                    ? "var(--primary)"
                    : "rgba(0,0,0,0.05)",
                filter: node.status === "locked" ? "grayscale(100%)" : "none",
              }}
            >
              {" "}
              <div
                className="position-relative"
                style={{ transform: "rotate(-45deg)" }}
              >
                {" "}
                {node.icon ? (
                  React.createElement(
                    typeof node.icon === "string" ? Database : node.icon,
                    {
                      size: 32,
                      className:
                        node.status === "unlocked" ? "text-foreground" : "text-muted",
                    },
                  )
                ) : (
                  <Database
                    size={32}
                    className={
                      node.status === "unlocked" ? "text-foreground" : "text-muted"
                    }
                  />
                )}{" "}
                {node.status === "locked" && (
                  <div className="position-absolute -bottom-2 -right-2 bg-slate-800 rounded-circle p-1 border border-slate-700">
                    {" "}
                    <Lock size={12} className="text-muted" />{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
            {/* Tooltip / Info */} {/* Tooltip / Info */}{" "}
            <div
              className="mt-4 text-center px-3 py-2 rounded-3 shadow-lg"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px solid rgba(0,0,0,0.05)",
                width: "12rem",
              }}
            >
              {" "}
              <h3
                className="fw-bold mb-1"
                style={{ color: "var(--text)", fontSize: "0.875rem" }}
              >
                {node.title}
              </h3>{" "}
              {node.status === "unlocked" ? (
                <>
                  {" "}
                  <div
                    className="d-flex justify-content-between mb-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {" "}
                    <span
                      className="fw-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      Lvl {node.level}
                    </span>{" "}
                    <span style={{ color: "var(--text-secondary)" }}>
                      {node.xp} / {node.maxXp} XP
                    </span>{" "}
                  </div>{" "}
                  <div
                    className="w-100 rounded-pill overflow-hidden"
                    style={{ height: "6px", background: "var(--surface-2)" }}
                  >
                    {" "}
                    <div
                      className="h-100 rounded-pill transition-fast"
                      style={{
                        width: `${(node.xp / node.maxXp) * 100}%`,
                        background: "var(--primary)",
                      }}
                    ></div>{" "}
                  </div>{" "}
                </>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center gap-1"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {" "}
                  Requires Previous Node{" "}
                </div>
              )}{" "}
            </div>{" "}
          </motion.div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
