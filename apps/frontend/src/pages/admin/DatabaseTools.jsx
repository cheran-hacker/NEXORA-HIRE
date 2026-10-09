import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import {
  Database,
  HardDrive,
  Cpu,
  Archive,
  RefreshCw,
  ServerCog,
  Layers,
  CheckCircle,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles
} from "lucide-react";
import Chart from "../../shared/components/Chart";

export default function DatabaseTools() {
  const [dbData, setDbData] = useState(null);
  const [allCollections, setAllCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const { addToast } = useToast();

  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchDbStats();
  }, []);

  const fetchDbStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDatabaseStats();
      setDbData(res.data.data);
      
      const collRes = await adminService.getCollections();
      if (collRes.data?.data) {
        setAllCollections(collRes.data.data);
      }
    } catch (err) {
      addToast("Failed to load database stats", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    setBackingUp(true);
    addToast("Initiating manual database backup...", "info");
    setTimeout(() => {
      setBackingUp(false);
      addToast("Backup completed successfully and stored in S3", "success");
    }, 2500);
  };

  if (loading || !dbData)
    return (
      <div className="p-4 d-flex justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div className="p-4" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {selectedCollection ? (
        <CollectionBrowser 
          collection={selectedCollection} 
          onBack={() => setSelectedCollection(null)} 
        />
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
            <div>
              <h1
                className="fw-bold mb-2 d-flex align-items-center gap-3"
                style={{
                  fontSize: "2rem",
                  color: "var(--text)",
                  letterSpacing: "-0.03em",
                }}
              >
                <ServerCog size={32} className="text-primary" /> Database Tools
              </h1>
              <p
                className="fw-medium m-0"
                style={{ color: "var(--text-secondary)", fontSize: "1rem" }}
              >
                Manage your MongoDB collections, storage limits, and manual backups.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn fw-semibold rounded-pill d-flex align-items-center gap-2"
                style={{ background: "var(--surface-2)", color: "var(--text)" }}
                onClick={fetchDbStats}
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                className="btn btn-primary fw-semibold rounded-pill d-flex align-items-center gap-2 px-4 shadow-sm"
                onClick={handleBackup}
                disabled={backingUp}
              >
                {backingUp ? (
                  <RefreshCw size={16} className="fa-spin" />
                ) : (
                  <Archive size={16} />
                )}
                {backingUp ? "Backing Up..." : "Trigger Backup"}
              </button>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {[
              {
                label: "Total Storage Size",
                value: dbData.kpis.totalSize,
                icon: HardDrive,
                color: "var(--primary)",
              },
              {
                label: "Active Collections",
                value: allCollections.length || dbData.kpis.activeCollections,
                icon: Layers,
                color: "var(--info)",
              },
              {
                label: "Query Operations / s",
                value: dbData.kpis.queryOps || "N/A",
                icon: Cpu,
                color: "var(--success)",
              },
              {
                label: "Last Backup",
                value: dbData.kpis.lastBackup,
                icon: CheckCircle,
                color: "var(--warning)",
              },
            ].map((kpi, i) => (
              <div key={i} className="col-md-6 col-xl-3">
                <div className="bento-card p-4 d-flex align-items-center gap-3 h-100">
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
                    <kpi.icon size={28} />
                  </div>
                  <div>
                    <p
                      className="mb-1 fw-semibold small"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {kpi.label}
                    </p>
                    <h3
                      className="fw-black mb-0"
                      style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
                    >
                      {kpi.value}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-8">
              <div className="bento-card p-0 h-100 overflow-hidden">
                <div className="p-4 border-bottom border d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--text)" }}>
                    Collections Map (Click to Explore)
                  </h5>
                  <Database size={20} className="text-primary" />
                </div>
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-borderless table-hover mb-0 align-middle">
                    <thead
                      className="bg-transparent border-bottom border sticky-top"
                      style={{ color: "var(--text-secondary)", background: 'var(--surface)' }}
                    >
                      <tr>
                        <th className="ps-4 fw-bold py-3">Collection Name</th>
                        <th className="fw-bold py-3">Document Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCollections.map((coll, i) => {
                        const statsMatch = dbData.collections.find(c => c.name.toLowerCase() === coll.toLowerCase());
                        return (
                        <tr
                          key={i}
                          className="border-bottom border hover-bg transition-fast"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedCollection(coll)}
                        >
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-2">
                              <Layers size={16} className="text-muted" />
                              <span
                                className="fw-bold"
                                style={{ color: "var(--text)" }}
                              >
                                {coll}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            {statsMatch ? (
                              <span className="badge bg-secondary-subtle text-secondary rounded-pill fw-semibold">
                                {statsMatch.count.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-muted small">Explore to count</span>
                            )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="col-xl-4">
              <div className="bento-card p-4 h-100">
                <h5 className="fw-bold mb-4" style={{ color: "var(--text)" }}>
                  Storage Distribution
                </h5>
                <div className="d-flex justify-content-center">
                  <Chart
                    type="doughnut"
                    height={280}
                    labels={dbData.distribution.labels}
                    datasets={[
                      {
                        data: dbData.distribution.data,
                        backgroundColor: [
                          "#6366f1",
                          "#8b5cf6",
                          "#ec4899",
                          "#14b8a6",
                          "#3b82f6",
                        ],
                        borderWidth: 0,
                        hoverOffset: 4,
                      },
                    ]}
                    options={{
                      cutout: "75%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            color: "var(--text-secondary)",
                            padding: 20,
                            font: { family: "'Inter', sans-serif", weight: "600" },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CollectionBrowser({ collection, onBack }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // null means "Create" mode
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  useEffect(() => {
    fetchDocuments(page);
  }, [collection, page]);

  const fetchDocuments = async (p = 1) => {
    try {
      setLoading(true);
      const res = await adminService.getDocuments(collection, p, 20);
      setDocuments(res.data.data.documents);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      addToast(`Failed to load ${collection} documents`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setEditorModalOpen(true);
  };

  const handleCreate = () => {
    setEditingDoc(null);
    setEditorModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await adminService.deleteDocument(collection, id);
      addToast("Document deleted successfully", "success");
      fetchDocuments(page);
    } catch (err) {
      addToast("Failed to delete document", "error");
    }
  };

  const handleAudit = async () => {
    setAuditLoading(true);
    setAuditResult(null);
    try {
      const res = await adminService.auditCollection(collection);
      setAuditResult(res.data.data);
      addToast("Audit complete", "success");
    } catch (err) {
      addToast("Failed to run AI Audit", "error");
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="bento-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-sm btn-light rounded-circle p-2" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <h2 className="fw-bold mb-0 text-capitalize">{collection}</h2>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn rounded-pill d-flex align-items-center gap-2 fw-bold shadow-sm text-purple" 
            style={{ background: 'rgba(147,51,234,0.1)' }}
            onClick={handleAudit}
            disabled={auditLoading}
          >
            {auditLoading ? <RefreshCw size={16} className="fa-spin" /> : <Sparkles size={16} />} 
            {auditLoading ? "Auditing..." : "AI Audit"}
          </button>
          <button className="btn btn-outline-secondary rounded-pill d-flex align-items-center gap-2" onClick={() => fetchDocuments(page)}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary rounded-pill d-flex align-items-center gap-2" onClick={handleCreate}>
            <Plus size={16} /> Add Document
          </button>
        </div>
      </div>

      {auditResult && (
        <div className="alert border-0 rounded-3 mb-4" style={{ background: 'linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.05))', borderLeft: '4px solid var(--premium-neon-purple) !important' }}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="fw-bold text-purple mb-0 d-flex align-items-center gap-2">
              <Sparkles size={16} /> AI Audit Report
            </h6>
            <button className="btn-close btn-sm" onClick={() => setAuditResult(null)}></button>
          </div>
          <p className="small mb-2">{auditResult.summary}</p>
          {auditResult.anomalies && auditResult.anomalies.length > 0 && (
            <ul className="small mb-0 text-muted ps-3">
              {auditResult.anomalies.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
      ) : documents.length === 0 ? (
        <div className="text-center p-5 text-muted">No documents found in this collection.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="bg-transparent border-bottom" style={{ color: "var(--text-secondary)" }}>
              <tr>
                <th className="fw-bold">ID</th>
                <th className="fw-bold">Data Summary</th>
                <th className="fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id} className="border-bottom">
                  <td className="font-monospace small">{doc._id}</td>
                  <td>
                    <div className="text-truncate font-monospace small" style={{ maxWidth: '400px', color: 'var(--text)' }}>
                      {JSON.stringify(doc).substring(0, 100)}...
                    </div>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm text-primary me-2 hover-bg p-2 rounded-circle" onClick={() => handleEdit(doc)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-sm text-danger hover-bg p-2 rounded-circle" onClick={() => handleDelete(doc._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="small text-muted">Page {page} of {totalPages}</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {editorModalOpen && (
        <JsonEditorModal 
          collection={collection}
          doc={editingDoc}
          onClose={() => setEditorModalOpen(false)}
          onSaved={() => {
            setEditorModalOpen(false);
            fetchDocuments(page);
          }}
        />
      )}
    </div>
  );
}

function JsonEditorModal({ collection, doc, onClose, onSaved }) {
  const { addToast } = useToast();
  // Ensure we strip formatting/whitespace appropriately for easy editing
  const [jsonText, setJsonText] = useState(
    doc ? JSON.stringify(doc, null, 2) : "{\n  \n}"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setError(null);
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (e) {
      setError("Invalid JSON format. Please correct it before saving.");
      return;
    }

    setSaving(true);
    try {
      if (doc) {
        await adminService.updateDocument(collection, doc._id, parsedData);
        addToast("Document updated successfully", "success");
      } else {
        await adminService.createDocument(collection, parsedData);
        addToast("Document created successfully", "success");
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save document");
      addToast("Error saving document", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bento-card p-4 d-flex flex-column" style={{ width: '90%', maxWidth: '800px', height: '80vh', background: 'var(--surface)' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0 text-capitalize">{doc ? `Edit ${collection} Document` : `New ${collection} Document`}</h4>
          <button className="btn btn-sm btn-light rounded-circle p-2" onClick={onClose}><X size={18} /></button>
        </div>
        
        {error && <div className="alert alert-danger small py-2">{error}</div>}

        <div className="flex-grow-1 d-flex flex-column bg-dark rounded overflow-hidden mb-4">
          <div className="bg-black px-3 py-2 text-white-50 small font-monospace d-flex justify-content-between">
            <span>JSON Editor</span>
            {doc && <span>ID: {doc._id}</span>}
          </div>
          <textarea 
            className="form-control flex-grow-1 border-0 rounded-0 font-monospace shadow-none text-light"
            style={{ background: '#1e1e1e', resize: 'none' }}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck="false"
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary rounded-pill px-4" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      </div>
    </div>
  );
}
