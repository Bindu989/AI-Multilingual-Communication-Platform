import { useEffect, useState } from "react";
import api from "../services/api";

function Translations() {
  // =========================
  // USER / ROLE
  // =========================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userRole = user.role;

  const canDeleteTranslation =
    userRole === "admin";

  // =========================
  // TRANSLATION STATE
  // =========================
  const [sourceText, setSourceText] = useState("");
  const [sourceLanguage, setSourceLanguage] =
    useState("English");
  const [targetLanguage, setTargetLanguage] =
    useState("Telugu");

  const [translatedText, setTranslatedText] =
    useState("");

  const [translations, setTranslations] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] =
    useState(true);

  const [error, setError] = useState("");

  // =========================
  // LANGUAGES
  // =========================
  const languages = [
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
  ];

  // =========================
  // FETCH TRANSLATION HISTORY
  // =========================
  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      setLoadingHistory(true);

      const response = await api.get(
        "/translations"
      );

      setTranslations(
        response.data.translations ||
          response.data ||
          []
      );
    } catch (err) {
      console.error(
        "Failed to fetch translations:",
        err
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  // =========================
  // TRANSLATE
  // =========================
  const handleTranslate = async (e) => {
    e.preventDefault();

    console.log(
      "TRANSLATE BUTTON CLICKED"
    );

    console.log(
      "Source Text:",
      sourceText
    );

    console.log(
      "Source Language:",
      sourceLanguage
    );

    console.log(
      "Target Language:",
      targetLanguage
    );

    // Empty text validation
    if (!sourceText.trim()) {
      setError(
        "Please enter text to translate."
      );
      return;
    }

    // Same language validation
    if (
      sourceLanguage === targetLanguage
    ) {
      setError(
        "Source and target languages should be different."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTranslatedText("");

      console.log(
        "Sending translation request..."
      );

      const response = await api.post(
        "/translations/translate",
        {
          sourceText: sourceText.trim(),
          sourceLanguage,
          targetLanguage,
        }
      );

      console.log(
        "Translation response:",
        response.data
      );

      const result = response.data;

      setTranslatedText(
        result.translatedText || ""
      );

      // Add latest translation to history
      setTranslations((prev) => [
        result,
        ...prev,
      ]);
    } catch (err) {
      console.error(
        "Translation failed:",
        err.response?.data ||
          err.message
      );

      setError(
        err.response?.data?.message ||
          "Translation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE TRANSLATION
  // ADMIN ONLY
  // =========================
  const handleDelete = async (id) => {
    // Frontend permission protection
    if (!canDeleteTranslation) {
      setError(
        "You do not have permission to delete translations."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this translation?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/translations/${id}`
      );

      setTranslations((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete failed:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete translation."
      );
    }
  };

  // =========================
  // CLEAR FORM
  // =========================
  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setError("");
  };

  return (
    <div style={styles.page}>

      {/* =========================
          HEADER
      ========================== */}
      <div style={styles.header}>

        <div>
          <p style={styles.eyebrow}>
            AI COMMUNICATION
          </p>

          <h1 style={styles.title}>
            AI Translation
          </h1>

          <p style={styles.subtitle}>
            Translate your communication into
            multiple languages using AI.
          </p>
        </div>

        <div style={styles.headerBadge}>
          <span style={styles.sparkle}>
            ✦
          </span>

          AI Powered
        </div>
      </div>

      {/* =========================
          TRANSLATION CARD
      ========================== */}
      <div style={styles.translationCard}>

        <div style={styles.cardHeader}>

          <div>
            <h2 style={styles.cardTitle}>
              Translate Message
            </h2>

            <p style={styles.cardSubtitle}>
              Enter your message and select
              the required languages.
            </p>
          </div>

          <div style={styles.aiIcon}>
            ✦
          </div>

        </div>

        <form
          onSubmit={handleTranslate}
        >

          {/* =========================
              LANGUAGE SELECTION
          ========================== */}
          <div style={styles.languageRow}>

            <div style={styles.field}>

              <label style={styles.label}>
                Source Language
              </label>

              <select
                value={sourceLanguage}
                onChange={(e) =>
                  setSourceLanguage(
                    e.target.value
                  )
                }
                style={styles.select}
              >
                {languages.map(
                  (language) => (
                    <option
                      key={`source-${language}`}
                      value={language}
                    >
                      {language}
                    </option>
                  )
                )}
              </select>

            </div>

            <div style={styles.swapIcon}>
              →
            </div>

            <div style={styles.field}>

              <label style={styles.label}>
                Target Language
              </label>

              <select
                value={targetLanguage}
                onChange={(e) =>
                  setTargetLanguage(
                    e.target.value
                  )
                }
                style={styles.select}
              >
                {languages.map(
                  (language) => (
                    <option
                      key={`target-${language}`}
                      value={language}
                    >
                      {language}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

          {/* =========================
              TEXT AREAS
          ========================== */}
          <div style={styles.textGrid}>

            {/* SOURCE */}
            <div>

              <label style={styles.label}>
                Source Text
              </label>

              <textarea
                value={sourceText}
                onChange={(e) =>
                  setSourceText(
                    e.target.value
                  )
                }
                placeholder="Enter the message you want to translate..."
                style={styles.textarea}
                rows="8"
              />

            </div>

            {/* RESULT */}
            <div>

              <label style={styles.label}>
                Translated Text
              </label>

              <div style={styles.resultBox}>

                {loading ? (

                  <div style={styles.loading}>

                    <div
                      style={styles.loader}
                    ></div>

                    <span>
                      AI is translating...
                    </span>

                  </div>

                ) : translatedText ? (

                  <p
                    style={
                      styles.resultText
                    }
                  >
                    {translatedText}
                  </p>

                ) : (

                  <div
                    style={
                      styles.emptyResult
                    }
                  >

                    <span
                      style={
                        styles.emptyIcon
                      }
                    >
                      ✦
                    </span>

                    <p
                      style={
                        styles.emptyTitle
                      }
                    >
                      Translation will appear
                      here
                    </p>

                    <p
                      style={
                        styles.emptyText
                      }
                    >
                      Enter your message and
                      click Translate.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </div>

          {/* =========================
              ERROR
          ========================== */}
          {error && (
            <div style={styles.error}>
              ⚠ {error}
            </div>
          )}

          {/* =========================
              BUTTONS
          ========================== */}
          <div style={styles.buttonRow}>

            <button
              type="button"
              style={styles.clearButton}
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              type="submit"
              style={{
                ...styles.translateButton,
                opacity: loading
                  ? 0.7
                  : 1,
              }}
              disabled={loading}
            >
              {loading
                ? "Translating..."
                : "✦ Translate with AI"}
            </button>

          </div>

        </form>
      </div>

      {/* =========================
          TRANSLATION HISTORY
      ========================== */}
      <div style={styles.historyCard}>

        <div style={styles.historyHeader}>

          <div>

            <h2 style={styles.cardTitle}>
              Translation History
            </h2>

            <p style={styles.cardSubtitle}>
              Previously translated
              communication messages.
            </p>

          </div>

          <div style={styles.countBadge}>
            {translations.length}{" "}
            translations
          </div>

        </div>

        {/* LOADING */}
        {loadingHistory ? (

          <div style={styles.historyEmpty}>
            Loading translation history...
          </div>

        ) : translations.length === 0 ? (

          /* EMPTY */
          <div style={styles.historyEmpty}>

            <div style={styles.historyIcon}>
              ◎
            </div>

            <h3 style={styles.emptyTitle}>
              No translations yet
            </h3>

            <p style={styles.emptyText}>
              Your translated messages will
              appear here.
            </p>

          </div>

        ) : (

          /* HISTORY LIST */
          <div style={styles.historyList}>

            {translations.map((item) => (

              <div
                key={
                  item._id ||
                  `${item.sourceText}-${item.targetLanguage}-${item.createdAt}`
                }
                style={styles.historyItem}
              >

                <div
                  style={
                    styles.historyContent
                  }
                >

                  {/* LANGUAGES */}
                  <div
                    style={
                      styles.historyLanguages
                    }
                  >

                    <span
                      style={
                        styles.languageBadge
                      }
                    >
                      {item.sourceLanguage}
                    </span>

                    <span
                      style={styles.arrow}
                    >
                      →
                    </span>

                    <span
                      style={
                        styles.languageBadge
                      }
                    >
                      {item.targetLanguage}
                    </span>

                    {item.provider && (
                      <span
                        style={
                          styles.providerBadge
                        }
                      >
                        {item.provider}
                      </span>
                    )}

                  </div>

                  {/* SOURCE */}
                  <div
                    style={
                      styles.sourceHistory
                    }
                  >
                    {item.sourceText}
                  </div>

                  {/* TRANSLATED */}
                  <div
                    style={
                      styles.translatedHistory
                    }
                  >
                    {item.translatedText}
                  </div>

                </div>

                {/* =========================
                    DELETE - ADMIN ONLY
                ========================== */}
                {item._id &&
                  canDeleteTranslation && (
                    <button
                      type="button"
                      style={
                        styles.deleteButton
                      }
                      onClick={() =>
                        handleDelete(
                          item._id
                        )
                      }
                    >
                      Delete
                    </button>
                  )}

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    padding: "32px 36px 50px",
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
    margin: "0 0 7px",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    color: "#6366f1",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: "700",
  },

  sparkle: {
    fontSize: "16px",
  },

  translationCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "28px",
    border: "1px solid #e8eaf3",
    boxShadow:
      "0 12px 35px rgba(15,23,42,0.06)",
    marginBottom: "26px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#111827",
  },

  cardSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  aiIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "14px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  languageRow: {
    display: "grid",
    gridTemplateColumns:
      "1fr 55px 1fr",
    gap: "15px",
    alignItems: "end",
    marginBottom: "22px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: "11px",
    border:
      "1px solid #dbe1ea",
    background: "#ffffff",
    color: "#1e293b",
    fontSize: "13px",
    outline: "none",
  },

  swapIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6366f1",
    fontSize: "18px",
    fontWeight: "800",
    marginBottom: "1px",
  },

  textGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: "20px",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "13px",
    border:
      "1px solid #dbe1ea",
    resize: "vertical",
    fontFamily: "inherit",
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#1e293b",
    outline: "none",
  },

  resultBox: {
    minHeight: "205px",
    boxSizing: "border-box",
    padding: "15px",
    borderRadius: "13px",
    border:
      "1px solid #dbe1ea",
    background: "#fafbff",
  },

  resultText: {
    margin: 0,
    color: "#1e293b",
    fontSize: "14px",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
  },

  emptyResult: {
    minHeight: "175px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "28px",
    color: "#818cf8",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    color: "#334155",
    fontSize: "14px",
    fontWeight: "700",
  },

  emptyText: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  loading: {
    minHeight: "175px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "#64748b",
    fontSize: "13px",
  },

  loader: {
    width: "28px",
    height: "28px",
    border:
      "3px solid #e0e7ff",
    borderTop:
      "3px solid #6366f1",
    borderRadius: "50%",
  },

  error: {
    marginTop: "18px",
    padding: "12px 15px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "12px",
    fontWeight: "600",
  },

  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  clearButton: {
    border:
      "1px solid #dbe1ea",
    background: "#ffffff",
    color: "#475569",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
  },

  translateButton: {
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    padding: "12px 22px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 8px 20px rgba(79,70,229,0.22)",
  },

  historyCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "28px",
    border:
      "1px solid #e8eaf3",
    boxShadow:
      "0 12px 35px rgba(15,23,42,0.05)",
  },

  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  countBadge: {
    padding: "8px 12px",
    borderRadius: "10px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "700",
  },

  historyEmpty: {
    textAlign: "center",
    padding: "45px 20px",
    border:
      "1px dashed #dbe1ea",
    borderRadius: "15px",
  },

  historyIcon: {
    fontSize: "32px",
    color: "#818cf8",
    marginBottom: "10px",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  historyItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "18px",
    borderRadius: "14px",
    background: "#f8fafc",
    border:
      "1px solid #edf0f5",
  },

  historyContent: {
    flex: 1,
    minWidth: 0,
  },

  historyLanguages: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "10px",
  },

  languageBadge: {
    padding: "5px 9px",
    borderRadius: "7px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "10px",
    fontWeight: "800",
  },

  providerBadge: {
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#ecfdf5",
    color: "#059669",
    fontSize: "9px",
    fontWeight: "800",
    textTransform: "uppercase",
  },

  arrow: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  sourceHistory: {
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "7px",
  },

  translatedHistory: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "700",
  },

  deleteButton: {
    border: "none",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "9px 13px",
    borderRadius: "9px",
    fontSize: "11px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Translations;