import { useEffect, useState } from "react";
import api from "../services/api";

function Analytics() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/analytics"
      );

      setAnalytics(response.data);
    } catch (err) {
      console.error(
        "Analytics fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⟳</div>

          <h2 style={styles.loadingTitle}>
            Loading Analytics
          </h2>

          <p style={styles.loadingText}>
            Gathering communication performance
            data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>

          <h2 style={styles.errorTitle}>
            Unable to load analytics
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchAnalytics}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overview =
    analytics?.overview || {};

  const messageByChannel =
    analytics?.messageByChannel || [];

  const messageByLanguage =
    analytics?.messageByLanguage || [];

  const translationByLanguage =
    analytics?.translationByLanguage || [];

  const campaignPerformance =
    analytics?.campaignPerformance || [];

  const audienceReach =
    analytics?.audienceReach || [];

  const totalCampaigns =
    overview.totalCampaigns || 0;

  const activeCampaigns =
    overview.activeCampaigns || 0;

  const scheduledCampaigns =
    overview.scheduledCampaigns || 0;

  const completedCampaigns =
    overview.completedCampaigns || 0;

  const totalMessages =
    overview.totalMessages || 0;

  const sentMessages =
    overview.sentMessages || 0;

  const deliveredMessages =
    overview.deliveredMessages || 0;

  const pendingMessages =
    overview.pendingMessages || 0;

  const failedMessages =
    overview.failedMessages || 0;

  const totalAudiences =
    overview.totalAudiences || 0;

  const totalRecipients =
    overview.totalRecipients || 0;

  const totalTranslations =
    overview.totalTranslations || 0;

  const deliveryRate =
    parseFloat(
      String(
        overview.deliveryRate || "0"
      ).replace("%", "")
    ) || 0;

  const sentPercentage =
    totalMessages > 0
      ? Math.round(
          (sentMessages /
            totalMessages) *
            100
        )
      : 0;

  const deliveredPercentage =
    totalMessages > 0
      ? Math.round(
          (deliveredMessages /
            totalMessages) *
            100
        )
      : 0;

  const pendingPercentage =
    totalMessages > 0
      ? Math.round(
          (pendingMessages /
            totalMessages) *
            100
        )
      : 0;

  const failedPercentage =
    totalMessages > 0
      ? Math.round(
          (failedMessages /
            totalMessages) *
            100
        )
      : 0;

  return (
    <div style={styles.page}>

      {/* ======================================
          HEADER
      ====================================== */}
      <div style={styles.header}>

        <div>
          <div style={styles.eyebrow}>
            PERFORMANCE INSIGHTS
          </div>

          <h1 style={styles.title}>
            Analytics
          </h1>

          <p style={styles.subtitle}>
            Monitor campaigns, messages,
            translations and communication
            performance.
          </p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.roleBadge}>
            {analytics?.role ||
              user.role ||
              "User"}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            style={styles.refreshButton}
          >
            ↻ Refresh
          </button>
        </div>

      </div>

      {/* ======================================
          OVERVIEW CARDS
      ====================================== */}
      <div style={styles.overviewGrid}>

        <MetricCard
          icon="📢"
          title="Total Campaigns"
          value={totalCampaigns}
          tone="purple"
        />

        <MetricCard
          icon="💬"
          title="Total Messages"
          value={totalMessages}
          tone="blue"
        />

        <MetricCard
          icon="✅"
          title="Delivered"
          value={deliveredMessages}
          tone="green"
        />

        <MetricCard
          icon="📈"
          title="Delivery Rate"
          value={`${deliveryRate.toFixed(
            1
          )}%`}
          tone="orange"
        />

        <MetricCard
          icon="👥"
          title="Total Audiences"
          value={totalAudiences}
          tone="pink"
        />

        <MetricCard
          icon="🌐"
          title="Translations"
          value={totalTranslations}
          tone="indigo"
        />

        <MetricCard
          icon="👤"
          title="Total Recipients"
          value={totalRecipients}
          tone="teal"
        />

        <MetricCard
          icon="✉️"
          title="Sent Messages"
          value={sentMessages}
          tone="cyan"
        />

      </div>

      {/* ======================================
          CAMPAIGN OVERVIEW
      ====================================== */}
      <div style={styles.sectionCard}>

        <SectionHeader
          title="Campaign Overview"
          subtitle="Current campaign lifecycle status"
          icon="📢"
        />

        <div style={styles.statusGrid}>

          <OverviewBox
            icon="🟢"
            title="Active Campaigns"
            value={activeCampaigns}
            background="#ecfdf5"
            color="#059669"
          />

          <OverviewBox
            icon="⏰"
            title="Scheduled Campaigns"
            value={scheduledCampaigns}
            background="#fff7ed"
            color="#ea580c"
          />

          <OverviewBox
            icon="🏆"
            title="Completed Campaigns"
            value={completedCampaigns}
            background="#eef2ff"
            color="#4f46e5"
          />

        </div>

      </div>

      {/* ======================================
          MESSAGE PERFORMANCE
      ====================================== */}
      <div style={styles.sectionCard}>

        <SectionHeader
          title="Message Performance"
          subtitle="Communication delivery status"
          icon="💬"
        />

        <div style={styles.performanceLayout}>

          {/* Progress */}
          <div style={styles.progressPanel}>

            <div
              style={
                styles.progressCircleOuter
              }
            >
              <div
                style={
                  styles.progressCircleInner
                }
              >
                <strong
                  style={
                    styles.progressNumber
                  }
                >
                  {deliveryRate.toFixed(
                    0
                  )}%
                </strong>

                <span
                  style={
                    styles.progressLabel
                  }
                >
                  Delivered
                </span>
              </div>
            </div>

          </div>

          {/* Bars */}
          <div style={styles.breakdownPanel}>

            <PerformanceBar
              label="Sent"
              value={sentMessages}
              percentage={
                sentPercentage
              }
            />

            <PerformanceBar
              label="Delivered"
              value={
                deliveredMessages
              }
              percentage={
                deliveredPercentage
              }
            />

            <PerformanceBar
              label="Pending"
              value={
                pendingMessages
              }
              percentage={
                pendingPercentage
              }
            />

            <PerformanceBar
              label="Failed"
              value={
                failedMessages
              }
              percentage={
                failedPercentage
              }
            />

          </div>

        </div>

      </div>

      {/* ======================================
          CHANNEL + LANGUAGE
      ====================================== */}
      <div style={styles.twoColumnGrid}>

        {/* CHANNEL */}
        <div style={styles.sectionCard}>

          <SectionHeader
            title="Messages by Channel"
            subtitle="Communication channel usage"
            icon="📡"
          />

          <div style={styles.listContent}>

            {messageByChannel.length ===
            0 ? (
              <EmptyMini
                text="No channel data available."
              />
            ) : (
              messageByChannel.map(
                (item) => (
                  <InsightRow
                    key={
                      item._id ||
                      "unknown-channel"
                    }
                    icon={getChannelIcon(
                      item._id
                    )}
                    label={
                      formatLabel(
                        item._id
                      )
                    }
                    value={item.count}
                    total={
                      totalMessages
                    }
                  />
                )
              )
            )}

          </div>

        </div>

        {/* LANGUAGE */}
        <div style={styles.sectionCard}>

          <SectionHeader
            title="Messages by Language"
            subtitle="Language distribution"
            icon="🌐"
          />

          <div style={styles.listContent}>

            {messageByLanguage.length ===
            0 ? (
              <EmptyMini
                text="No language data available."
              />
            ) : (
              messageByLanguage.map(
                (item) => (
                  <InsightRow
                    key={
                      item._id ||
                      "unknown-language"
                    }
                    icon="🌐"
                    label={
                      item._id ||
                      "Unknown"
                    }
                    value={item.count}
                    total={
                      totalMessages
                    }
                  />
                )
              )
            )}

          </div>

        </div>

      </div>

      {/* ======================================
          TRANSLATIONS
      ====================================== */}
      <div style={styles.sectionCard}>

        <SectionHeader
          title="Translations by Language"
          subtitle="Translated content distribution"
          icon="🔤"
        />

        <div
          style={styles.translationGrid}
        >

          {translationByLanguage.length ===
          0 ? (
            <EmptyMini
              text="No translation data available."
            />
          ) : (
            translationByLanguage.map(
              (item) => (
                <div
                  key={
                    item._id ||
                    "unknown-translation"
                  }
                  style={
                    styles.translationCard
                  }
                >
                  <div
                    style={
                      styles.translationIcon
                    }
                  >
                    🌐
                  </div>

                  <div>
                    <div
                      style={
                        styles.translationLanguage
                      }
                    >
                      {item._id ||
                        "Unknown"}
                    </div>

                    <div
                      style={
                        styles.translationCount
                      }
                    >
                      {item.count}{" "}
                      translations
                    </div>
                  </div>
                </div>
              )
            )
          )}

        </div>

      </div>

      {/* ======================================
          CAMPAIGN PERFORMANCE
      ====================================== */}
      <div style={styles.sectionCard}>

        <SectionHeader
          title="Campaign Performance"
          subtitle="Performance breakdown for each campaign"
          icon="📊"
        />

        {campaignPerformance.length ===
        0 ? (
          <EmptyState
            icon="📊"
            title="No campaign performance data"
            text="Campaign message activity will appear here."
          />
        ) : (
          <div
            style={
              styles.campaignTableWrap
            }
          >
            <table
              style={
                styles.campaignTable
              }
            >
              <thead>
                <tr>
                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Campaign
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Language
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Channel
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Messages
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Sent
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Delivered
                  </th>

                  <th
                    style={
                      styles.tableHeader
                    }
                  >
                    Failed
                  </th>
                </tr>
              </thead>

              <tbody>

                {campaignPerformance.map(
                  (campaign) => (
                    <tr
                      key={
                        campaign._id
                      }
                    >

                      <td
                        style={
                          styles.tableCellStrong
                        }
                      >
                        {campaign.name}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.language ||
                          "-"}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.channel
                          ? campaign.channel.toUpperCase()
                          : "-"}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        <span
                          style={{
                            ...styles.tableStatus,
                            background:
                              getCampaignStatusStyle(
                                campaign.status
                              )
                                .background,
                            color:
                              getCampaignStatusStyle(
                                campaign.status
                              )
                                .color,
                          }}
                        >
                          {campaign.status ||
                            "draft"}
                        </span>
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.totalMessages ||
                          0}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.sentMessages ||
                          0}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.deliveredMessages ||
                          0}
                      </td>

                      <td
                        style={
                          styles.tableCell
                        }
                      >
                        {campaign.failedMessages ||
                          0}
                      </td>

                    </tr>
                  )
                )}

              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ======================================
          AUDIENCE REACH
      ====================================== */}
      <div style={styles.sectionCard}>

        <SectionHeader
          title="Audience Reach"
          subtitle="Recipients configured in each audience"
          icon="👥"
        />

        {audienceReach.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No audience reach data"
            text="Audience recipients will appear here."
          />
        ) : (
          <div
            style={styles.audienceGrid}
          >

            {audienceReach.map(
              (audience) => (
                <div
                  key={
                    audience._id
                  }
                  style={
                    styles.audienceReachCard
                  }
                >

                  <div
                    style={
                      styles.audienceReachTop
                    }
                  >

                    <div
                      style={
                        styles.audienceReachIcon
                      }
                    >
                      👥
                    </div>

                    <div>
                      <h3
                        style={
                          styles.audienceReachName
                        }
                      >
                        {audience.name}
                      </h3>

                      <div
                        style={
                          styles.audienceMeta
                        }
                      >
                        {audience.language ||
                          "-"}{" "}
                        •{" "}
                        {audience.location ||
                          "-"}
                      </div>
                    </div>

                  </div>

                  <div
                    style={
                      styles.recipientBigNumber
                    }
                  >
                    {audience.recipientCount ||
                      0}
                  </div>

                  <div
                    style={
                      styles.recipientLabel
                    }
                  >
                    recipients
                  </div>

                  <div
                    style={
                      styles.audienceDetails
                    }
                  >

                    <span>
                      💼{" "}
                      {audience.occupation ||
                        "Not specified"}
                    </span>

                    <span>
                      🎯 Age{" "}
                      {audience.age ||
                        "—"}
                    </span>

                    <span>
                      👤{" "}
                      {formatLabel(
                        audience.gender
                      ) || "—"}
                    </span>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ======================================
          FOOTER
      ====================================== */}
      <div style={styles.footerInfo}>
        <span style={styles.footerIcon}>
          💡
        </span>

        <div>
          <strong>
            Communication intelligence
          </strong>

          <p>
            Use these insights to understand
            campaign activity, audience reach,
            language usage and delivery
            performance.
          </p>
        </div>
      </div>

    </div>
  );
}

// ==========================================
// METRIC CARD
// ==========================================
function MetricCard({
  icon,
  title,
  value,
  tone,
}) {
  const toneStyles = {
    purple: {
      background: "#eef2ff",
      color: "#4f46e5",
    },

    blue: {
      background: "#eff6ff",
      color: "#2563eb",
    },

    green: {
      background: "#ecfdf5",
      color: "#059669",
    },

    orange: {
      background: "#fff7ed",
      color: "#ea580c",
    },

    pink: {
      background: "#fdf2f8",
      color: "#db2777",
    },

    indigo: {
      background: "#eef2ff",
      color: "#6366f1",
    },

    teal: {
      background: "#f0fdfa",
      color: "#0f766e",
    },

    cyan: {
      background: "#ecfeff",
      color: "#0891b2",
    },
  };

  const selectedTone =
    toneStyles[tone] ||
    toneStyles.purple;

  return (
    <div
      style={styles.metricCard}
    >

      <div
        style={{
          ...styles.metricIcon,
          background:
            selectedTone.background,
          color:
            selectedTone.color,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={styles.metricTitle}
        >
          {title}
        </div>

        <div
          style={styles.metricValue}
        >
          {value}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// SECTION HEADER
// ==========================================
function SectionHeader({
  title,
  subtitle,
  icon,
}) {
  return (
    <div
      style={styles.sectionHeader}
    >

      <div
        style={
          styles.sectionHeaderLeft
        }
      >

        <div
          style={
            styles.sectionHeaderIcon
          }
        >
          {icon}
        </div>

        <div>
          <h2
            style={
              styles.sectionTitle
            }
          >
            {title}
          </h2>

          <p
            style={
              styles.sectionSubtitle
            }
          >
            {subtitle}
          </p>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// OVERVIEW BOX
// ==========================================
function OverviewBox({
  icon,
  title,
  value,
  background,
  color,
}) {
  return (
    <div
      style={{
        ...styles.overviewBox,
        background,
      }}
    >

      <div
        style={{
          ...styles.overviewBoxIcon,
          color,
        }}
      >
        {icon}
      </div>

      <div>

        <div
          style={
            styles.overviewBoxTitle
          }
        >
          {title}
        </div>

        <div
          style={{
            ...styles.overviewBoxValue,
            color,
          }}
        >
          {value}
        </div>

      </div>

    </div>
  );
}

// ==========================================
// PERFORMANCE BAR
// ==========================================
function PerformanceBar({
  label,
  value,
  percentage,
}) {
  return (
    <div
      style={styles.performanceRow}
    >

      <div
        style={
          styles.performanceRowTop
        }
      >

        <span
          style={
            styles.performanceLabel
          }
        >
          {label}
        </span>

        <strong
          style={
            styles.performanceValue
          }
        >
          {value}{" "}
          <span
            style={
              styles.performancePercent
            }
          >
            ({percentage}%)
          </span>
        </strong>

      </div>

      <div
        style={
          styles.performanceTrack
        }
      >
        <div
          style={{
            ...styles.performanceFill,
            width: `${Math.min(
              percentage,
              100
            )}%`,
          }}
        />
      </div>

    </div>
  );
}

// ==========================================
// INSIGHT ROW
// ==========================================
function InsightRow({
  icon,
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;

  return (
    <div
      style={styles.insightRow}
    >

      <div
        style={styles.insightLeft}
      >

        <div
          style={
            styles.insightIcon
          }
        >
          {icon}
        </div>

        <div>
          <div
            style={
              styles.insightLabel
            }
          >
            {label}
          </div>

          <div
            style={
              styles.insightBarTrack
            }
          >
            <div
              style={{
                ...styles.insightBarFill,
                width: `${Math.min(
                  percentage,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

      </div>

      <div
        style={
          styles.insightValue
        }
      >
        {value}
      </div>

    </div>
  );
}

// ==========================================
// EMPTY MINI
// ==========================================
function EmptyMini({ text }) {
  return (
    <div
      style={styles.emptyMini}
    >
      {text}
    </div>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================
function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div
      style={styles.emptyLarge}
    >

      <div
        style={styles.emptyLargeIcon}
      >
        {icon}
      </div>

      <h3
        style={styles.emptyLargeTitle}
      >
        {title}
      </h3>

      <p
        style={styles.emptyLargeText}
      >
        {text}
      </p>

    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================
function formatLabel(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function getChannelIcon(channel) {
  switch (channel) {
    case "email":
      return "✉️";

    case "sms":
      return "💬";

    case "whatsapp":
      return "🟢";

    case "push":
      return "🔔";

    default:
      return "📡";
  }
}

function getCampaignStatusStyle(
  status
) {
  switch (status) {
    case "active":
      return {
        background: "#ecfdf5",
        color: "#059669",
      };

    case "completed":
      return {
        background: "#eef2ff",
        color: "#4f46e5",
      };

    case "scheduled":
      return {
        background: "#fff7ed",
        color: "#ea580c",
      };

    case "cancelled":
      return {
        background: "#fef2f2",
        color: "#dc2626",
      };

    default:
      return {
        background: "#f1f5f9",
        color: "#64748b",
      };
  }
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8f9ff 0%, #f5f7fb 100%)",
    padding: "35px 40px 55px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "25px",
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    color: "#111827",
    fontSize: "32px",
    fontWeight: "850",
    letterSpacing: "-0.8px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  roleBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "9px 13px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  refreshButton: {
    border: "1px solid #dbe2ec",
    background: "#ffffff",
    color: "#475569",
    borderRadius: "10px",
    padding: "9px 13px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },

  overviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  metricCard: {
    background: "#ffffff",
    border: "1px solid #e8eaf3",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.045)",
  },

  metricIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  metricTitle: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "650",
  },

  metricValue: {
    color: "#111827",
    fontSize: "26px",
    fontWeight: "850",
    marginTop: "3px",
  },

  sectionCard: {
    background: "#ffffff",
    border: "1px solid #e8eaf3",
    borderRadius: "20px",
    boxShadow:
      "0 10px 35px rgba(15,23,42,0.045)",
    marginBottom: "22px",
    overflow: "hidden",
  },

  sectionHeader: {
    padding: "21px 24px",
    borderBottom:
      "1px solid #eef2f7",
  },

  sectionHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  sectionHeaderIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "11px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    padding: "21px 24px",
  },

  overviewBox: {
    borderRadius: "15px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  overviewBoxIcon: {
    fontSize: "22px",
  },

  overviewBoxTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
  },

  overviewBoxValue: {
    fontSize: "25px",
    fontWeight: "850",
    marginTop: "3px",
  },

  performanceLayout: {
    display: "grid",
    gridTemplateColumns:
      "260px 1fr",
    gap: "30px",
    padding: "25px 24px",
    alignItems: "center",
  },

  progressPanel: {
    display: "flex",
    justifyContent: "center",
  },

  progressCircleOuter: {
    width: "175px",
    height: "175px",
    borderRadius: "50%",
    background:
      "conic-gradient(#4f46e5 0deg, #4f46e5 180deg, #e8eaf3 180deg, #e8eaf3 360deg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleInner: {
    width: "132px",
    height: "132px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 5px 20px rgba(15,23,42,0.04)",
  },

  progressNumber: {
    color: "#111827",
    fontSize: "28px",
    fontWeight: "850",
  },

  progressLabel: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "700",
  },

  breakdownPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  performanceRow: {
    width: "100%",
  },

  performanceRowTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "7px",
  },

  performanceLabel: {
    color: "#475569",
    fontSize: "11px",
    fontWeight: "700",
  },

  performanceValue: {
    color: "#111827",
    fontSize: "11px",
  },

  performancePercent: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  performanceTrack: {
    width: "100%",
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "20px",
    overflow: "hidden",
  },

  performanceFill: {
    height: "100%",
    background:
      "linear-gradient(90deg, #4f46e5, #8b5cf6)",
    borderRadius: "20px",
    transition:
      "width 0.4s ease",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  listContent: {
    padding: "10px 24px 18px",
  },

  insightRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    padding: "12px 0",
    borderBottom:
      "1px solid #f1f5f9",
  },

  insightLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
    flex: 1,
  },

  insightIcon: {
    width: "33px",
    height: "33px",
    borderRadius: "10px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  insightLabel: {
    fontSize: "11px",
    color: "#334155",
    fontWeight: "700",
    marginBottom: "6px",
  },

  insightBarTrack: {
    width: "170px",
    maxWidth: "100%",
    height: "5px",
    background: "#f1f5f9",
    borderRadius: "20px",
    overflow: "hidden",
  },

  insightBarFill: {
    height: "100%",
    background: "#4f46e5",
    borderRadius: "20px",
  },

  insightValue: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "850",
  },

  emptyMini: {
    padding: "25px 5px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "11px",
  },

  translationGrid: {
    padding: "21px 24px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(190px, 1fr))",
    gap: "12px",
  },

  translationCard: {
    border:
      "1px solid #edf0f5",
    background: "#fafbff",
    borderRadius: "13px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  translationIcon: {
    width: "37px",
    height: "37px",
    borderRadius: "10px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  translationLanguage: {
    fontSize: "12px",
    color: "#334155",
    fontWeight: "800",
  },

  translationCount: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  campaignTableWrap: {
    overflowX: "auto",
  },

  campaignTable: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "760px",
  },

  tableHeader: {
    textAlign: "left",
    padding: "13px 18px",
    background: "#f8fafc",
    color: "#94a3b8",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom:
      "1px solid #eef2f7",
  },

  tableCell: {
    padding: "15px 18px",
    color: "#64748b",
    fontSize: "11px",
    borderBottom:
      "1px solid #f1f5f9",
  },

  tableCellStrong: {
    padding: "15px 18px",
    color: "#172033",
    fontSize: "12px",
    fontWeight: "800",
    borderBottom:
      "1px solid #f1f5f9",
  },

  tableStatus: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  audienceGrid: {
    padding: "22px 24px",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "15px",
  },

  audienceReachCard: {
    border:
      "1px solid #edf0f5",
    borderRadius: "15px",
    padding: "17px",
    background: "#fcfcfe",
  },

  audienceReachTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  audienceReachIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  audienceReachName: {
    margin: 0,
    color: "#172033",
    fontSize: "13px",
    fontWeight: "800",
  },

  audienceMeta: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  recipientBigNumber: {
    marginTop: "18px",
    color: "#111827",
    fontSize: "30px",
    fontWeight: "850",
  },

  recipientLabel: {
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "-2px",
  },

  audienceDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop:
      "1px solid #eef2f7",
    color: "#64748b",
    fontSize: "10px",
  },

  emptyLarge: {
    padding: "45px 20px",
    textAlign: "center",
  },

  emptyLargeIcon: {
    width: "55px",
    height: "55px",
    margin: "0 auto 12px",
    borderRadius: "16px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },

  emptyLargeTitle: {
    margin: 0,
    color: "#334155",
    fontSize: "15px",
  },

  emptyLargeText: {
    margin: "7px auto 0",
    maxWidth: "400px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  footerInfo: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    padding: "17px 19px",
    background: "#f8faff",
    border:
      "1px solid #e6eaff",
    borderRadius: "15px",
    marginTop: "2px",
  },

  footerIcon: {
    fontSize: "18px",
  },

  footerInfoStrong: {
    fontSize: "12px",
  },

  loadingCard: {
    maxWidth: "520px",
    margin: "100px auto",
    textAlign: "center",
    background: "#ffffff",
    border:
      "1px solid #e8eaf3",
    borderRadius: "20px",
    padding: "55px 30px",
    boxShadow:
      "0 15px 40px rgba(15,23,42,0.06)",
  },

  loadingIcon: {
    fontSize: "35px",
    color: "#4f46e5",
  },

  loadingTitle: {
    margin: "15px 0 0",
    color: "#334155",
    fontSize: "20px",
  },

  loadingText: {
    margin: "7px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  errorCard: {
    maxWidth: "520px",
    margin: "100px auto",
    textAlign: "center",
    background: "#ffffff",
    border:
      "1px solid #fecaca",
    borderRadius: "20px",
    padding: "45px 30px",
  },

  errorIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto",
    borderRadius: "50%",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
  },

  errorTitle: {
    margin: "15px 0 0",
    color: "#334155",
    fontSize: "18px",
  },

  errorText: {
    margin: "8px 0 20px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  retryButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Analytics;