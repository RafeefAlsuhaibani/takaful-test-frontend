import { useAuth } from "../AuthContext";

export default function Home() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 16 }}>
      <h1>Takaful</h1>
      <p>Welcome, {user?.first_name || user?.email}!</p>
      <h3>/me</h3>
      <pre style={{ background: "#f6f6f6", padding: 12 }}>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
