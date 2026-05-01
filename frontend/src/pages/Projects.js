// src/pages/Projects.js — Project list + create/edit/delete
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

// ── Project Form Modal ────────────────────────────────────────
function ProjectModal({ project, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:        project?.name        || "",
    description: project?.description || "",
    members:     project?.members?.map((m) => m._id) || [],
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMember = (id) =>
    setForm((f) => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Project name is required"); return; }
    setLoading(true);
    try {
      if (project?._id) {
        const { data } = await api.put(`/projects/${project._id}`, form);
        onSaved(data, "edit");
      } else {
        const { data } = await api.post("/projects", form);
        onSaved(data, "add");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? "Edit Project" : "New Project"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief project description..." />
          </div>
          <div className="form-group">
            <label className="form-label">Team Members</label>
            <div className="member-select-list">
              {users.map((u) => (
                <label key={u._id} className="member-select-item">
                  <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} />
                  <span className="avatar sm">{u.name?.[0]?.toUpperCase()}</span>
                  <span>{u.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-3)" }}>{u.email}</span>
                </label>
              ))}
              {users.length === 0 && <span style={{ color: "var(--text-3)", fontSize: "0.85rem", padding: "0.25rem" }}>No members available</span>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (project ? "Save Changes" : "Create Project")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | "create" | project obj

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes] = await Promise.all([api.get("/projects")]);
        setProjects(pRes.data);
        if (isAdmin) {
          const uRes = await api.get("/users");
          setUsers(uRes.data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const handleSaved = (saved, op) => {
    setProjects((prev) =>
      op === "add" ? [saved, ...prev] : prev.map((p) => (p._id === saved._id ? saved : p))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>{isAdmin ? "Create your first project to get started." : "You haven't been added to any projects."}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p._id} className="project-card">
              <div className="project-card-header">
                <h3 className="project-name">{p.name}</h3>
                {isAdmin && (
                  <div className="project-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)} title="Edit">✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)} title="Delete">🗑</button>
                  </div>
                )}
              </div>

              <p className="project-desc">{p.description || "No description provided."}</p>

              <div className="project-meta">
                <span>Created {format(new Date(p.createdAt), "MMM d, yyyy")}</span>
                <span className="project-members">
                  <div className="member-avatars">
                    {p.members.slice(0, 4).map((m) => (
                      <div key={m._id} className="avatar sm" title={m.name}>
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  {p.members.length > 0
                    ? `${p.members.length} member${p.members.length !== 1 ? "s" : ""}`
                    : "No members"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal === "create" ? null : modal}
          users={users}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
