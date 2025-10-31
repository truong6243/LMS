import { useState } from "react";

export default function Login({ onLogin, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (error) {
      // lỗi đã set ở App
      console.error(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", border: "1px solid #ddd", padding: 20, borderRadius: 4 }}>
      <h2>Đăng nhập</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Tài khoản</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%" }}
            placeholder="Nhập tài khoản"
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
            placeholder="Nhập mật khẩu"
          />
        </div>
        <button disabled={loading} style={{ width: "100%", padding: 8 }}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
