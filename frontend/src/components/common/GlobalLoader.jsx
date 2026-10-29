import React from "react";
import { motion } from "framer-motion";
export default function GlobalLoader() {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-[#0f172a] z-50 flex align-items-center justify-content-center">
      {" "}
      <div className="d-flex flex-column align-items-center gap-6">
        {" "}
        <div className="position-relative w-24 h-24">
          {" "}
          <motion.div
            className="position-absolute top-0 start-0 w-100 h-100 border-4 border-t-[#6366f1] border-r-transparent border-b-[#8b5cf6] border-l-transparent rounded-circle"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />{" "}
          <motion.div
            className="position-absolute inset-4 border-4 border-t-[#ec4899] border-r-transparent border-b-[#ef4444] border-l-transparent rounded-circle"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />{" "}
        </div>{" "}
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] font-black fs-3 tracking-widest animate-pulse">
          {" "}
          NEXORA{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
