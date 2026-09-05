import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Messages() {
  // ==========================================
  // USER / ROLE
  // ==========================================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userRole = user.role;

  const canDeleteMessage =
    userRole === "admin";

  // ==========================================
  // STATE
  // ==========================================
  const [messages, setMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [audiences, setAudiences] = useState([]);

  const [selectedAudienceRecipients, setSelectedAudienceRecipients] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const emptyForm = {
    campaign: "",
    audience: "",
    recipientId: "",
    recipientName: "",
    recipientContact: "",
    channel: "email",
    language: "English",
    message: "",
  };

  const [form, setForm] = useState(emptyForm);

  // ==========================================
  // FETCH ALL DATA
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        messagesRes,
        campaignsRes,
        audiencesRes,
      ] = await Promise.all([
        api.get("/messages"),
        api.get("/campaigns"),
        api.get("/audiences"),
      ]);

      const messagesData = messagesRes.data;
      const campaignsData = campaignsRes.data;
      const audiencesData = audiencesRes.data;

      setMessages(
        Array.isArray(messagesData)
          ? messagesData
          : Array.isArray(messagesData?.messages)
          ? messagesData.messages
          : []
      );

      setCampaigns(
        Array.isArray(campaignsData)
          ? campaignsData
          : Array.isArray(campaignsData?.campaigns)
          ? campaignsData.campaigns
          : []
      );

      const loadedAudiences =
        Array.isArray(audiencesData)
          ? audiencesData
          : Array.isArray(audiencesData?.audiences)
          ? audiencesData.audiences
          : [];

      setAudiences(loadedAudiences);
    } catch (error) {
      console.error(
        "Failed to fetch message data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SELECT AUDIENCE
  // ==========================================
  const handleAudienceChange = async (e) => {
    const audienceId = e.target.value;

    setForm((prev) => ({
      ...prev,
      audience: audienceId,
      recipientId: "",
      recipientName: "",
      recipientContact: "",
    }));

    setSelectedAudienceRecipients([]);

    if (!audienceId) {
      return;
    }

    try {
      setLoadingRecipients(true);

      const response = await api.get(
        `/audiences/${audienceId}`
      );

      const audience =
        response.data?.audience;

      const recipients =
        Array.isArray(audience?.recipients)
          ? audience.recipients
          : [];

      setSelectedAudienceRecipients(
        recipients
      );
    } catch (error) {
      console.error(
        "Failed to fetch audience recipients:",
        error
      );

      // Fallback to already-loaded audience
      const audience =
        audiences.find(
          (item) =>
            String(item._id) ===
            String(audienceId)
        );

      setSelectedAudienceRecipients(
        audience?.recipients || []
      );
    } finally {
      setLoadingRecipients(false);
    }
  };

  // ==========================================
  // SELECT RECIPIENT
  // ==========================================
  const handleRecipientChange = (e) => {
    const recipientId = e.target.value;

    const recipient =
      selectedAudienceRecipients.find(
        (item) =>
          String(item._id) ===
          String(recipientId)
      );

    if (!recipient) {
      setForm((prev) => ({
        ...prev,
        recipientId: "",
        recipientName: "",
        recipientContact: "",
      }));

      return;
    }

    const contact =
      recipient.email ||
      recipient.phone ||
      "";

    setForm((prev) => ({
      ...prev,
      recipientId,
      recipientName:
        recipient.name || "",
      recipientContact: contact,
    }));
  };

  // ==========================================
  // CREATE MESSAGE
  // ==========================================
  const handleCreate = async (e) => {
    e.preventDefault();

    if (
      !form.campaign ||
      !form.audience ||
      !form.recipientName ||
      !form.recipientContact ||
      !form.channel ||
      !form.language ||
      !form.message
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    // Email validation
    if (form.channel === "email") {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailPattern.test(
          form.recipientContact.trim()
        )
      ) {
        alert(
          "Please select a recipient with a valid email address for Email channel."
        );
        return;
      }
    }

    try {
      setCreating(true);

      const payload = {
        campaign: form.campaign,
        audience: form.audience,
        recipientName:
          form.recipientName.trim(),
        recipientContact:
          form.recipientContact.trim(),
        channel: form.channel,
        language: form.language,
        message: form.message.trim(),
      };

      console.log(
        "FRONTEND CREATE MESSAGE:",
        payload
      );

      const response = await api.post(
        "/messages",
        payload
      );

      alert(
        response.data?.message ||
          "Message created successfully!"
      );

      clearForm();

      await fetchData();
    } catch (error) {
      console.error(
        "Create message error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create message."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // CLEAR FORM
  // ==========================================
  const clearForm = () => {
    setForm(emptyForm);
    setSelectedAudienceRecipients([]);
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const handleStatusUpdate = async (
    id,
    status
  ) => {
    try {
      await api.put(
        `/messages/${id}/status`,
        {
          status,
        }
      );

      await fetchData();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update message status."
      );
    }
  };

  // ==========================================
  // DELETE MESSAGE
  // ADMIN ONLY
  // ==========================================
  const handleDelete = async (id) => {
    if (!canDeleteMessage) {
      alert(
        "You do not have permission to delete messages."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this message?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/messages/${id}`
      );

      setMessages((prev) =>
        prev.filter(
          (message) =>
            message._id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete message error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete message."
      );
    }
  };

  // ==========================================
  // CAMPAIGN NAME
  // ==========================================
  const getCampaignName = (
    message
  ) => {
    if (
      message?.campaign &&
      typeof message.campaign === "object" &&
      message.campaign.name
    ) {
      return message.campaign.name;
    }

    const campaignId =
      typeof message?.campaign === "object"
        ? message.campaign?._id
        : message?.campaign;

    const campaign =
      campaigns.find(
        (item) =>
          String(item._id) ===
          String(campaignId)
      );

    return (
      campaign?.name ||
      "Campaign no longer available"
    );
  };

  // ==========================================
  // AUDIENCE NAME
  // ==========================================
  const getAudienceName = (
    message
  ) => {
    if (
      message?.audience &&
      typeof message.audience === "object" &&
      message.audience.name
    ) {
      return message.audience.name;
    }

    const audienceId =
      typeof message?.audience === "object"
        ? message.audience?._id
        : message?.audience;

    const audience =
      audiences.find(
        (item) =>
          String(item._id) ===
          String(audienceId)
      );

    return (
      audience?.name ||
      "Audience no longer available"
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================
  const getStatusStyle = (
    status
  ) => {
    const statusStyles = {
      pending: {
        background: "#fff7ed",
        color: "#ea580c",
      },

      sent: {
        background: "#eff6ff",
        color: "#2563eb",
      },

      delivered: {
        background: "#ecfdf5",
        color: "#059669",
      },

      failed: {
        background: "#fef2f2",
        color: "#dc2626",
      },
    };

    return (
      statusStyles[status] || {
        background: "#f1f5f9",
        color: "#64748b",
      }
    );
  };

  // ==========================================
  // STATS
  // ==========================================
  const totalMessages =
    Array.isArray(messages)
      ? messages.length
      : 0;

  const pendingMessages =
    messages.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const sentMessages =
    messages.filter(
      (item) =>
        item.status === "sent"
    ).length;

  const deliveredMessages =
    messages.filter(
      (item) =>
        item.status === "delivered"
    ).length;

  const failedMessages =
    messages.filter(
      (item) =>
        item.status === "failed"
    ).length;

  // ==========================================
  // SELECTED AUDIENCE
  // ==========================================
  const selectedAudience =
    useMemo(
      () =>
        audiences.find(
          (item) =>
            String(item._id) ===
            String(form.audience)
        ),
      [audiences, form.audience]
    );

  // ==========================================
  // UI
  // ==========================================
  return (
    <div style={styles.page}>

      {/* ======================================
          HEADER
      ====================================== */}
      <div style={styles.header}>

        <div>
          <div style={styles.eyebrow}>
            COMMUNICATION CENTER
          </div>

          <h1 style={styles.title}>
            Message Delivery
          </h1>

          <p style={styles.subtitle}>
            Create, send and track communication
            messages across your audiences.
          </p>
        </div>

        <div style={styles.headerIcon}>
          ✉
        </div>

      </div>

      {/* ======================================
          STATS
      ====================================== */}
      <div style={styles.statsGrid}>

        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon="✉"
        />

        <StatCard
          title="Pending"
          value={pendingMessages}
          icon="◷"
        />

        <StatCard
          title="Sent"
          value={sentMessages}
          icon="➤"
        />

        <StatCard
          title="Delivered"
          value={deliveredMessages}
          icon="✓"
        />

      </div>

      {/* ======================================
          CREATE MESSAGE
      ====================================== */}
      <div style={styles.card}>

        <div
          style={styles.cardHeader}
        >

          <div>
            <h2
              style={styles.cardTitle}
            >
              Create Message
            </h2>

            <p
              style={styles.cardDescription}
            >
              Prepare a communication message
              for a selected campaign, audience
              and recipient.
            </p>
          </div>

          <div
            style={styles.smallIcon}
          >
            ✦
          </div>

        </div>

        <form
          onSubmit={handleCreate}
        >

          <div
            style={styles.formGrid}
          >

            {/* CAMPAIGN */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Campaign{" "}
                <span
                  style={styles.required}
                >
                  *
                </span>
              </label>

              <select
                name="campaign"
                value={form.campaign}
                onChange={handleChange}
                style={styles.input}
                required
              >

                <option value="">
                  Select Campaign
                </option>

                {campaigns.map(
                  (campaign) => (
                    <option
                      key={`campaign-${campaign._id}`}
                      value={
                        campaign._id
                      }
                    >
                      {campaign.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* AUDIENCE */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Audience{" "}
                <span
                  style={styles.required}
                >
                  *
                </span>
              </label>

              <select
                name="audience"
                value={form.audience}
                onChange={
                  handleAudienceChange
                }
                style={styles.input}
                required
              >

                <option value="">
                  Select Audience
                </option>

                {audiences.map(
                  (audience) => (
                    <option
                      key={`audience-${audience._id}`}
                      value={
                        audience._id
                      }
                    >
                      {audience.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* RECIPIENT */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Recipient{" "}
                <span
                  style={styles.required}
                >
                  *
                </span>
              </label>

              <select
                name="recipientId"
                value={
                  form.recipientId
                }
                onChange={
                  handleRecipientChange
                }
                style={styles.input}
                required
                disabled={
                  !form.audience ||
                  loadingRecipients
                }
              >

                <option value="">
                  {loadingRecipients
                    ? "Loading recipients..."
                    : !form.audience
                    ? "Select audience first"
                    : selectedAudienceRecipients.length ===
                      0
                    ? "No recipients available"
                    : "Select Recipient"}
                </option>

                {selectedAudienceRecipients.map(
                  (recipient) => (
                    <option
                      key={`recipient-${recipient._id}`}
                      value={
                        recipient._id
                      }
                    >
                      {recipient.name}
                      {recipient.email
                        ? ` — ${recipient.email}`
                        : recipient.phone
                        ? ` — ${recipient.phone}`
                        : ""}
                    </option>
                  )
                )}

              </select>

              {form.audience &&
                !loadingRecipients &&
                selectedAudienceRecipients.length ===
                  0 && (
                  <small
                    style={
                      styles.helperText
                    }
                  >
                    Add recipients from the Audience
                    Management page first.
                  </small>
                )}

            </div>

            {/* RECIPIENT CONTACT */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Phone / Email
              </label>

              <input
                type="text"
                value={
                  form.recipientContact
                }
                readOnly
                placeholder="Selected recipient contact"
                style={{
                  ...styles.input,
                  background: "#f8fafc",
                  color: "#64748b",
                }}
              />

            </div>

            {/* CHANNEL */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Channel
              </label>

              <select
                name="channel"
                value={form.channel}
                onChange={
                  handleChange
                }
                style={styles.input}
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

            {/* LANGUAGE */}
            <div
              style={styles.field}
            >

              <label
                style={styles.label}
              >
                Language
              </label>

              <select
                name="language"
                value={form.language}
                onChange={
                  handleChange
                }
                style={styles.input}
              >

                {[
                  "English",
                  "Telugu",
                  "Hindi",
                  "Tamil",
                  "Kannada",
                  "Malayalam",
                  "Bengali",
                  "Marathi",
                  "Gujarati",
                  "Punjabi",
                  "Spanish",
                  "French",
                  "German",
                  "Italian",
                  "Portuguese",
                  "Dutch",
                  "Russian",
                  "Japanese",
                  "Korean",
                  "Chinese",
                ].map(
                  (language) => (
                    <option
                      key={`language-${language}`}
                      value={language}
                    >
                      {language}
                    </option>
                  )
                )}

              </select>

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
                Message{" "}
                <span
                  style={styles.required}
                >
                  *
                </span>
              </label>

              <textarea
                name="message"
                value={form.message}
                onChange={
                  handleChange
                }
                placeholder="Type your communication message..."
                rows={5}
                style={
                  styles.textarea
                }
                required
              />

            </div>

          </div>

          {/* FORM ACTIONS */}
          <div
            style={styles.formActions}
          >

            <button
              type="button"
              onClick={clearForm}
              style={
                styles.clearButton
              }
              disabled={creating}
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={
                creating ||
                !form.recipientId
              }
              style={{
                ...styles.createButton,
                opacity:
                  creating ||
                  !form.recipientId
                    ? 0.6
                    : 1,
              }}
            >
              {creating
                ? "Creating..."
                : "✦ Create Message"}
            </button>

          </div>

        </form>

      </div>

      {/* ======================================
          MESSAGE DELIVERY
      ====================================== */}
      <div style={styles.card}>

        <div
          style={styles.listHeader}
        >

          <div>
            <h2
              style={styles.cardTitle}
            >
              Message Delivery
            </h2>

            <p
              style={styles.cardDescription}
            >
              Track and manage communication
              delivery status.
            </p>
          </div>

          <div
            style={styles.messageCount}
          >
            {totalMessages} messages
          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div
            style={styles.emptyState}
          >
            Loading messages...
          </div>

        ) : totalMessages === 0 ? (

          <div
            style={styles.emptyState}
          >

            <div
              style={styles.emptyIcon}
            >
              ✉
            </div>

            <h3
              style={styles.emptyTitle}
            >
              No messages yet
            </h3>

            <p
              style={styles.emptyText}
            >
              Create your first communication
              message above.
            </p>

          </div>

        ) : (

          <div
            style={styles.messageList}
          >

            {messages.map(
              (message) => {

                const statusStyle =
                  getStatusStyle(
                    message.status
                  );

                return (
                  <div
                    key={message._id}
                    style={
                      styles.messageItem
                    }
                  >

                    {/* MESSAGE TOP */}
                    <div
                      style={
                        styles.messageTop
                      }
                    >

                      <div>

                        <div
                          style={
                            styles.recipientName
                          }
                        >
                          {message.recipientName ||
                            "Unknown Recipient"}
                        </div>

                        <div
                          style={
                            styles.contact
                          }
                        >
                          {message.recipientContact ||
                            "-"}
                        </div>

                      </div>

                      <div
                        style={{
                          ...styles.status,
                          background:
                            statusStyle.background,
                          color:
                            statusStyle.color,
                        }}
                      >
                        {message.status ||
                          "pending"}
                      </div>

                    </div>

                    {/* MESSAGE DETAILS */}
                    <div
                      style={
                        styles.messageDetails
                      }
                    >

                      <div>
                        Campaign:{" "}
                        <strong>
                          {getCampaignName(
                            message
                          )}
                        </strong>
                      </div>

                      <div>
                        Audience:{" "}
                        <strong>
                          {getAudienceName(
                            message
                          )}
                        </strong>
                      </div>

                      <div>
                        Channel:{" "}
                        <strong>
                          {message.channel
                            ? message.channel.toUpperCase()
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        Language:{" "}
                        <strong>
                          {message.language ||
                            "-"}
                        </strong>
                      </div>

                    </div>

                    {/* TIMESTAMPS */}
                    {(message.sentAt ||
                      message.deliveredAt) && (
                      <div
                        style={
                          styles.timestampRow
                        }
                      >

                        {message.sentAt && (
                          <span>
                            Sent:{" "}
                            {new Date(
                              message.sentAt
                            ).toLocaleString()}
                          </span>
                        )}

                        {message.deliveredAt && (
                          <span>
                            Delivered:{" "}
                            {new Date(
                              message.deliveredAt
                            ).toLocaleString()}
                          </span>
                        )}

                      </div>
                    )}

                    {/* ERROR */}
                    {message.errorMessage && (
                      <div
                        style={
                          styles.errorMessage
                        }
                      >
                        {message.errorMessage}
                      </div>
                    )}

                    {/* MESSAGE BODY */}
                    <div
                      style={
                        styles.messageBody
                      }
                    >
                      {message.message ||
                        "No message content"}
                    </div>

                    {/* ACTIONS */}
                    <div
                      style={
                        styles.messageActions
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(
                            message._id,
                            "pending"
                          )
                        }
                        style={{
                          ...styles.actionButton,
                          ...(message.status ===
                          "pending"
                            ? styles.actionButtonActive
                            : {}),
                        }}
                      >
                        Pending
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(
                            message._id,
                            "sent"
                          )
                        }
                        style={{
                          ...styles.actionButton,
                          ...(message.status ===
                          "sent"
                            ? styles.actionButtonActive
                            : {}),
                        }}
                      >
                        Sent
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(
                            message._id,
                            "delivered"
                          )
                        }
                        style={{
                          ...styles.actionButton,
                          ...(message.status ===
                          "delivered"
                            ? styles.actionButtonActive
                            : {}),
                        }}
                      >
                        Delivered
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusUpdate(
                            message._id,
                            "failed"
                          )
                        }
                        style={{
                          ...styles.actionButton,
                          ...(message.status ===
                          "failed"
                            ? styles.actionButtonActive
                            : {}),
                        }}
                      >
                        Failed
                      </button>

                      {canDeleteMessage && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              message._id
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          Delete
                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// ======================================
// STAT CARD
// ======================================
function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      style={styles.statCard}
    >

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

// ======================================
// STYLES
// ======================================
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "32px 36px 50px",
    margin: 0,
    background: "#f5f7fb",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: "30px",
    fontWeight: "800",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  headerIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e8eaf3",
    borderRadius: "18px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.04)",
  },

  statIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "13px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
    fontWeight: "700",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
  },

  statValue: {
    color: "#111827",
    fontSize: "25px",
    fontWeight: "800",
    marginTop: "3px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e8eaf3",
    borderRadius: "22px",
    padding: "27px",
    marginBottom: "24px",
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  cardTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "19px",
    fontWeight: "800",
  },

  cardDescription: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  smallIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "8px",
  },

  required: {
    color: "#ef4444",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dfe3eb",
    borderRadius: "11px",
    padding: "12px 13px",
    fontSize: "13px",
    color: "#1e293b",
    background: "#ffffff",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dfe3eb",
    borderRadius: "11px",
    padding: "13px",
    fontSize: "13px",
    color: "#1e293b",
    background: "#ffffff",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },

  helperText: {
    marginTop: "7px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },

  clearButton: {
    border: "1px solid #dfe3eb",
    background: "#ffffff",
    color: "#64748b",
    borderRadius: "11px",
    padding: "11px 18px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  createButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    borderRadius: "11px",
    padding: "11px 20px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },

  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  messageCount: {
    color: "#6366f1",
    background: "#eef2ff",
    borderRadius: "20px",
    padding: "7px 12px",
    fontSize: "11px",
    fontWeight: "800",
  },

  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  messageItem: {
    border: "1px solid #e8eaf3",
    borderRadius: "17px",
    padding: "19px",
    background: "#fcfcfe",
  },

  messageTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
  },

  recipientName: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "800",
  },

  contact: {
    color: "#94a3b8",
    fontSize: "11px",
    marginTop: "4px",
  },

  status: {
    borderRadius: "20px",
    padding: "6px 11px",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "capitalize",
  },

  messageDetails: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    marginTop: "15px",
    color: "#64748b",
    fontSize: "11px",
  },

  timestampRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "11px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  errorMessage: {
    marginTop: "12px",
    padding: "10px 12px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "9px",
    color: "#be123c",
    fontSize: "10px",
    lineHeight: "1.5",
  },

  messageBody: {
    marginTop: "15px",
    padding: "13px",
    background: "#ffffff",
    border: "1px solid #eef0f5",
    borderRadius: "11px",
    color: "#334155",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  messageActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "15px",
  },

  actionButton: {
    border: "1px solid #dfe3eb",
    background: "#ffffff",
    color: "#475569",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  actionButtonActive: {
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    color: "#4f46e5",
  },

  deleteButton: {
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "10px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#94a3b8",
  },

  emptyIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "16px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontSize: "22px",
  },

  emptyTitle: {
    margin: 0,
    color: "#334155",
    fontSize: "15px",
  },

  emptyText: {
    marginTop: "7px",
    fontSize: "12px",
  },
};

export default Messages;