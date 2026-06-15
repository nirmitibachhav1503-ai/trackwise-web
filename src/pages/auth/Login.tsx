import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  useEffect(() => {
    if (pendingRole && user) {
      navigate(pendingRole === "Admin" ? "/admin/dashboard" : "/employee/dashboard");
    }
  }, [user, pendingRole, navigate]);

  const handleLogin = async () => {
    if (!employeeCode || !password) {
      toast.error("Please enter employee code and password");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/api/Auth/login", { employeeCode, password });
      const token = response.data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userData = {
        userId: parseInt(payload.UserId),
        fullName: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      };
      login(token, userData);
      toast.success("Login Successful");
      setPendingRole(userData.role);
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#eef1f6",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        display: "flex", width: "100%", maxWidth: "900px",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)", background: "#fff"
      }}>

        {/* Left Panel */}
        <div style={{
          width: "340px", flexShrink: 0, position: "relative",
          background: "linear-gradient(160deg, #1a3a6b 0%, #1e5cb3 100%)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "40px 32px", minHeight: "580px"
        }}>
          {/* Office background image overlay */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80')`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.25
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: "20px" }}>
              <circle cx="24" cy="16" r="8" stroke="white" strokeWidth="2.5" fill="none" />
              <circle cx="12" cy="20" r="5" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="36" cy="20" r="5" stroke="white" strokeWidth="2" fill="none" />
              <path d="M2 40c0-6 4-10 10-10h24c6 0 10 4 10 10" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M7 40c0-4 2.5-7 7-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M41 40c0-4-2.5-7-7-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>

            <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "28px", lineHeight: 1.2, marginBottom: "12px" }}>
              EMPLOYEE<br />LOGIN
            </h2>
            <div style={{ width: "32px", height: "3px", background: "#fff", marginBottom: "20px", borderRadius: "2px" }} />
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Welcome back!</p>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
              Please sign in to your account<br />to continue
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ flex: 1, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: "#1a3a6b", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "26px", marginBottom: "10px"
            }}>⏱</div>
            <div style={{ fontWeight: 800, fontSize: "13px", color: "#1a3a6b", letterSpacing: "3px" }}>TRACKWISE</div>
            <div style={{ fontWeight: 600, fontSize: "11px", color: "#1e5cb3", letterSpacing: "2px" }}>SOLUTIONS</div>
          </div>

          <h4 style={{ fontWeight: 700, fontSize: "22px", textAlign: "center", marginBottom: "4px", color: "#1a1a2e" }}>
            Employee Login
          </h4>
          <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginBottom: "28px" }}>
            Enter your credentials to access your account
          </p>

          {/* Employee Code */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e", display: "block", marginBottom: "8px" }}>
              Employee ID
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: "16px" }}>👤</span>
              <input
                className="form-control"
                placeholder="Enter your employee ID"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{
                  paddingLeft: "42px", height: "48px", borderRadius: "10px",
                  border: "1.5px solid #e0e0e0", fontSize: "14px"
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e", display: "block", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: "16px" }}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{
                  paddingLeft: "42px", paddingRight: "44px", height: "48px",
                  borderRadius: "10px", border: "1.5px solid #e0e0e0", fontSize: "14px"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "16px", padding: 0
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#555", cursor: "pointer" }}>
              <input type="checkbox" style={{ width: "15px", height: "15px" }} />
              Remember me
            </label>
            <span style={{ fontSize: "13px", color: "#1e5cb3", fontWeight: 600, cursor: "pointer" }}>
              Forgot Password?
            </span>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", height: "48px", background: "#1e5cb3", color: "#fff",
              border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer", marginBottom: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm" /> Signing in...</>
            ) : (
              <><span>🔒</span> Sign In</>
            )}
          </button>

          {/* OR divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
            <span style={{ fontSize: "12px", color: "#aaa", fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }} />
          </div>

          {/* SSO Button */}
          <button style={{
            width: "100%", height: "48px", background: "#fff", color: "#1e5cb3",
            border: "1.5px solid #1e5cb3", borderRadius: "10px", fontWeight: 600,
            fontSize: "14px", cursor: "pointer", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}>
            <span>🏢</span> Sign in with SSO
          </button>

          {/* Secure Login badge */}
          <div style={{
            background: "#f0f4ff", borderRadius: "10px", padding: "12px 16px",
            display: "flex", alignItems: "center", gap: "12px"
          }}>
            <span style={{ fontSize: "20px", color: "#1e5cb3" }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e5cb3" }}>Secure Login</div>
              <div style={{ fontSize: "12px", color: "#888" }}>Your information is protected and secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: "16px", width: "100%", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
          © {new Date().getFullYear()} TrackWise Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
