import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: "⌂",
      path: "/dashboard",
    },
    {
      label: "Audiences",
      icon: "♟",
      path: "/audiences",
    },
    {
      label: "Campaigns",
      icon: "✦",
      path: "/campaigns",
    },
    {
      label: "Translations",
      icon: "文",
      path: "/translations",
    },
    {
      label: "Messages",
      icon: "✉",
      path: "/messages",
    },
    {
      label: "Analytics",
      icon: "📊",
      path: "/analytics",
    },
  ];

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          width: collapsed ? "82px" : "245px",
        }}
      >
        {/* LOGO */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>AI</div>

          {!collapsed && (
            <div>
              <div style={styles.logoTitle}>LinguaAI</div>

              <div style={styles.logoSubtitle}>
                Communication Platform
              </div>
            </div>
          )}
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={styles.collapseButton}
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? "›" : "‹"}
        </button>

        {/* NAVIGATION */}
        <div style={styles.navigation}>
          {!collapsed && (
            <div style={styles.navLabel}>
              MAIN MENU
            </div>
          )}

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive
                  ? styles.activeNavItem
                  : {}),
                justifyContent: collapsed
                  ? "center"
                  : "flex-start",
              })}
              title={
                collapsed
                  ? item.label
                  : ""
              }
            >
              <span
                style={{
                  ...styles.navIcon,
                  ...(collapsed
                    ? { marginRight: 0 }
                    : {}),
                }}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* BOTTOM */}
        <div style={styles.sidebarBottom}>
          {!collapsed && (
            <div style={styles.helpCard}>
              <div style={styles.helpIcon}>
                ?
              </div>

              <div>
                <div style={styles.helpTitle}>
                  Need help?
                </div>

                <div style={styles.helpText}>
                  Manage your platform
                </div>
              </div>
            </div>
          )}

          {/* USER CARD */}
          <div
            style={{
              ...styles.userCard,
              justifyContent: collapsed
                ? "center"
                : "flex-start",
            }}
          >
            <div style={styles.avatar}>
              {user.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            {!collapsed && (
              <div style={styles.userInfo}>
                <div style={styles.userName}>
                  {user.name ||
                    "Admin User"}
                </div>

                <div style={styles.userRole}>
                  {user.role ||
                    "Administrator"}
                </div>
              </div>
            )}
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutButton,
              justifyContent: collapsed
                ? "center"
                : "flex-start",
            }}
            title="Logout"
          >
            <span>↪</span>

            {!collapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          ...styles.main,
          marginLeft: collapsed
            ? "82px"
            : "245px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#f5f7fb",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    background:
      "linear-gradient(180deg, #11152b 0%, #171b38 100%)",
    color: "#fff",
    padding: "24px 14px",
    boxSizing: "border-box",
    transition: "width 0.25s ease",
    boxShadow:
      "8px 0 30px rgba(15,23,42,0.12)",
    display: "flex",
    flexDirection: "column",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "2px 9px",
    marginBottom: "28px",
  },

  logoIcon: {
    width: "43px",
    height: "43px",
    flexShrink: 0,
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "13px",
    boxShadow:
      "0 8px 20px rgba(99,102,241,0.35)",
  },

  logoTitle: {
    fontSize: "17px",
    fontWeight: "800",
    letterSpacing: "-0.3px",
  },

  logoSubtitle: {
    marginTop: "2px",
    fontSize: "8px",
    color: "#9ca3c7",
    whiteSpace: "nowrap",
  },

  collapseButton: {
    position: "absolute",
    top: "79px",
    right: "-11px",
    width: "23px",
    height: "23px",
    borderRadius: "50%",
    border: "3px solid #f5f7fb",
    background: "#6366f1",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    padding: 0,
  },

  navigation: {
    flex: 1,
  },

  navLabel: {
    color: "#6f769c",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1.2px",
    padding: "0 12px",
    marginBottom: "10px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px 12px",
    marginBottom: "5px",
    borderRadius: "11px",
    color: "#aeb4d0",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },

  activeNavItem: {
    background:
      "linear-gradient(135deg, #4f46e5, #6d5dfc)",
    color: "#fff",
    boxShadow:
      "0 8px 18px rgba(79,70,229,0.25)",
  },

  navIcon: {
    width: "25px",
    height: "25px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    marginRight: "1px",
  },

  sidebarBottom: {
    borderTop:
      "1px solid rgba(255,255,255,0.07)",
    paddingTop: "15px",
  },

  helpCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px",
    marginBottom: "14px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(139,92,246,0.08))",
    border:
      "1px solid rgba(129,140,248,0.12)",
  },

  helpIcon: {
    width: "27px",
    height: "27px",
    borderRadius: "8px",
    background: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "12px",
  },

  helpTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#e5e7ff",
  },

  helpText: {
    marginTop: "2px",
    fontSize: "8px",
    color: "#858cab",
  },

  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px",
    marginBottom: "7px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    flexShrink: 0,
    borderRadius: "11px",
    background:
      "linear-gradient(135deg, #f59e0b, #f97316)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "800",
  },

  userInfo: {
    minWidth: 0,
  },

  userName: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#f1f5f9",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "150px",
  },

  userRole: {
    marginTop: "2px",
    fontSize: "8px",
    color: "#858cab",
    textTransform: "capitalize",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#8e95b3",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "9px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "600",
  },

  main: {
    minHeight: "100vh",
    transition:
      "margin-left 0.25s ease",
  },
};

export default Layout;