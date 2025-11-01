import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
export default function SignIn() {
  const { signin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await signin(email, password);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6 grid gap-3">
      <h2 className="text-xl font-semibold">تسجيل الدخول</h2>
      <input className="border p-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input className="border p-2" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" />
      <button className="bg-blue-600 text-white py-2 rounded">دخول</button>
      {err && <div className="text-red-600">{err}</div>}
    </form>
  );
}
