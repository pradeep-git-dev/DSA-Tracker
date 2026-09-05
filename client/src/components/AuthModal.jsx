import React, { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";

export default function AuthModal({ mode, setMode, onClose }) {
  const { login, register } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form);
    try {
      if (mode === "register") await register(payload);
      else await login(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}><X size={16} /></button>
        <form className="auth-card" onSubmit={submit} style={{ border: "none", boxShadow: "none", padding: 0, margin: 0 }}>
          <div className="segmented">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
              Sign up
            </button>
          </div>

          {mode === "register" && <input name="name" placeholder="Full name" minLength={2} required />}
          <input name="email" type="email" placeholder="Email" required />
          {mode === "register" && (
            <input
              name="leetcodeUsername"
              placeholder="LeetCode username"
              pattern="^[A-Za-z0-9_-]+$"
              title="Only letters, numbers, underscores, and hyphens allowed"
              required
            />
          )}
          <input
            name="password"
            type="password"
            placeholder={mode === "register" ? "Strong password" : "Password"}
            minLength={mode === "register" ? 10 : 1}
            required
          />
          {mode === "register" && (
            <small>Password needs 10+ chars with uppercase, lowercase, number, and symbol.</small>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary-action" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Working..." : mode === "register" ? "Create secure account" : "Enter dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
