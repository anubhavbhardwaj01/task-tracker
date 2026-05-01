// src/pages/Tasks.js — Task list with filters, create, edit, delete
import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { format, isPast } from "date-fns";

// ── Status badge ──────────────────────────────────────────────
const StatusBadge = ({ status, dueDate }) => {
  const overdue = dueDate && status !== "Done" && isPast(new Date(dueDate));
  if (overdue) return <span className="badge badge-overdue">⚠ Overdue</span>;
  const map = { "Todo": "badge-todo", "In-Progress": "badge-inprogress", "Done": "badge-done" };
  return <span className={`badge ${map[status] || "badge-todo"}`}>{status}</span>;
};

// ── Task Form Modal ───────────────────────────────────────────
function TaskModal({ task, projects, users, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    status:      task?.status      || "Todo",
    dueDate:     task?.dueDate     ? task.dueDate.slice(0, 10) : "",
    project:     task?.project?._id || "",
    assignedTo:  task?.assignedTo?._id || "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.project) { setError("Title and project are required"); return; }
    setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
      if (task?._id) {
        const { data } = await api.put(`/tasks/${task._id}`, payload);
        onSaved(data, "edit");
      } else {
        const { data } = await api.post("/tasks", payload);
        onSaved(data, "add");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? "Edit Task" : "New Task"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details..." />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Todo">Todo</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (task ? "Save Changes" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status Quick-Update Modal (Member) ───────────────────────
function StatusModal({ task, onClose, onSaved }) {
  const [status,  setStatus]  = useState(task.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status });
      onSaved(data, "edit");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 340 }}>
        <div className="modal-header">
          <h2 className="modal-title">Update Status</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: "1rem" }}>{task.title}</p>
        <div className="form-group">
          <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Todo">Todo</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner" /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);    // null | "create" | task obj
  const [statusModal, setStatusModal] = useState(null);

  // Filters
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterUser,    setFilterUser]    = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)  params.append("status",     filterStatus);
      if (filterProject) params.append("project",    filterProject);
      if (filterUser)    params.append("assignedTo", filterUser);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus, filterProject, filterUser]);

  useEffect(() => {
    const loadMeta = async () => {
      const [pRes] = await Promise.all([api.get("/projects")]);
      setProjects(pRes.data);
      if (isAdmin) {
        const uRes = await api.get("/users");
        setUsers(uRes.data);
      }
    };
    loadMeta();
  }, [isAdmin]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSaved = (saved, op) => {
    setTasks((prev) =>
      op === "add" ? [saved, ...prev] : prev.map((t) => (t._id === saved._id ? saved : t))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? "s" : ""} found</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Done">Done</option>
        </select>
        <select className="form-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        {isAdmin && (
          <select className="form-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All Members</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}
        {(filterStatus || filterProject || filterUser) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(""); setFilterProject(""); setFilterUser(""); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-page" style={{ minHeight: "300px" }}><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h3>No tasks found</h3>
          <p>{isAdmin ? "Create a task or adjust your filters." : "No tasks match the filters."}</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const overdue = t.dueDate && t.status !== "Done" && isPast(new Date(t.dueDate));
                return (
                  <tr key={t._id} style={overdue ? { borderLeft: "3px solid var(--red)" } : {}}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      {t.description && <div className="text-xs" style={{ marginTop: "0.2rem", maxWidth: 240 }}>{t.description.slice(0, 60)}{t.description.length > 60 ? "…" : ""}</div>}
                    </td>
                    <td><span className="text-sm text-muted">{t.project?.name || "—"}</span></td>
                    <td>
                      {t.assignedTo ? (
                        <span className="flex items-center gap-2">
                          <span className="avatar sm">{t.assignedTo.name?.[0]?.toUpperCase()}</span>
                          <span className="text-sm">{t.assignedTo.name}</span>
                        </span>
                      ) : <span className="text-xs">Unassigned</span>}
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: overdue ? "var(--red)" : "var(--text-2)" }}>
                        {t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "—"}
                      </span>
                    </td>
                    <td><StatusBadge status={t.status} dueDate={t.dueDate} /></td>
                    <td>
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(t)} title="Edit">✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)} title="Delete">🗑</button>
                          </>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => setStatusModal(t)}>
                            Update Status
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin task modal */}
      {modal && (
        <TaskModal
          task={modal === "create" ? null : modal}
          projects={projects}
          users={users}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Member status modal */}
      {statusModal && (
        <StatusModal
          task={statusModal}
          onClose={() => setStatusModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
