// src/pages/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("All fields required"); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill demo credentials
  const fillAdmin  = () => setForm({ email: "admin@teamflow.com", password: "admin123" });
  const fillMember = () => setForm({ email: "member@teamflow.com", password: "member123" });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Task<span>Tracker</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your workspace</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        {/* Demo credentials helper */}
        <div style={{ marginTop: "1.25rem", padding: "0.875rem", background: "var(--bg-3)", borderRadius: "var(--r-sm)", fontSize: "0.8rem" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-2)" }}>Demo accounts:</div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost btn-sm" onClick={fillAdmin}>Fill Admin</button>
            <button className="btn btn-ghost btn-sm" onClick={fillMember}>Fill Member</button>
          </div>
        </div>

        <p className="auth-switch">
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
