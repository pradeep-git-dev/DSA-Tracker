import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function LeetcodeSync({ current, onSync }) {
  const [username, setUsername] = useState(current || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setUsername(current || ""), [current]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSync(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="sync-card" onSubmit={submit}>
      <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="LeetCode username" required />
      <button disabled={busy}>
        <RefreshCw size={16} /> {busy ? "Syncing" : "Sync"}
      </button>
      {error && <small className="error">{error}</small>}
    </form>
  );
}
