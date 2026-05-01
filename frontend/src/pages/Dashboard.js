// src/pages/Dashboard.js — Summary stats + recent tasks
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { format, isPast } from "date-fns";

const StatusBadge = ({ status, dueDate }) => {
  const overdue = dueDate && status !== "Done" && isPast(new Date(dueDate));
  if (overdue) return <span className="badge badge-overdue">⚠ Overdue</span>;
  const map = { "Todo": "badge-todo", "In-Progress": "badge-inprogress", "Done": "badge-done" };
  return <span className={`badge ${map[status] || "badge-todo"}`}>{status}</span>;
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats,  setStats]  = useState(null);
  const [tasks,  setTasks]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get("/tasks/dashboard"),
          api.get("/tasks?limit=10"),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const statCards = [
    { label: "Total Tasks",      value: stats?.total     || 0, cls: "total",   icon: "📋" },
    { label: "Completed",        value: stats?.completed  || 0, cls: "done",    icon: "✅" },
    { label: "Pending",          value: stats?.todo       || 0, cls: "pending", icon: "⏳" },
    { label: "Overdue",          value: stats?.overdue    || 0, cls: "overdue", icon: "🚨" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong> · {isAdmin ? "Admin View" : "Member View"}
          </p>
        </div>
        {isAdmin && (
          <Link to="/tasks" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Task
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {/* In-Progress indicator */}
      {stats?.inProgress > 0 && (
        <div style={{ marginBottom: "1.5rem", padding: "0.75rem 1.25rem", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: "#60a5fa", fontSize: "0.85rem" }}>🔄 <strong>{stats.inProgress}</strong> task{stats.inProgress !== 1 ? "s" : ""} currently in progress</span>
        </div>
      )}

      {/* Recent Tasks */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Recent Tasks</h2>
        <Link to="/tasks" style={{ fontSize: "0.85rem", color: "var(--accent-2)" }}>View all →</Link>
      </div>

      {tasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <h3>No tasks yet</h3>
          <p>{isAdmin ? "Create your first task from the Tasks page." : "You have no tasks assigned yet."}</p>
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
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td><span style={{ fontWeight: 600 }}>{t.title}</span></td>
                  <td><span className="text-muted text-sm">{t.project?.name || "—"}</span></td>
                  <td>
                    {t.assignedTo ? (
                      <span className="flex items-center gap-2">
                        <span className="avatar sm">{t.assignedTo.name?.[0]?.toUpperCase()}</span>
                        <span className="text-sm">{t.assignedTo.name}</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td>
                    <span className="text-sm text-muted">
                      {t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "—"}
                    </span>
                  </td>
                  <td><StatusBadge status={t.status} dueDate={t.dueDate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
