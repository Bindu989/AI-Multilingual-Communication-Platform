import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [stats, setStats] = useState({
    audiences: 0,
    campaigns: 0,
    messages: 0,
    translations: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        audiencesResponse,
        campaignsResponse,
        messagesResponse,
        translationsResponse,
      ] = await Promise.all([
        api.get("/audiences"),
        api.get("/campaigns"),
        api.get("/messages"),
        api.get("/translations"),
      ]);

      setStats({
        audiences:
          audiencesResponse.data?.count ??
          audiencesResponse.data?.audiences?.length ??
          0,

        campaigns:
          campaignsResponse.data?.count ??
          campaignsResponse.data?.campaigns?.length ??
          0,

        messages:
          messagesResponse.data?.count ??
          messagesResponse.data?.messages?.length ??
          0,

        translations:
          translationsResponse.data?.count ??
          translationsResponse.data?.translations?.length ??
          0,
      });
    } catch (error) {
      console.error(
        "Dashboard data loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const firstLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : "A";

  return (
    <div style={styles.page}>

      {/* ================= TOP HEADER ================= */}
      <div style={styles.topHeader}>
        <div>
          <div style={styles.breadcrumb}>
            Overview / Dashboard
          </div>

          <h1 style={styles.pageTitle}>
            Dashboard
          </h1>
        </div>

        {/* USER */}
        <div style={styles.headerUser}>
          <div style={styles.headerAvatar}>
            {firstLetter}
          </div>

          <div>
            <div style={styles.headerUserName}>
              {user.name || "Admin User"}
            </div>

            <div style={styles.headerUserRole}>
              {user.role || "Admin"}
            </div>
          </div>
        </div>
      </div>

      {/* ================= WELCOME BANNER ================= */}
      <section style={styles.welcomeBanner}>
        <div style={styles.welcomeContent}>
          <div style={styles.welcomeSmall}>
            WELCOME BACK 👋
          </div>

          <h2 style={styles.welcomeTitle}>
            Hello, {user.name || "Admin User"}!
          </h2>

          <p style={styles.welcomeText}>
            Manage your multilingual communication
            campaigns from one place.
          </p>
        </div>

        <div style={styles.globe}>
          🌍
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section style={styles.statsGrid}>

        {/* AUDIENCES */}
        <div style={styles.statCard}>
          <div style={styles.statIconPurple}>
            👥
          </div>

          <div style={styles.statContent}>
            <div style={styles.statLabel}>
              Total Audiences
            </div>

            <div style={styles.statNumber}>
              {loading ? "..." : stats.audiences}
            </div>

            <div style={styles.statDescription}>
              Active audience groups
            </div>
          </div>
        </div>

        {/* CAMPAIGNS */}
        <div style={styles.statCard}>
          <div style={styles.statIconPink}>
            📣
          </div>

          <div style={styles.statContent}>
            <div style={styles.statLabel}>
              Campaigns
            </div>

            <div style={styles.statNumber}>
              {loading ? "..." : stats.campaigns}
            </div>

            <div style={styles.statDescription}>
              Campaigns created
            </div>
          </div>
        </div>

        {/* MESSAGES */}
        <div style={styles.statCard}>
          <div style={styles.statIconBlue}>
            💬
          </div>

          <div style={styles.statContent}>
            <div style={styles.statLabel}>
              Messages
            </div>

            <div style={styles.statNumber}>
              {loading ? "..." : stats.messages}
            </div>

            <div style={styles.statDescription}>
              Messages sent
            </div>
          </div>
        </div>

        {/* TRANSLATIONS */}
        <div style={styles.statCard}>
          <div style={styles.statIconCyan}>
            🌐
          </div>

          <div style={styles.statContent}>
            <div style={styles.statLabel}>
              Translations
            </div>

            <div style={styles.statNumber}>
              {loading ? "..." : stats.translations}
            </div>

            <div style={styles.statDescription}>
              Completed translations
            </div>
          </div>
        </div>

      </section>

      {/* ================= COMMUNICATION MODULES ================= */}
      <section style={styles.modulesSection}>

        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Communication Modules
            </h2>

            <p style={styles.sectionSubtitle}>
              Manage every part of your communication
              workflow.
            </p>
          </div>
        </div>

        <div style={styles.moduleGrid}>

          {/* AUDIENCES */}
          <div
            style={styles.moduleCard}
            onClick={() => {
              window.location.href = "/audiences";
            }}
          >
            <div style={styles.moduleIconPurple}>
              👥
            </div>

            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitle}>
                Audiences
              </h3>

              <p style={styles.moduleText}>
                Create and segment communication
                audiences.
              </p>
            </div>

            <div style={styles.arrow}>
              →
            </div>
          </div>

          {/* CAMPAIGNS */}
          <div
            style={styles.moduleCard}
            onClick={() => {
              window.location.href = "/campaigns";
            }}
          >
            <div style={styles.moduleIconPink}>
              📣
            </div>

            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitle}>
                Campaigns
              </h3>

              <p style={styles.moduleText}>
                Create and manage multilingual
                campaigns.
              </p>
            </div>

            <div style={styles.arrow}>
              →
            </div>
          </div>

          {/* TRANSLATIONS */}
          <div
            style={styles.moduleCard}
            onClick={() => {
              window.location.href = "/translations";
            }}
          >
            <div style={styles.moduleIconBlue}>
              🌐
            </div>

            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitle}>
                AI Translation
              </h3>

              <p style={styles.moduleText}>
                Translate communication into
                multiple languages.
              </p>
            </div>

            <div style={styles.arrow}>
              →
            </div>
          </div>

          {/* MESSAGES */}
          <div
            style={styles.moduleCard}
            onClick={() => {
              window.location.href = "/messages";
            }}
          >
            <div style={styles.moduleIconCyan}>
              💬
            </div>

            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitle}>
                Messages
              </h3>

              <p style={styles.moduleText}>
                Track message delivery and
                communication status.
              </p>
            </div>

            <div style={styles.arrow}>
              →
            </div>
          </div>

        </div>
      </section>

      {/* ================= QUICK OVERVIEW ================= */}
      <section style={styles.overviewSection}>

        <div style={styles.overviewCard}>
          <div style={styles.overviewIcon}>
            ✦
          </div>

          <div>
            <h3 style={styles.overviewTitle}>
              Multilingual Communication
            </h3>

            <p style={styles.overviewText}>
              Reach your audience in their preferred
              language using AI-powered translation
              and targeted communication.
            </p>
          </div>
        </div>

        <div style={styles.overviewCard}>
          <div style={styles.overviewIcon}>
            ⚡
          </div>

          <div>
            <h3 style={styles.overviewTitle}>
              Smart Campaign Management
            </h3>

            <p style={styles.overviewText}>
              Create targeted campaigns, manage
              audiences and monitor communication
              delivery from one platform.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}

