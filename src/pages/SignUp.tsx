import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function SignUp() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({
    full_name: "", email: "", phone: "", password: "",
    national_id: "", gender: "female", age: 22,
    skills: [] as string[], interests: [] as string[],
  });
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await signup(f);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(typeof e?.response?.data === "string" ? e.response.data : "Signup failed");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto p-6 grid gap-3">
      <h2 className="text-xl font-semibold">إنشاء حساب</h2>
      <input className="border p-2" placeholder="Full name" value={f.full_name} onChange={e=>set("full_name", e.target.value)} />
      <input className="border p-2" placeholder="Email" value={f.email} onChange={e=>set("email", e.target.value)} />
      <input className="border p-2" placeholder="Phone" value={f.phone} onChange={e=>set("phone", e.target.value)} />
      <input className="border p-2" placeholder="Password" type="password" value={f.password} onChange={e=>set("password", e.target.value)} />
      <input className="border p-2" placeholder="National ID" value={f.national_id} onChange={e=>set("national_id", e.target.value)} />
      <input className="border p-2" placeholder="Age" type="number" value={f.age} onChange={e=>set("age", Number(e.target.value))} />
      <button className="bg-green-600 text-white py-2 rounded">إنشاء الحساب</button>
      {err && <div className="text-red-600">{err}</div>}
    </form>
  );
}
