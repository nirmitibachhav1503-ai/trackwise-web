import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div style={{
      height: "60px", background: "#fff", borderBottom: "1px solid #e8ecf0",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 100
    }}>
      <div>
        <span style={{ fontWeight: 600, color: "#1e2a3a", fontSize: "15px" }}>
          Welcome back, {user?.fullName} 👋
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "#1a73e8", display: "flex", alignItems: "center",
          justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "14px"
        }}>
          {user?.fullName?.charAt(0)}
        </div>
        <button
          onClick={logout}
          style={{
            background: "transparent", border: "1px solid #e0e0e0",
            borderRadius: "8px", padding: "6px 16px", fontSize: "13px",
            color: "#e63946", fontWeight: 600, cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
