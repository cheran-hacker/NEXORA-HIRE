import React, { useState, useEffect } from "react";
import { galleryService } from "../../services/api.js";
import { Box, Cuboid, Image as ImageIcon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const PortfolioGallery = () => {
  const { addToast } = useToast();
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchGallery();
  }, []);
  const fetchGallery = async () => {
    try {
      const res = await galleryService.getMyGallery();
      setGallery(res.data.data);
    } catch (err) {
      addToast("Failed to load 3D Gallery", "error");
    } finally {
      setLoading(false);
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
        <h2 className="fw-black mb-1 text-primary d-flex align-items-center gap-2">
          {" "}
          3D Metaverse Portfolio <Cuboid size={28} />{" "}
        </h2>{" "}
        <p className="text-muted mb-0">
          Showcase your projects in an immersive virtual room.
        </p>{" "}
      </div>{" "}
      <div
        className="bento-card bg-card text-foreground p-0 overflow-hidden shadow-lg border-0 position-relative"
        style={{ height: "600px" }}
      >
        {" "}
        {/* Mockup of a Three.js Canvas Viewer */}{" "}
        <div
          className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{ background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}
        >
          {" "}
          {!gallery?.projects || gallery.projects.length === 0 ? (
            <div className="d-flex flex-column align-items-center mb-5 text-foreground-50">
              {" "}
              <ImageIcon size={48} className="mb-3 opacity-25" />{" "}
              <h5 className="fw-bold">No Projects Uploaded</h5>{" "}
              <p className="small">
                Upload projects to view them in the 3D gallery.
              </p>{" "}
            </div>
          ) : (
            <div className="d-flex gap-5 mb-5">
              {" "}
              {gallery.projects.map((proj, i) => (
                <div key={i} className="text-center">
                  {" "}
                  <div
                    className="bg-card p-2 rounded shadow-lg mb-3 d-flex align-items-center justify-content-center text-muted"
                    style={{
                      width: "200px",
                      height: "150px",
                      transform:
                        i % 2 === 0
                          ? "perspective(500px) rotateY(15deg)"
                          : "perspective(500px) rotateY(-15deg)",
                    }}
                  >
                    {" "}
                    {proj.image ? (
                      <img
                        src={proj.image}
                        alt={proj.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ImageIcon size={32} />
                    )}{" "}
                  </div>{" "}
                  <div className="fw-bold">{proj.title}</div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
          <button
            onClick={() => {
              if (navigator.xr) {
                addToast(
                  "Requesting XR session... Put on your headset!",
                  "info",
                );
              } else {
                addToast(
                  "WebXR is not supported on this device. Try Chrome on a VR-capable device.",
                  "error",
                );
              }
            }}
            className="btn btn-outline-light rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
          >
            {" "}
            <Box size={18} /> Enter WebXR Mode{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default PortfolioGallery;
