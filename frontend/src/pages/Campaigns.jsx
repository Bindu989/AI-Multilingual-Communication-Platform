import { useEffect, useState } from "react";
import api from "../services/api";

function Campaigns() {
  // ==========================================
  // USER ROLE / PERMISSIONS
  // ==========================================

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userRole = user.role;

  const canCreateCampaign =
    userRole === "admin" ||
    userRole === "campaign_manager";

  const canEditCampaign =
    userRole === "admin" ||
    userRole === "campaign_manager";

  const canRunCampaign =
    userRole === "admin" ||
    userRole === "campaign_manager";

  const canDeleteCampaign =
    userRole === "admin";

  // ==========================================
  // STATE
  // ==========================================

  const [campaigns, setCampaigns] = useState([]);
  const [audiences, setAudiences] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingCampaignId, setEditingCampaignId] =
    useState(null);

  const [runningCampaignId, setRunningCampaignId] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    objective: "",
    message: "",
    language: "English",
    channel: "email",
    targetAudience: "",
    status: "draft",
    scheduledAt: "",
  });

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        campaignResponse,
        audienceResponse,
      ] = await Promise.all([
        api.get("/campaigns"),
        api.get("/audiences"),
      ]);

      setCampaigns(
        campaignResponse.data?.campaigns || []
      );

      setAudiences(
        audienceResponse.data?.audiences || []
      );
    } catch (error) {
      console.error(
        "Error loading campaigns:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to load campaign information"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      name: "",
      objective: "",
      message: "",
      language: "English",
      channel: "email",
      targetAudience: "",
      status: "draft",
      scheduledAt: "",
    });

    setEditingCampaignId(null);
    setShowForm(false);
  };

  // ==========================================
  // CREATE CAMPAIGN
  // ==========================================

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!canCreateCampaign) {
      alert(
        "You do not have permission to create campaigns."
      );
      return;
    }

    if (
      !form.name ||
      !form.message ||
      !form.targetAudience
    ) {
      alert(
        "Please fill Campaign Name, Message and Target Audience."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.post("/campaigns", {
        ...form,
        scheduledAt: form.scheduledAt
          ? new Date(
              form.scheduledAt
            ).toISOString()
          : null,
      });

      const newCampaign =
        response.data?.campaign;

      if (newCampaign) {
        setCampaigns((prev) => [
          newCampaign,
          ...prev,
        ]);
      } else {
        await fetchData();
      }

      resetForm();

      alert(
        "Campaign created successfully!"
      );
    } catch (error) {
      console.error(
        "Create campaign error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create campaign"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT CAMPAIGN - OPEN FORM
  // ==========================================

  const handleEdit = (campaign) => {
    if (!canEditCampaign) {
      alert(
        "You do not have permission to edit campaigns."
      );
      return;
    }

    setEditingCampaignId(
      campaign._id
    );

    setForm({
      name: campaign.name || "",
      objective:
        campaign.objective || "",
      message: campaign.message || "",
      language:
        campaign.language || "English",
      channel:
        campaign.channel || "email",
      targetAudience:
        typeof campaign.targetAudience ===
        "object"
          ? campaign.targetAudience?._id ||
            ""
          : campaign.targetAudience || "",
      status:
        campaign.status || "draft",
      scheduledAt: campaign.scheduledAt
        ? new Date(
            campaign.scheduledAt
          )
            .toISOString()
            .slice(0, 16)
        : "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // UPDATE CAMPAIGN
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!canEditCampaign) {
      alert(
        "You do not have permission to edit campaigns."
      );
      return;
    }

    if (!editingCampaignId) {
      return;
    }

    if (
      !form.name ||
      !form.message ||
      !form.targetAudience
    ) {
      alert(
        "Please fill Campaign Name, Message and Target Audience."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/campaigns/${editingCampaignId}`,
        {
          ...form,
          scheduledAt: form.scheduledAt
            ? new Date(
                form.scheduledAt
              ).toISOString()
            : null,
        }
      );

      const updatedCampaign =
        response.data?.campaign;

      if (updatedCampaign) {
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign._id ===
            editingCampaignId
              ? updatedCampaign
              : campaign
          )
        );
      } else {
        await fetchData();
      }

      resetForm();

      alert(
        "Campaign updated successfully!"
      );
    } catch (error) {
      console.error(
        "Update campaign error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update campaign"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // RUN CAMPAIGN
  // ==========================================

  const handleRun = async (campaign) => {
    if (!canRunCampaign) {
      alert(
        "You do not have permission to run campaigns."
      );
      return;
    }

    if (
      campaign.status === "completed"
    ) {
      alert(
        "This campaign has already been completed."
      );
      return;
    }

    if (
      campaign.channel !== "email"
    ) {
      alert(
        "Currently, campaign execution is integrated for Email channel."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Run "${campaign.name}" now?\n\nThis will send the campaign email to the selected audience recipients.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRunningCampaignId(
        campaign._id
      );

      const response = await api.post(
        `/campaigns/${campaign._id}/run`
      );

      alert(
        response.data?.message ||
          "Campaign executed successfully!"
      );

      await fetchData();
    } catch (error) {
      console.error(
        "Run campaign error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to execute campaign"
      );
    } finally {
      setRunningCampaignId(null);
    }
  };

  // ==========================================
  // DELETE CAMPAIGN
  // ==========================================

  const handleDelete = async (id) => {
    if (!canDeleteCampaign) {
      alert(
        "You do not have permission to delete campaigns."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this campaign?"
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/campaigns/${id}`
      );

      setCampaigns((prev) =>
        prev.filter(
          (campaign) =>
            campaign._id !== id
        )
      );

      alert(
        "Campaign deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete campaign error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete campaign"
      );
    }
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "completed":
        return {
          background: "#e0e7ff",
          color: "#4338ca",
        };

      case "scheduled":
        return {
          background: "#fef3c7",
          color: "#b45309",
        };

      case "cancelled":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      default:
        return {
          background: "#f1f5f9",
          color: "#64748b",
        };
    }
  };

  // ==========================================
  // CHANNEL ICON
  // ==========================================

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "sms":
        return "💬";

      case "email":
        return "✉️";

      case "whatsapp":
        return "🟢";

      case "push":
        return "🔔";

      default:
        return "📢";
    }
  };

  // ==========================================
  // AUDIENCE NAME
  // ==========================================

  const getAudienceName = (audience) => {
    if (!audience) {
      return "No audience";
    }

    if (typeof audience === "object") {
      return (
        audience.name ||
        "Unnamed Audience"
      );
    }

    const found = audiences.find(
      (item) =>
        item._id === audience
    );

    return (
      found?.name ||
      "Unknown Audience"
    );
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalCampaigns =
    campaigns.length;

  const draftCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status === "draft"
    ).length;

  const activeCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status === "active"
    ).length;

  const completedCampaigns =
    campaigns.filter(
      (campaign) =>
        campaign.status === "completed"
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            Communication / Campaigns
          </div>

          <h1 style={styles.title}>
            Campaign Management
          </h1>

          <p style={styles.subtitle}>
            Create and manage multilingual
            communication campaigns.
          </p>
        </div>

        {canCreateCampaign && (
          <button
            style={styles.createButton}
            onClick={() => {
              if (editingCampaignId) {
                resetForm();
              } else {
                setShowForm(
                  !showForm
                );
              }
            }}
          >
            <span style={styles.plus}>
              +
            </span>

            Create Campaign
          </button>
        )}
      </div>

      {/* ================= STATS ================= */}

      <div style={styles.statsGrid}>

        <StatCard
          icon="📢"
          title="Total Campaigns"
          value={totalCampaigns}
        />

        <StatCard
          icon="📝"
          title="Drafts"
          value={draftCampaigns}
        />

        <StatCard
          icon="⚡"
          title="Active"
          value={activeCampaigns}
        />

        <StatCard
          icon="✓"
          title="Completed"
          value={completedCampaigns}
        />

      </div>

      {/* ================= CREATE / EDIT FORM ================= */}

      {showForm &&
        canCreateCampaign && (
          <div style={styles.formCard}>

            <div style={styles.formHeader}>

              <div>
                <h2 style={styles.formTitle}>
                  {editingCampaignId
                    ? "Edit Campaign"
                    : "Create New Campaign"}
                </h2>

                <p
                  style={
                    styles.formSubtitle
                  }
                >
                  {editingCampaignId
                    ? "Update your communication campaign."
                    : "Configure your multilingual communication campaign."}
                </p>
              </div>

              <button
                style={
                  styles.closeButton
                }
                onClick={resetForm}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                editingCampaignId
                  ? handleUpdate
                  : handleCreate
              }
            >

              <div style={styles.formGrid}>

                {/* CAMPAIGN NAME */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Campaign Name
                  </label>

                  <input
                    style={styles.input}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Farmer Scheme Campaign"
                  />
                </div>

                {/* OBJECTIVE */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Objective
                  </label>

                  <input
                    style={styles.input}
                    type="text"
                    name="objective"
                    value={
                      form.objective
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Government scheme awareness"
                  />
                </div>

                {/* LANGUAGE */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Language
                  </label>

                  <select
                    style={styles.input}
                    name="language"
                    value={
                      form.language
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option>
                      English
                    </option>
                    <option>
                      Telugu
                    </option>
                    <option>
                      Hindi
                    </option>
                    <option>
                      Tamil
                    </option>
                    <option>
                      Kannada
                    </option>
                    <option>
                      Malayalam
                    </option>
                    <option>
                      Bengali
                    </option>
                    <option>
                      Marathi
                    </option>
                    <option>
                      Gujarati
                    </option>
                    <option>
                      Punjabi
                    </option>
                    <option>
                      Spanish
                    </option>
                    <option>
                      French
                    </option>
                    <option>
                      German
                    </option>
                    <option>
                      Italian
                    </option>
                    <option>
                      Portuguese
                    </option>
                    <option>
                      Dutch
                    </option>
                    <option>
                      Russian
                    </option>
                    <option>
                      Japanese
                    </option>
                    <option>
                      Korean
                    </option>
                    <option>
                      Chinese
                    </option>
                  </select>
                </div>

                {/* CHANNEL */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Communication Channel
                  </label>

                  <select
                    style={styles.input}
                    name="channel"
                    value={
                      form.channel
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="email">
                      Email
                    </option>

                    <option value="sms">
                      SMS
                    </option>

                    <option value="whatsapp">
                      WhatsApp
                    </option>

                    <option value="push">
                      Push Notification
                    </option>
                  </select>
                </div>

                {/* TARGET AUDIENCE */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Target Audience
                  </label>

                  <select
                    style={styles.input}
                    name="targetAudience"
                    value={
                      form.targetAudience
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select Target Audience
                    </option>

                    {audiences.map(
                      (audience) => (
                        <option
                          key={
                            audience._id
                          }
                          value={
                            audience._id
                          }
                        >
                          {
                            audience.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUS */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Status
                  </label>

                  <select
                    style={styles.input}
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="scheduled">
                      Scheduled
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>

                {/* SCHEDULE */}

                <div style={styles.field}>
                  <label
                    style={styles.label}
                  >
                    Scheduled Date & Time
                  </label>

                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="scheduledAt"
                    value={
                      form.scheduledAt
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                {/* MESSAGE */}

                <div
                  style={{
                    ...styles.field,
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={styles.label}
                  >
                    Campaign Message
                  </label>

                  <textarea
                    style={{
                      ...styles.input,
                      minHeight:
                        "130px",
                      resize:
                        "vertical",
                    }}
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter the message you want to communicate..."
                    rows="5"
                  />
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div
                style={
                  styles.formActions
                }
              >

                <button
                  type="button"
                  style={
                    styles.cancelButton
                  }
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={
                    styles.saveButton
                  }
                  disabled={saving}
                >
                  {saving
                    ? editingCampaignId
                      ? "Updating..."
                      : "Creating..."
                    : editingCampaignId
                    ? "Update Campaign"
                    : "Create Campaign"}
                </button>

              </div>

            </form>

          </div>
        )}

      {/* ================= SECTION HEADER ================= */}

      <div style={styles.sectionHeader}>

        <div>
          <h2
            style={styles.sectionTitle}
          >
            Your Campaigns
          </h2>

          <p
            style={
              styles.sectionSubtitle
            }
          >
            View and manage all communication
            campaigns.
          </p>
        </div>

        <div style={styles.countBadge}>
          {totalCampaigns} campaigns
        </div>

      </div>

      {/* ================= CAMPAIGNS LIST ================= */}

      {loading ? (

        <div style={styles.loading}>
          Loading campaigns...
        </div>

      ) : campaigns.length ===
        0 ? (

        <div
          style={
            styles.emptyCard
          }
        >

          <div
            style={
              styles.emptyIcon
            }
          >
            📢
          </div>

          <h3
            style={
              styles.emptyTitle
            }
          >
            No campaigns yet
          </h3>

          <p
            style={
              styles.emptyText
            }
          >
            Create your first multilingual
            communication campaign.
          </p>

          {canCreateCampaign && (
            <button
              style={
                styles.createButtonSmall
              }
              onClick={() =>
                setShowForm(true)
              }
            >
              + Create Campaign
            </button>
          )}

        </div>

      ) : (

        <div
          style={
            styles.campaignGrid
          }
        >

          {campaigns.map(
            (campaign) => (

              <div
                key={
                  campaign._id
                }
                style={
                  styles.campaignCard
                }
              >

                {/* CARD TOP */}

                <div
                  style={
                    styles.cardTop
                  }
                >

                  <div
                    style={
                      styles.channelIcon
                    }
                  >
                    {getChannelIcon(
                      campaign.channel
                    )}
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(
                        campaign.status
                      ),
                    }}
                  >
                    {campaign.status ||
                      "draft"}
                  </span>

                </div>

                {/* CAMPAIGN NAME */}

                <h3
                  style={
                    styles.campaignName
                  }
                >
                  {campaign.name ||
                    "Untitled Campaign"}
                </h3>

                {/* OBJECTIVE */}

                <div
                  style={
                    styles.infoBlock
                  }
                >
                  <span
                    style={
                      styles.infoLabel
                    }
                  >
                    Objective
                  </span>

                  <span
                    style={
                      styles.infoValue
                    }
                  >
                    {campaign.objective ||
                      "Not specified"}
                  </span>
                </div>

                {/* MESSAGE */}

                <div
                  style={
                    styles.messageBox
                  }
                >
                  <div
                    style={
                      styles.messageLabel
                    }
                  >
                    Message
                  </div>

                  <div
                    style={
                      styles.messageText
                    }
                  >
                    {campaign.message ||
                      "No message available."}
                  </div>
                </div>

                {/* DETAILS */}

                <div
                  style={
                    styles.details
                  }
                >

                  {/* LANGUAGE */}

                  <div
                    style={
                      styles.detailRow
                    }
                  >
                    <span
                      style={
                        styles.detailIcon
                      }
                    >
                      🌐
                    </span>

                    <div>
                      <div
                        style={
                          styles.detailLabel
                        }
                      >
                        Language
                      </div>

                      <div
                        style={
                          styles.detailValue
                        }
                      >
                        {campaign.language ||
                          "English"}
                      </div>
                    </div>
                  </div>

                  {/* CHANNEL */}

                  <div
                    style={
                      styles.detailRow
                    }
                  >
                    <span
                      style={
                        styles.detailIcon
                      }
                    >
                      📡
                    </span>

                    <div>
                      <div
                        style={
                          styles.detailLabel
                        }
                      >
                        Channel
                      </div>

                      <div
                        style={
                          styles.detailValue
                        }
                      >
                        {campaign.channel
                          ? campaign.channel.toUpperCase()
                          : "EMAIL"}
                      </div>
                    </div>
                  </div>

                  {/* TARGET AUDIENCE */}

                  <div
                    style={
                      styles.detailRow
                    }
                  >
                    <span
                      style={
                        styles.detailIcon
                      }
                    >
                      👥
                    </span>

                    <div>
                      <div
                        style={
                          styles.detailLabel
                        }
                      >
                        Target Audience
                      </div>

                      <div
                        style={
                          styles.detailValue
                        }
                      >
                        {getAudienceName(
                          campaign.targetAudience
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SCHEDULE */}

                  {campaign.scheduledAt && (
                    <div
                      style={
                        styles.detailRow
                      }
                    >
                      <span
                        style={
                          styles.detailIcon
                        }
                      >
                        🕒
                      </span>

                      <div>
                        <div
                          style={
                            styles.detailLabel
                          }
                        >
                          Scheduled
                        </div>

                        <div
                          style={
                            styles.detailValue
                          }
                        >
                          {new Date(
                            campaign.scheduledAt
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* FOOTER */}

                <div
                  style={
                    styles.cardFooter
                  }
                >

                  {/* EDIT + RUN */}

                  {canEditCampaign && (
                    <button
                      style={
                        styles.editButton
                      }
                      onClick={() =>
                        handleEdit(
                          campaign
                        )
                      }
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {canRunCampaign &&
                    campaign.status !==
                      "completed" && (
                      <button
                        style={
                          styles.runButton
                        }
                        onClick={() =>
                          handleRun(
                            campaign
                          )
                        }
                        disabled={
                          runningCampaignId ===
                          campaign._id
                        }
                      >
                        {runningCampaignId ===
                        campaign._id
                          ? "Running..."
                          : "▶ Run"}
                      </button>
                    )}

                  {/* DELETE */}

                  {canDeleteCampaign && (
                    <button
                      style={
                        styles.deleteButton
                      }
                      onClick={() =>
                        handleDelete(
                          campaign._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div style={styles.statCard}>

      <div
        style={styles.statIcon}
      >
        {icon}
      </div>

      <div>
        <div
          style={styles.statTitle}
        >
          {title}
        </div>

        <div
          style={styles.statValue}
        >
          {value}
        </div>
      </div>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "38px 36px 60px",
    margin: 0,
    background: "#f5f7fb",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111827",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "38px",
    gap: "30px",
  },

  breadcrumb: {
    fontSize: "14px",
    color: "#8b9bc1",
    marginBottom: "10px",
    letterSpacing: "0.2px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "850",
    letterSpacing: "-1.4px",
    color: "#0b1220",
  },

  subtitle: {
    margin: "12px 0 0",
    fontSize: "15px",
    color: "#60749c",
  },

  createButton: {
    border: "none",
    borderRadius: "17px",
    padding: "17px 25px",
    background:
      "linear-gradient(135deg, #5146e5, #8235e8)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow:
      "0 15px 30px rgba(91, 61, 220, 0.24)",
    whiteSpace: "nowrap",
  },

  plus: {
    fontSize: "20px",
    marginRight: "8px",
    verticalAlign: "-1px",
  },

  /* STATS */

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "24px",
    marginBottom: "42px",
  },

  statCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "29px 25px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    border: "1px solid #e9edf5",
    boxShadow:
      "0 14px 35px rgba(30, 41, 59, 0.055)",
  },

  statIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "17px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    flexShrink: 0,
  },

  statTitle: {
    fontSize: "13px",
    color: "#59709a",
    fontWeight: "600",
    marginBottom: "8px",
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "850",
    color: "#080d18",
  },

  /* FORM */

  formCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "30px",
    marginBottom: "42px",
    border: "1px solid #e6eaf2",
    boxShadow:
      "0 18px 45px rgba(30, 41, 59, 0.08)",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },

  formTitle: {
    margin: 0,
    fontSize: "23px",
    fontWeight: "800",
    color: "#111827",
  },

  formSubtitle: {
    margin: "7px 0 0",
    fontSize: "13px",
    color: "#8190ad",
  },

  closeButton: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "none",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "24px",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #dfe5ef",
    borderRadius: "12px",
    outline: "none",
    fontSize: "13px",
    color: "#334155",
    background: "#ffffff",
    fontFamily: "inherit",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "28px",
    paddingTop: "22px",
    borderTop: "1px solid #edf0f5",
  },

  cancelButton: {
    border: "1px solid #dce2ec",
    background: "#ffffff",
    color: "#64748b",
    borderRadius: "12px",
    padding: "13px 22px",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #5146e5, #8235e8)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "13px 24px",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* SECTION */

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    gap: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "850",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#8a9abb",
  },

  countBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "16px 21px",
    borderRadius: "25px",
    fontSize: "13px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  /* CAMPAIGN GRID */

  campaignGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(330px, 1fr))",
    gap: "24px",
    alignItems: "start",
  },

  /* CAMPAIGN CARD */

  campaignCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "26px",
    border: "1px solid #e8ecf3",
    boxShadow:
      "0 15px 38px rgba(30, 41, 59, 0.07)",
    minWidth: 0,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  channelIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "17px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  statusBadge: {
    padding: "9px 14px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  campaignName: {
    margin: "0 0 18px",
    fontSize: "21px",
    lineHeight: "1.3",
    fontWeight: "850",
    color: "#111827",
    wordBreak: "break-word",
  },

  infoBlock: {
    marginBottom: "18px",
  },

  infoLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    marginBottom: "6px",
  },

  infoValue: {
    display: "block",
    fontSize: "14px",
    color: "#334155",
    fontWeight: "650",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },

  /* MESSAGE */

  messageBox: {
    background: "#f8fafc",
    borderRadius: "15px",
    padding: "16px",
    marginBottom: "20px",
    border: "1px solid #f0f2f6",
  },

  messageLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    marginBottom: "7px",
  },

  messageText: {
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.6",
    wordBreak: "break-word",
  },

  /* DETAILS */

  details: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    paddingBottom: "20px",
  },

  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  detailIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "15px",
  },

  detailLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "3px",
  },

  detailValue: {
    fontSize: "12px",
    color: "#475569",
    fontWeight: "650",
    wordBreak: "break-word",
  },

  /* FOOTER */

  cardFooter: {
    borderTop: "1px solid #edf0f5",
    paddingTop: "17px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  editButton: {
    border: "none",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  runButton: {
    border: "none",
    background: "#ecfdf5",
    color: "#059669",
    borderRadius: "10px",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  deleteButton: {
    border: "none",
    background: "#fff1f2",
    color: "#ef4444",
    borderRadius: "10px",
    padding: "9px 15px",
    fontSize: "12px",
    fontWeight: "800",
    cursor: "pointer",
  },

  /* LOADING */

  loading: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
    color: "#64748b",
  },

  /* EMPTY */

  emptyCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "65px 30px",
    textAlign: "center",
    border: "1px solid #e8ecf3",
    boxShadow:
      "0 15px 38px rgba(30, 41, 59, 0.06)",
  },

  emptyIcon: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
  },

  emptyText: {
    color: "#8796b3",
    fontSize: "13px",
    margin: "8px 0 22px",
  },

  createButtonSmall: {
    border: "none",
    background:
      "linear-gradient(135deg, #5146e5, #8235e8)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "12px 20px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default Campaigns;