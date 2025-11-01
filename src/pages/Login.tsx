import { useState } from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("r@example.com");
  const [password, setPassword] = useState("StrongPass123");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 380, margin: "32px auto", display: "grid", gap: 10 }}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      <div><Link to="/signup">No account? Sign up</Link></div>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </form>
  );
}
