import React from "react";
import { motion } from "framer-motion";
const Loader = ({ fullScreen = false }) => {
  const loaderContent = (
    <div className="d-flex flex-column align-items-center justify-content-center h-100">
      {" "}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 50,
          height: 50,
          border: "4px solid var(--primary-color)",
          borderTopColor: "transparent",
          borderRadius: "50%",
        }}
      />{" "}
      <h5 className="mt-3 text-muted fw-bold">NEXORA is loading...</h5>{" "}
    </div>
  );
  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--bg-color)",
          zIndex: 9999,
        }}
      >
        {" "}
        {loaderContent}{" "}
      </div>
    );
  }
  return <div className="p-5">{loaderContent}</div>;
};
export default Loader;
