// src/pages/Users.js — Team member management (Admin only)
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { format } from "date-fns";

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users")
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this user from the system?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">{users.length} user{users.length !== 1 ? "s" : ""} registered</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👤</div>
          <h3>No users yet</h3>
          <p>Users who sign up will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="avatar">{u.name?.[0]?.toUpperCase()}</span>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </span>
                  </td>
                  <td><span className="text-muted text-sm">{u.email}</span></td>
                  <td>
                    <span className={`badge ${u.role === "ADMIN" ? "badge-admin" : "badge-member"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td><span className="text-xs">{format(new Date(u.createdAt), "MMM d, yyyy")}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
