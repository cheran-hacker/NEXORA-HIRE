import React, { useState, useEffect } from "react";
import { shadowService } from "../../services/api.js";
import { Briefcase, Building, CheckCircle, Clock } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const Shadowing = () => {
  const { addToast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPrograms();
  }, []);
  const fetchPrograms = async () => {
    try {
      const res = await shadowService.getShadowPrograms();
      setPrograms(res.data.data || []);
    } catch (err) {
      addToast("Failed to load shadowing programs", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleJoin = async (id) => {
    try {
      await shadowService.joinShadowProgram(id);
      addToast("Joined shadowing program!", "success");
      fetchPrograms();
    } catch (err) {
      addToast("Failed to join", "error");
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
      <div className="mb-5">
        {" "}
        <h2 className="fw-black mb-1 text-foreground d-flex align-items-center gap-2">
          {" "}
          Alumni Shadowing <Briefcase size={28} />{" "}
        </h2>{" "}
        <p className="text-muted mb-0">
          Experience a day in the life of alumni by completing their daily
          micro-tasks.
        </p>{" "}
      </div>{" "}
      <div className="row g-4">
        {" "}
        {programs.map((program) => (
          <div className="col-lg-6" key={program._id}>
            {" "}
            <div className="bento-card bg-card p-4 h-100 shadow-sm border">
              {" "}
              <div className="d-flex justify-content-between align-items-start mb-4">
                {" "}
                <div>
                  {" "}
                  <h4 className="fw-black text-foreground mb-1">
                    {program.alumniName}
                  </h4>{" "}
                  <div className="text-muted fw-bold d-flex align-items-center gap-2">
                    {" "}
                    <Building size={16} /> {program.jobTitle} @{" "}
                    {program.company}{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  className="btn btn-outline-dark rounded-pill fw-bold"
                  onClick={() => handleJoin(program._id)}
                >
                  {" "}
                  Start Shadowing{" "}
                </button>{" "}
              </div>{" "}
              <div className="bg-light p-3 rounded-4 border">
                {" "}
                <div className="small fw-bold text-uppercase text-muted mb-3 d-flex align-items-center gap-1">
                  {" "}
                  <Clock size={14} /> Today's Micro-Tasks{" "}
                </div>{" "}
                <ul className="list-unstyled mb-0">
                  {" "}
                  {program.microTasks.map((task, i) => (
                    <li
                      key={i}
                      className="mb-2 d-flex align-items-start gap-2 text-foreground fw-bold"
                    >
                      {" "}
                      <CheckCircle size={18} className="text-muted mt-1" />{" "}
                      {task}{" "}
                    </li>
                  ))}{" "}
                </ul>{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};
export default Shadowing;
