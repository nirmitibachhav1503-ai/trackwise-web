import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin/manager-dashboard", label: "Manager Dashboard", icon: "🏠" },
  { to: "/admin/dashboard", label: "Attendance Dashboard", icon: "📊" },
  { to: "/admin/assign-task", label: "Assign Task", icon: "📝" },
  { to: "/admin/tasks", label: "Tasks", icon: "✅" },
  { to: "/admin/employees", label: "Employees", icon: "👥" },
  { to: "/admin/managers", label: "Managers", icon: "👨‍💼" },
  { to: "/admin/holidays", label: "Holidays", icon: "📅" },
  { to: "/admin/daily-report", label: "Daily Report", icon: "📋" },
  { to: "/admin/weekly-report", label: "Weekly Report", icon: "📊" },
  { to: "/admin/monthly-report", label: "Monthly Report", icon: "📈" },
  { to: "/admin/analytics", label: "Employee Analytics", icon: "🔍" },
];

const managerLinks = [
  { to: "/manager/task-dashboard", label: "Task Dashboard", icon: "📊" },
  { to: "/manager/assign-task", label: "Assign Task", icon: "📝" },
  { to: "/manager/tasks", label: "Tasks", icon: "✅" },
];

const employeeLinks = [
  { to: "/employee/dashboard",     label: "Dashboard",     icon: "🏠" },
  { to: "/employee/time-entry",     label: "Time Entry",    icon: "⏱" },
  { to: "/employee/daily-report",   label: "Daily Report",  icon: "📋" },
  { to: "/employee/weekly-report",  label: "Weekly Report", icon: "📊" },
  { to: "/employee/monthly-report", label: "Monthly Report",icon: "📈" },
  { to: "/employee/my-tasks",       label: "My Tasks",      icon: "✅" },
];

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const links = user?.role === "Admin" ? adminLinks : user?.role === "Manager" ? managerLinks : employeeLinks;

  return (
    <div style={{
      width: "240px", minHeight: "100vh", flexShrink: 0,
      background: "#1e2a3a", display: "flex", flexDirection: "column"
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "#1a73e8", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px"
          }}>⏱</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "18px" }}>TrackWise</span>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{
          background: "#1a73e8", color: "#fff", fontSize: "11px",
          fontWeight: 600, padding: "3px 10px", borderRadius: "20px"
        }}>
          {user?.role?.toUpperCase()}
        </span>
      </div>

      {/* Nav Links */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        {links.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "4px",
                textDecoration: "none", fontSize: "14px", fontWeight: active ? 600 : 400,
                background: active ? "rgba(26,115,232,0.2)" : "transparent",
                color: active ? "#5ba4f5" : "rgba(255,255,255,0.7)",
                transition: "all 0.15s"
              }}
            >
              <span style={{ fontSize: "16px" }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