/* ================================================= */
/* ===================== STYLES ==================== */
/* ================================================= */

const styles = {

  /* PAGE */
  page: {
    minHeight: "100vh",

    width: "100%",

    boxSizing: "border-box",

    padding: "32px 36px 50px 36px",

    margin: 0,

    background: "#f5f7fb",

    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* TOP HEADER */
  topHeader: {
    width: "100%",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: "28px",
  },

  breadcrumb: {
    fontSize: "13px",

    color: "#94a3b8",

    marginBottom: "6px",

    fontWeight: "500",
  },

  pageTitle: {
    margin: 0,

    fontSize: "30px",

    lineHeight: "1.1",

    color: "#111827",

    fontWeight: "800",

    letterSpacing: "-1px",
  },

  /* HEADER USER */
  headerUser: {
    display: "flex",

    alignItems: "center",

    gap: "12px",

    padding: "10px 18px 10px 10px",

    background: "#ffffff",

    borderRadius: "40px",

    boxShadow:
      "0 8px 25px rgba(15,23,42,0.07)",

    border:
      "1px solid #edf0f6",
  },

  headerAvatar: {
    width: "46px",

    height: "46px",

    borderRadius: "50%",

    background:
      "linear-gradient(135deg, #6366f1, #8b5cf6)",

    color: "#ffffff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "19px",

    fontWeight: "800",

    boxShadow:
      "0 7px 18px rgba(99,102,241,0.25)",
  },

  headerUserName: {
    fontSize: "14px",

    fontWeight: "750",

    color: "#111827",
  },

  headerUserRole: {
    fontSize: "12px",

    color: "#94a3b8",

    marginTop: "4px",

    textTransform: "capitalize",
  },

  /* WELCOME */
  welcomeBanner: {
    position: "relative",

    width: "100%",

    minHeight: "175px",

    boxSizing: "border-box",

    padding: "32px 42px",

    borderRadius: "24px",

    background:
      "linear-gradient(135deg, #4f46e5 0%, #6d28d9 55%, #7c3aed 100%)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    overflow: "hidden",

    boxShadow:
      "0 18px 45px rgba(79,70,229,0.22)",

    marginBottom: "28px",
  },

  welcomeContent: {
    textAlign: "center",

    position: "relative",

    zIndex: 2,

    maxWidth: "700px",
  },

  welcomeSmall: {
    color: "#ddd6fe",

    fontSize: "12px",

    fontWeight: "800",

    letterSpacing: "1.5px",

    marginBottom: "10px",
  },

  welcomeTitle: {
    margin: 0,

    color: "#ffffff",

    fontSize: "31px",

    fontWeight: "800",

    letterSpacing: "-0.8px",
  },

  welcomeText: {
    margin:
      "10px 0 0 0",

    color: "#ede9fe",

    fontSize: "15px",

    lineHeight: "1.7",

    fontWeight: "500",
  },

  globe: {
    position: "absolute",

    right: "48px",

    fontSize: "72px",

    opacity: 0.85,

    filter:
      "drop-shadow(0 8px 15px rgba(0,0,0,0.15))",
  },

  /* STATS */
  statsGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "20px",

    width: "100%",

    marginBottom: "38px",
  },

  statCard: {
    minHeight: "150px",

    background: "#ffffff",

    borderRadius: "20px",

    padding: "22px",

    boxSizing: "border-box",

    display: "flex",

    alignItems: "center",

    gap: "16px",

    border:
      "1px solid #edf0f6",

    boxShadow:
      "0 10px 30px rgba(15,23,42,0.055)",

    transition:
      "transform 0.2s ease, box-shadow 0.2s ease",
  },

  statContent: {
    minWidth: 0,
  },

  statLabel: {
    color: "#64748b",

    fontSize: "13px",

    fontWeight: "600",

    marginBottom: "7px",
  },

  statNumber: {
    color: "#111827",

    fontSize: "30px",

    fontWeight: "800",

    lineHeight: "1",

    marginBottom: "8px",
  },

  statDescription: {
    color: "#94a3b8",

    fontSize: "11px",

    lineHeight: "1.5",
  },

  /* STAT ICONS */
  statIconPurple: {
    width: "50px",

    height: "50px",

    flexShrink: 0,

    borderRadius: "15px",

    background: "#eef2ff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",
  },

  statIconPink: {
    width: "50px",

    height: "50px",

    flexShrink: 0,

    borderRadius: "15px",

    background: "#fdf2f8",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",
  },

  statIconBlue: {
    width: "50px",

    height: "50px",

    flexShrink: 0,

    borderRadius: "15px",

    background: "#eff6ff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",
  },

  statIconCyan: {
    width: "50px",

    height: "50px",

    flexShrink: 0,

    borderRadius: "15px",

    background: "#ecfeff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "22px",
  },

  /* MODULES */
  modulesSection: {
    width: "100%",

    marginBottom: "35px",
  },

  sectionHeader: {
    marginBottom: "20px",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",
  },

  sectionTitle: {
    margin: 0,

    fontSize: "22px",

    color: "#111827",

    fontWeight: "800",

    letterSpacing: "-0.5px",
  },

  sectionSubtitle: {
    margin:
      "7px 0 0 0",

    color: "#64748b",

    fontSize: "13px",
  },

  moduleGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",

    gap: "18px",

    width: "100%",
  },

  moduleCard: {
    position: "relative",

    minHeight: "190px",

    padding: "24px",

    background: "#ffffff",

    borderRadius: "20px",

    border:
      "1px solid #edf0f6",

    boxShadow:
      "0 10px 30px rgba(15,23,42,0.05)",

    cursor: "pointer",

    boxSizing: "border-box",

    transition:
      "transform 0.2s ease, box-shadow 0.2s ease",
  },

  moduleInfo: {
    marginTop: "18px",

    paddingRight: "20px",
  },

  moduleTitle: {
    margin: 0,

    fontSize: "16px",

    fontWeight: "800",

    color: "#111827",
  },

  moduleText: {
    margin:
      "8px 0 0 0",

    color: "#64748b",

    fontSize: "12px",

    lineHeight: "1.6",
  },

  arrow: {
    position: "absolute",

    right: "22px",

    top: "24px",

    fontSize: "20px",

    color: "#94a3b8",
  },

  /* MODULE ICONS */
  moduleIconPurple: {
    width: "52px",

    height: "52px",

    borderRadius: "15px",

    background: "#eef2ff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "23px",
  },

  moduleIconPink: {
    width: "52px",

    height: "52px",

    borderRadius: "15px",

    background: "#fdf2f8",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "23px",
  },

  moduleIconBlue: {
    width: "52px",

    height: "52px",

    borderRadius: "15px",

    background: "#eff6ff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "23px",
  },

  moduleIconCyan: {
    width: "52px",

    height: "52px",

    borderRadius: "15px",

    background: "#ecfeff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "23px",
  },

  /* OVERVIEW */
  overviewSection: {
    display: "grid",

    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",

    gap: "20px",

    width: "100%",
  },

  overviewCard: {
    display: "flex",

    alignItems: "flex-start",

    gap: "16px",

    background: "#ffffff",

    border:
      "1px solid #edf0f6",

    borderRadius: "20px",

    padding: "24px",

    boxShadow:
      "0 10px 30px rgba(15,23,42,0.04)",
  },

  overviewIcon: {
    width: "45px",

    height: "45px",

    flexShrink: 0,

    borderRadius: "13px",

    background:
      "linear-gradient(135deg, #eef2ff, #f5f3ff)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#6366f1",

    fontSize: "19px",

    fontWeight: "800",
  },

  overviewTitle: {
    margin: 0,

    color: "#111827",

    fontSize: "15px",

    fontWeight: "800",
  },

  overviewText: {
    margin:
      "7px 0 0 0",

    color: "#64748b",

    fontSize: "12px",

    lineHeight: "1.7",
  },
};

export default Dashboard;