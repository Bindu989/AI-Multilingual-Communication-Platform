import { useEffect, useState } from "react";
import api from "../services/api";

function Audiences() {
  // ==========================================
  // USER / ROLE
  // ==========================================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userRole = user.role;

  const canCreateAudience =
    userRole === "admin" ||
    userRole === "campaign_manager";

  const canDeleteAudience =
    userRole === "admin";

  const canManageRecipients =
    userRole === "admin" ||
    userRole === "campaign_manager";

  // ==========================================
  // STATE
  // ==========================================
  const [audiences, setAudiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Recipient modal
  const [selectedAudience, setSelectedAudience] =
    useState(null);

  const [showRecipientModal, setShowRecipientModal] =
    useState(false);

  const [savingRecipient, setSavingRecipient] =
    useState(false);

  const [editingRecipientId, setEditingRecipientId] =
    useState(null);

  // ==========================================
  // AUDIENCE FORM
  // ==========================================
  const emptyForm = {
    name: "",
    language: "",
    location: "",
    occupation: "",
    age: "",
    gender: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);

  // ==========================================
  // RECIPIENT FORM
  // ==========================================
  const emptyRecipientForm = {
    name: "",
    email: "",
    phone: "",
  };

  const [recipientForm, setRecipientForm] =
    useState(emptyRecipientForm);

  // ==========================================
  // FETCH AUDIENCES
  // ==========================================
  const fetchAudiences = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/audiences");

      setAudiences(
        response.data?.audiences || []
      );
    } catch (err) {
      console.error(
        "Fetch audiences error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load audiences"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchAudiences();
  }, []);

  // ==========================================
  // AUDIENCE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET AUDIENCE FORM
  // ==========================================
  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
  };

  // ==========================================
  // CREATE AUDIENCE
  // ==========================================
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!canCreateAudience) {
      setError(
        "You do not have permission to create audiences."
      );
      return;
    }

    setError("");
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.language.trim() ||
      !formData.location.trim() ||
      !formData.occupation.trim() ||
      !formData.age ||
      !formData.gender
    ) {
      setError(
        "Please fill all required audience fields."
      );
      return;
    }

    const numericAge =
      Number(formData.age);

    if (
      Number.isNaN(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setError(
        "Please enter a valid age between 1 and 120."
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        name: formData.name.trim(),
        language:
          formData.language.trim(),
        location:
          formData.location.trim(),
        occupation:
          formData.occupation.trim(),
        age: numericAge,
        gender: formData.gender,
      };

      const response =
        await api.post(
          "/audiences",
          payload
        );

      const createdAudience =
        response.data?.audience;

      if (createdAudience) {
        setAudiences((prev) => [
          createdAudience,
          ...prev,
        ]);
      } else {
        await fetchAudiences();
      }

      setMessage(
        "Audience created successfully!"
      );

      setFormData(emptyForm);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Create audience error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create audience"
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // DELETE AUDIENCE
  // ==========================================
  const handleDelete = async (id) => {
    if (!canDeleteAudience) {
      setError(
        "You do not have permission to delete audiences."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this audience?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.delete(
        `/audiences/${id}`
      );

      setAudiences((prev) =>
        prev.filter(
          (audience) =>
            audience._id !== id
        )
      );

      setMessage(
        "Audience deleted successfully!"
      );

      if (
        selectedAudience?._id === id
      ) {
        closeRecipientModal();
      }
    } catch (err) {
      console.error(
        "Delete audience error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete audience"
      );
    }
  };

  // ==========================================
  // OPEN RECIPIENT MODAL
  // ==========================================
  const openRecipientModal = (
    audience
  ) => {
    setSelectedAudience(audience);
    setRecipientForm(
      emptyRecipientForm
    );
    setEditingRecipientId(null);
    setShowRecipientModal(true);

    setError("");
    setMessage("");
  };

  // ==========================================
  // CLOSE RECIPIENT MODAL
  // ==========================================
  const closeRecipientModal = () => {
    setSelectedAudience(null);
    setShowRecipientModal(false);
    setRecipientForm(
      emptyRecipientForm
    );
    setEditingRecipientId(null);
  };

  // ==========================================
  // RECIPIENT INPUT CHANGE
  // ==========================================
  const handleRecipientChange = (
    e
  ) => {
    const { name, value } = e.target;

    setRecipientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // START ADD RECIPIENT
  // ==========================================
  const startAddRecipient = () => {
    setEditingRecipientId(null);

    setRecipientForm(
      emptyRecipientForm
    );

    setError("");
    setMessage("");
  };

  // ==========================================
  // START EDIT RECIPIENT
  // ==========================================
  const startEditRecipient = (
    recipient
  ) => {
    setEditingRecipientId(
      recipient._id
    );

    setRecipientForm({
      name: recipient.name || "",
      email: recipient.email || "",
      phone: recipient.phone || "",
    });

    setError("");
    setMessage("");
  };

  // ==========================================
  // CANCEL RECIPIENT EDIT
  // ==========================================
  const cancelRecipientEdit = () => {
    setEditingRecipientId(null);

    setRecipientForm(
      emptyRecipientForm
    );
  };

  // ==========================================
  // VALIDATE RECIPIENT
  // ==========================================
  const validateRecipient = () => {
    const name =
      recipientForm.name.trim();

    const email =
      recipientForm.email
        .trim()
        .toLowerCase();

    const phone =
      recipientForm.phone.trim();

    if (!name) {
      return "Recipient name is required.";
    }

    if (!email && !phone) {
      return "Enter at least an email address or phone number.";
    }

    if (email) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        return "Please enter a valid email address.";
      }
    }

    if (phone) {
      const phonePattern =
        /^[0-9+\-\s()]{7,20}$/;

      if (!phonePattern.test(phone)) {
        return "Please enter a valid phone number.";
      }
    }

    return "";
  };

  // ==========================================
  // SAVE RECIPIENT
  // ==========================================
  const handleSaveRecipient =
    async (e) => {
      e.preventDefault();

      if (!canManageRecipients) {
        setError(
          "You do not have permission to manage recipients."
        );
        return;
      }

      if (!selectedAudience) {
        return;
      }

      setError("");
      setMessage("");

      const validationError =
        validateRecipient();

      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        setSavingRecipient(true);

        const payload = {
          name:
            recipientForm.name.trim(),
          email:
            recipientForm.email
              .trim()
              .toLowerCase(),
          phone:
            recipientForm.phone.trim(),
        };

        if (editingRecipientId) {
          // ======================================
          // UPDATE RECIPIENT
          // ======================================
          const response =
            await api.put(
              `/audiences/${selectedAudience._id}/recipients/${editingRecipientId}`,
              payload
            );

          const updatedAudience =
            response.data?.audience;

          if (updatedAudience) {
            updateAudienceInState(
              updatedAudience
            );

            setSelectedAudience(
              updatedAudience
            );
          } else {
            await refreshSelectedAudience();
          }

          setMessage(
            "Recipient updated successfully!"
          );
        } else {
          // ======================================
          // ADD RECIPIENT
          // ======================================
          const response =
            await api.post(
              `/audiences/${selectedAudience._id}/recipients`,
              payload
            );

          const updatedAudience =
            response.data?.audience;

          if (updatedAudience) {
            updateAudienceInState(
              updatedAudience
            );

            setSelectedAudience(
              updatedAudience
            );
          } else {
            await refreshSelectedAudience();
          }

          setMessage(
            "Recipient added successfully!"
          );
        }

        setRecipientForm(
          emptyRecipientForm
        );

        setEditingRecipientId(null);
      } catch (err) {
        console.error(
          "Save recipient error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to save recipient"
        );
      } finally {
        setSavingRecipient(false);
      }
    };

  // ==========================================
  // UPDATE AUDIENCE IN STATE
  // ==========================================
  const updateAudienceInState = (
    updatedAudience
  ) => {
    setAudiences((prev) =>
      prev.map((audience) =>
        audience._id ===
        updatedAudience._id
          ? updatedAudience
          : audience
      )
    );
  };

  // ==========================================
  // REFRESH SELECTED AUDIENCE
  // ==========================================
  const refreshSelectedAudience =
    async () => {
      if (!selectedAudience?._id) {
        return;
      }

      const response =
        await api.get(
          `/audiences/${selectedAudience._id}`
        );

      const updatedAudience =
        response.data?.audience;

      if (updatedAudience) {
        updateAudienceInState(
          updatedAudience
        );

        setSelectedAudience(
          updatedAudience
        );
      }
    };

  // ==========================================
  // DELETE RECIPIENT
  // ==========================================
  const handleDeleteRecipient =
    async (recipientId) => {
      if (!canManageRecipients) {
        setError(
          "You do not have permission to delete recipients."
        );
        return;
      }

      if (!selectedAudience) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this recipient?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");
        setMessage("");

        const response =
          await api.delete(
            `/audiences/${selectedAudience._id}/recipients/${recipientId}`
          );

        const updatedAudience =
          response.data?.audience;

        if (updatedAudience) {
          updateAudienceInState(
            updatedAudience
          );

          setSelectedAudience(
            updatedAudience
          );
        } else {
          await refreshSelectedAudience();
        }

        if (
          editingRecipientId ===
          recipientId
        ) {
          cancelRecipientEdit();
        }

        setMessage(
          "Recipient deleted successfully!"
        );
      } catch (err) {
        console.error(
          "Delete recipient error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to delete recipient"
        );
      }
    };

  // ==========================================
  // STATISTICS
  // ==========================================
  const languageCount = new Set(
    audiences
      .map(
        (audience) =>
          audience.language
      )
      .filter(Boolean)
  ).size;

  const locationCount = new Set(
    audiences
      .map(
        (audience) =>
          audience.location
      )
      .filter(Boolean)
  ).size;

  const totalRecipients =
    audiences.reduce(
      (total, audience) =>
        total +
        (audience.recipients
          ?.length || 0),
      0
    );

  // ==========================================
  // DISPLAY HELPERS
  // ==========================================
  const formatGender = (
    gender
  ) => {
    if (!gender) {
      return "";
    }

    return (
      gender.charAt(0).toUpperCase() +
      gender.slice(1)
    );
  };

  const getRecipientCount = (
    audience
  ) => {
    return (
      audience.recipients?.length || 0
    );
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div style={styles.page}>

      {/* ======================================
          TOP HEADER
      ====================================== */}
      <div style={styles.topBar}>

        <div>
          <div style={styles.breadcrumb}>
            Dashboard <span>›</span> Audiences
          </div>

          <div style={styles.headingRow}>

            <div
              style={
                styles.headingIcon
              }
            >
              👥
            </div>

            <div>
              <h1 style={styles.title}>
                Audience Management
              </h1>

              <p
                style={styles.subtitle}
              >
                Build and manage targeted
                communication groups across
                languages, locations and
                occupations.
              </p>
            </div>

          </div>
        </div>

        {/* CREATE BUTTON */}
        {canCreateAudience && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");

              setShowForm(
                (prev) => !prev
              );
            }}
            style={{
              ...styles.addButton,
              ...(showForm
                ? styles.closeButton
                : {}),
            }}
          >
            <span
              style={
                styles.buttonIcon
              }
            >
              {showForm ? "×" : "+"}
            </span>

            {showForm
              ? "Close"
              : "Create Audience"}
          </button>
        )}

      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}
      {message && (
        <div style={styles.success}>
          <span>✓</span>
          {message}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}
      {error && (
        <div style={styles.error}>
          <span>!</span>
          {error}
        </div>
      )}

      {/* ======================================
          CREATE AUDIENCE FORM
      ====================================== */}
      {showForm &&
        canCreateAudience && (
          <form
            onSubmit={handleCreate}
            style={styles.formCard}
          >

            <div
              style={styles.formHeader}
            >

              <div
                style={
                  styles.formHeaderIcon
                }
              >
                ✦
              </div>

              <div>

                <h2
                  style={
                    styles.formTitle
                  }
                >
                  Create New Audience
                </h2>

                <p
                  style={
                    styles.formSubtitle
                  }
                >
                  Define the people you want
                  to reach with your
                  communication campaigns.
                </p>

              </div>

            </div>

            <div
              style={styles.formGrid}
            >

              {/* Audience Name */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Audience Name
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    👥
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Telangana Farmers"
                    required
                    style={styles.input}
                  />

                </div>
              </div>

              {/* Language */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Language
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    🌐
                  </span>

                  <select
                    name="language"
                    value={
                      formData.language
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={styles.input}
                  >

                    <option value="">
                      Select Language
                    </option>

                    <option value="Telugu">
                      Telugu
                    </option>

                    <option value="English">
                      English
                    </option>

                    <option value="Hindi">
                      Hindi
                    </option>

                    <option value="Tamil">
                      Tamil
                    </option>

                    <option value="Kannada">
                      Kannada
                    </option>

                    <option value="Malayalam">
                      Malayalam
                    </option>

                    <option value="Bengali">
                      Bengali
                    </option>

                    <option value="Marathi">
                      Marathi
                    </option>

                    <option value="Gujarati">
                      Gujarati
                    </option>

                    <option value="Punjabi">
                      Punjabi
                    </option>

                    <option value="Spanish">
                      Spanish
                    </option>

                    <option value="French">
                      French
                    </option>

                    <option value="German">
                      German
                    </option>

                    <option value="Italian">
                      Italian
                    </option>

                    <option value="Portuguese">
                      Portuguese
                    </option>

                    <option value="Japanese">
                      Japanese
                    </option>

                    <option value="Korean">
                      Korean
                    </option>

                    <option value="Chinese">
                      Chinese
                    </option>

                  </select>

                </div>
              </div>

              {/* Location */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Location
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    📍
                  </span>

                  <input
                    type="text"
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Telangana"
                    required
                    style={styles.input}
                  />

                </div>
              </div>

              {/* Occupation */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Occupation
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    💼
                  </span>

                  <input
                    type="text"
                    name="occupation"
                    value={
                      formData.occupation
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Farmer"
                    required
                    style={styles.input}
                  />

                </div>
              </div>

              {/* Age */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Age
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    🎯
                  </span>

                  <input
                    type="number"
                    name="age"
                    value={
                      formData.age
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 35"
                    min="1"
                    max="120"
                    required
                    style={styles.input}
                  />

                </div>
              </div>

              {/* Gender */}
              <div style={styles.field}>

                <label
                  style={styles.label}
                >
                  Gender
                </label>

                <div
                  style={
                    styles.inputWrapper
                  }
                >

                  <span
                    style={
                      styles.inputIcon
                    }
                  >
                    👤
                  </span>

                  <select
                    name="gender"
                    value={
                      formData.gender
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={styles.input}
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>
              </div>

            </div>

            {/* FORM ACTIONS */}
            <div
              style={
                styles.formActions
              }
            >

              <button
                type="button"
                onClick={
                  resetForm
                }
                style={
                  styles.cancelButton
                }
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  ...styles.createButton,
                  opacity: creating
                    ? 0.7
                    : 1,
                }}
                disabled={creating}
              >

                <span>
                  {creating
                    ? "⏳"
                    : "+"}
                </span>

                {creating
                  ? "Creating..."
                  : "Create Audience"}

              </button>

            </div>
          </form>
        )}

      {/* ======================================
          STATS
      ====================================== */}
      <div style={styles.statsGrid}>

        {/* Total Audiences */}
        <div style={styles.statCard}>

          <div style={styles.statTop}>

            <div
              style={
                styles.statIconPurple
              }
            >
              👥
            </div>

            <span
              style={
                styles.statBadge
              }
            >
              Active
            </span>

          </div>

          <div
            style={styles.statNumber}
          >
            {audiences.length}
          </div>

          <div
            style={styles.statLabel}
          >
            Total Audiences
          </div>

          <div
            style={styles.statFooter}
          >
            <span
              style={
                styles.statArrow
              }
            >
              ↗
            </span>

            Configured audience groups
          </div>

        </div>

        {/* Languages */}
        <div style={styles.statCard}>

          <div style={styles.statTop}>

            <div
              style={
                styles.statIconBlue
              }
            >
              🌐
            </div>

            <span
              style={
                styles.statBadgeBlue
              }
            >
              Languages
            </span>

          </div>

          <div
            style={styles.statNumber}
          >
            {languageCount}
          </div>

          <div
            style={styles.statLabel}
          >
            Supported Languages
          </div>

          <div
            style={styles.statFooter}
          >

            <span
              style={
                styles.statArrow
              }
            >
              ↗
            </span>

            Multilingual reach
          </div>

        </div>

        {/* Locations */}
        <div style={styles.statCard}>

          <div style={styles.statTop}>

            <div
              style={
                styles.statIconOrange
              }
            >
              📍
            </div>

            <span
              style={
                styles.statBadgeOrange
              }
            >
              Reach
            </span>

          </div>

          <div
            style={styles.statNumber}
          >
            {locationCount}
          </div>

          <div
            style={styles.statLabel}
          >
            Target Locations
          </div>

          <div
            style={styles.statFooter}
          >

            <span
              style={
                styles.statArrow
              }
            >
              ↗
            </span>

            Geographic segments
          </div>

        </div>

        {/* Recipients */}
        <div style={styles.statCard}>

          <div style={styles.statTop}>

            <div
              style={
                styles.statIconGreen
              }
            >
              👤
            </div>

            <span
              style={
                styles.statBadgeGreen
              }
            >
              Reach
            </span>

          </div>

          <div
            style={styles.statNumber}
          >
            {totalRecipients}
          </div>

          <div
            style={styles.statLabel}
          >
            Total Recipients
          </div>

          <div
            style={styles.statFooter}
          >

            <span
              style={
                styles.statArrow
              }
            >
              ↗
            </span>

            Communication contacts
          </div>

        </div>

      </div>

      {/* ======================================
          AUDIENCE SECTION
      ====================================== */}
      <div style={styles.sectionCard}>

        <div
          style={styles.sectionHeader}
        >

          <div>

            <div
              style={
                styles.sectionTitleRow
              }
            >

              <div
                style={
                  styles.sectionIcon
                }
              >
                ◉
              </div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Audience Groups
              </h2>

            </div>

            <p
              style={
                styles.sectionSubtitle
              }
            >
              Manage your configured target
              audiences
            </p>

          </div>

          <div
            style={
              styles.groupCount
            }
          >
            {audiences.length} Groups
          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div
            style={
              styles.emptyState
            }
          >

            <div
              style={
                styles.loadingCircle
              }
            >
              ⟳
            </div>

            <h3
              style={
                styles.emptyTitle
              }
            >
              Loading audiences
            </h3>

            <p
              style={
                styles.emptyText
              }
            >
              Please wait while we fetch your
              audience groups.
            </p>

          </div>

        ) : audiences.length ===
          0 ? (

          /* EMPTY STATE */
          <div
            style={
              styles.emptyState
            }
          >

            <div
              style={
                styles.emptyIcon
              }
            >
              👥
            </div>

            <h3
              style={
                styles.emptyTitle
              }
            >
              No audiences yet
            </h3>

            <p
              style={
                styles.emptyText
              }
            >
              Create your first audience group
              to start building targeted
              communication campaigns.
            </p>

            {canCreateAudience && (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setShowForm(true);
                }}
                style={
                  styles.emptyButton
                }
              >
                + Create First Audience
              </button>
            )}

          </div>

        ) : (

          /* AUDIENCE LIST */
          <div
            style={
              styles.audienceList
            }
          >

            {audiences.map(
              (audience, index) => (

                <div
                  key={
                    audience._id
                  }
                  style={{
                    ...styles.audienceRow,
                    ...(index ===
                    audiences.length - 1
                      ? {
                          borderBottom:
                            "none",
                        }
                      : {}),
                  }}
                >

                  {/* AVATAR */}
                  <div
                    style={
                      styles.audienceAvatar
                    }
                  >
                    {audience.name
                      ? audience.name
                          .charAt(0)
                          .toUpperCase()
                      : "A"}
                  </div>

                  {/* MAIN CONTENT */}
                  <div
                    style={
                      styles.audienceMain
                    }
                  >

                    <div
                      style={
                        styles.audienceNameRow
                      }
                    >

                      <h3
                        style={
                          styles.audienceName
                        }
                      >
                        {audience.name}
                      </h3>

                      <span
                        style={
                          styles.activeDot
                        }
                      >
                        <span
                          style={
                            styles.activeDotCircle
                          }
                        ></span>

                        Active
                      </span>

                    </div>

                    <div
                      style={
                        styles.tags
                      }
                    >

                      {/* LANGUAGE */}
                      {audience.language && (
                        <span
                          style={
                            styles.tagPurple
                          }
                        >
                          🌐{" "}
                          {
                            audience.language
                          }
                        </span>
                      )}

                      {/* LOCATION */}
                      {audience.location && (
                        <span
                          style={
                            styles.tagBlue
                          }
                        >
                          📍{" "}
                          {
                            audience.location
                          }
                        </span>
                      )}

                      {/* OCCUPATION */}
                      {audience.occupation && (
                        <span
                          style={
                            styles.tagOrange
                          }
                        >
                          💼{" "}
                          {
                            audience.occupation
                          }
                        </span>
                      )}

                      {/* AGE */}
                      {audience.age && (
                        <span
                          style={
                            styles.tagGreen
                          }
                        >
                          🎯 Age{" "}
                          {audience.age}
                        </span>
                      )}

                      {/* GENDER */}
                      {audience.gender && (
                        <span
                          style={
                            styles.tagPink
                          }
                        >
                          👤{" "}
                          {formatGender(
                            audience.gender
                          )}
                        </span>
                      )}

                      {/* RECIPIENT COUNT */}
                      <span
                        style={
                          styles.tagSlate
                        }
                      >
                        👥{" "}
                        {getRecipientCount(
                          audience
                        )}{" "}
                        {getRecipientCount(
                          audience
                        ) === 1
                          ? "Recipient"
                          : "Recipients"}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div
                    style={
                      styles.audienceActions
                    }
                  >

                    {/* MANAGE RECIPIENTS */}
                    <button
                      type="button"
                      onClick={() =>
                        openRecipientModal(
                          audience
                        )
                      }
                      style={
                        styles.manageButton
                      }
                    >
                      👥 Manage
                    </button>

                    {/* DELETE AUDIENCE */}
                    {canDeleteAudience && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            audience._id
                          )
                        }
                        style={
                          styles.deleteButton
                        }
                        title="Delete audience"
                      >
                        🗑
                      </button>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ======================================
          FOOTER INFO
      ====================================== */}
      <div
        style={
          styles.bottomInfo
        }
      >

        <div
          style={
            styles.bottomIcon
          }
        >
          💡
        </div>

        <div>

          <strong
            style={
              styles.bottomInfoStrong
            }
          >
            Smart audience targeting
          </strong>

          <p>
            Use language, location, occupation,
            age and gender segments to deliver
            more relevant multilingual
            communications.
          </p>

        </div>

      </div>

      {/* ======================================
          RECIPIENT MODAL
      ====================================== */}
      {showRecipientModal &&
        selectedAudience && (
          <div
            style={
              styles.modalOverlay
            }
          >

            <div
              style={
                styles.modalCard
              }
            >

              {/* MODAL HEADER */}
              <div
                style={
                  styles.modalHeader
                }
              >

                <div>
                  <div
                    style={
                      styles.modalEyebrow
                    }
                  >
                    Audience Recipients
                  </div>

                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    {
                      selectedAudience.name
                    }
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Manage people included in this
                    communication audience.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeRecipientModal
                  }
                  style={
                    styles.modalCloseButton
                  }
                >
                  ×
                </button>

              </div>

              {/* MODAL MESSAGES */}
              {message && (
                <div
                  style={
                    styles.modalSuccess
                  }
                >
                  <span>✓</span>
                  {message}
                </div>
              )}

              {error && (
                <div
                  style={
                    styles.modalError
                  }
                >
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* RECIPIENT FORM */}
              {canManageRecipients && (
                <form
                  onSubmit={
                    handleSaveRecipient
                  }
                  style={
                    styles.recipientFormCard
                  }
                >

                  <div
                    style={
                      styles.recipientFormHeader
                    }
                  >

                    <div>
                      <h3
                        style={
                          styles.recipientFormTitle
                        }
                      >
                        {editingRecipientId
                          ? "Edit Recipient"
                          : "Add Recipient"}
                      </h3>

                      <p
                        style={
                          styles.recipientFormSubtitle
                        }
                      >
                        Add an email, phone number,
                        or both.
                      </p>
                    </div>

                  </div>

                  <div
                    style={
                      styles.recipientFormGrid
                    }
                  >

                    {/* Recipient Name */}
                    <div
                      style={
                        styles.field
                      }
                    >

                      <label
                        style={
                          styles.label
                        }
                      >
                        Name
                      </label>

                      <div
                        style={
                          styles.inputWrapper
                        }
                      >

                        <span
                          style={
                            styles.inputIcon
                          }
                        >
                          👤
                        </span>

                        <input
                          type="text"
                          name="name"
                          value={
                            recipientForm.name
                          }
                          onChange={
                            handleRecipientChange
                          }
                          placeholder="e.g. Anushka"
                          required
                          style={
                            styles.input
                          }
                        />

                      </div>

                    </div>

                    {/* Email */}
                    <div
                      style={
                        styles.field
                      }
                    >

                      <label
                        style={
                          styles.label
                        }
                      >
                        Email
                      </label>

                      <div
                        style={
                          styles.inputWrapper
                        }
                      >

                        <span
                          style={
                            styles.inputIcon
                          }
                        >
                          ✉️
                        </span>

                        <input
                          type="email"
                          name="email"
                          value={
                            recipientForm.email
                          }
                          onChange={
                            handleRecipientChange
                          }
                          placeholder="e.g. user@example.com"
                          style={
                            styles.input
                          }
                        />

                      </div>

                    </div>

                    {/* Phone */}
                    <div
                      style={
                        styles.field
                      }
                    >

                      <label
                        style={
                          styles.label
                        }
                      >
                        Phone
                      </label>

                      <div
                        style={
                          styles.inputWrapper
                        }
                      >

                        <span
                          style={
                            styles.inputIcon
                          }
                        >
                          📱
                        </span>

                        <input
                          type="text"
                          name="phone"
                          value={
                            recipientForm.phone
                          }
                          onChange={
                            handleRecipientChange
                          }
                          placeholder="e.g. 9876543210"
                          style={
                            styles.input
                          }
                        />

                      </div>

                    </div>

                  </div>

                  <div
                    style={
                      styles.recipientFormActions
                    }
                  >

                    {editingRecipientId && (
                      <button
                        type="button"
                        onClick={
                          cancelRecipientEdit
                        }
                        style={
                          styles.cancelButton
                        }
                      >
                        Cancel Edit
                      </button>
                    )}

                    <button
                      type="submit"
                      style={{
                        ...styles.saveRecipientButton,
                        opacity:
                          savingRecipient
                            ? 0.7
                            : 1,
                      }}
                      disabled={
                        savingRecipient
                      }
                    >
                      {savingRecipient
                        ? "Saving..."
                        : editingRecipientId
                        ? "Update Recipient"
                        : "+ Add Recipient"}
                    </button>

                  </div>

                </form>
              )}

              {/* RECIPIENT LIST */}
              <div
                style={
                  styles.recipientListHeader
                }
              >

                <div>
                  <h3
                    style={
                      styles.recipientListTitle
                    }
                  >
                    Recipients
                  </h3>

                  <p
                    style={
                      styles.recipientListSubtitle
                    }
                  >
                    {
                      getRecipientCount(
                        selectedAudience
                      )
                    }{" "}
                    contacts in this audience
                  </p>
                </div>

                {canManageRecipients && (
                  <button
                    type="button"
                    onClick={
                      startAddRecipient
                    }
                    style={
                      styles.addAnotherButton
                    }
                  >
                    + New
                  </button>
                )}

              </div>

              {getRecipientCount(
                selectedAudience
              ) === 0 ? (

                <div
                  style={
                    styles.recipientEmpty
                  }
                >

                  <div
                    style={
                      styles.recipientEmptyIcon
                    }
                  >
                    👤
                  </div>

                  <h4
                    style={
                      styles.recipientEmptyTitle
                    }
                  >
                    No recipients yet
                  </h4>

                  <p
                    style={
                      styles.recipientEmptyText
                    }
                  >
                    Add people to this audience
                    before running a communication
                    campaign.
                  </p>

                  {canManageRecipients && (
                    <button
                      type="button"
                      onClick={
                        startAddRecipient
                      }
                      style={
                        styles.emptyButton
                      }
                    >
                      + Add First Recipient
                    </button>
                  )}

                </div>

              ) : (

                <div
                  style={
                    styles.recipientList
                  }
                >

                  {selectedAudience.recipients.map(
                    (recipient) => (

                      <div
                        key={
                          recipient._id
                        }
                        style={
                          styles.recipientRow
                        }
                      >

                        <div
                          style={
                            styles.recipientAvatar
                          }
                        >
                          {recipient.name
                            ? recipient.name
                                .charAt(0)
                                .toUpperCase()
                            : "R"}
                        </div>

                        <div
                          style={
                            styles.recipientMain
                          }
                        >

                          <div
                            style={
                              styles.recipientName
                            }
                          >
                            {
                              recipient.name
                            }
                          </div>

                          <div
                            style={
                              styles.recipientContacts
                            }
                          >

                            {recipient.email && (
                              <span>
                                ✉️{" "}
                                {
                                  recipient.email
                                }
                              </span>
                            )}

                            {recipient.phone && (
                              <span>
                                📱{" "}
                                {
                                  recipient.phone
                                }
                              </span>
                            )}

                          </div>

                        </div>

                        {canManageRecipients && (
                          <div
                            style={
                              styles.recipientActions
                            }
                          >

                            <button
                              type="button"
                              onClick={() =>
                                startEditRecipient(
                                  recipient
                                )
                              }
                              style={
                                styles.editRecipientButton
                              }
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteRecipient(
                                  recipient._id
                                )
                              }
                              style={
                                styles.deleteRecipientButton
                              }
                            >
                              🗑
                            </button>

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

              {/* MODAL FOOTER */}
              <div
                style={
                  styles.modalFooter
                }
              >
                <span>
                  {canManageRecipients
                    ? "You can add, edit and remove recipients."
                    : "You have view-only access to recipients."}
                </span>

                <button
                  type="button"
                  onClick={
                    closeRecipientModal
                  }
                  style={
                    styles.modalDoneButton
                  }
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        )}

    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8f9ff 0%, #f5f7fb 100%)",
    padding: "38px 48px 50px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "30px",
    marginBottom: "30px",
  },

  breadcrumb: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "14px",
    fontWeight: "600",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  headingIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    boxShadow:
      "0 12px 28px rgba(79,70,229,0.25)",
  },

  title: {
    margin: 0,
    fontSize: "31px",
    fontWeight: "800",
    letterSpacing: "-0.7px",
    color: "#111827",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  addButton: {
    border: "none",
    borderRadius: "13px",
    padding: "14px 20px",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    boxShadow:
      "0 12px 25px rgba(79,70,229,0.24)",
  },

  closeButton: {
    background: "#111827",
    boxShadow:
      "0 10px 20px rgba(15,23,42,0.15)",
  },

  buttonIcon: {
    fontSize: "19px",
    lineHeight: 1,
  },

  success: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  error: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  formCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "27px",
    marginBottom: "26px",
    border: "1px solid #e8eaf3",
    boxShadow:
      "0 15px 45px rgba(15,23,42,0.08)",
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginBottom: "25px",
  },

  formHeaderIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  formTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
  },

  formSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dfe3ec",
    borderRadius: "11px",
    background: "#fbfcff",
    paddingLeft: "12px",
    transition: "all 0.2s ease",
  },

  inputIcon: {
    fontSize: "15px",
    marginRight: "8px",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 12px 12px 0",
    fontSize: "13px",
    color: "#172033",
    fontFamily: "inherit",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "23px",
    paddingTop: "20px",
    borderTop: "1px solid #eef2f7",
  },

  cancelButton: {
    border: "1px solid #dbe1ea",
    background: "#fff",
    color: "#475569",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  createButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    boxShadow:
      "0 8px 18px rgba(79,70,229,0.2)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "26px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "21px",
    border: "1px solid #e8eaf3",
    boxShadow:
      "0 8px 30px rgba(15,23,42,0.05)",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },

  statIconPurple: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statIconBlue: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statIconOrange: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#fff7ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statIconGreen: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#ecfdf5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "19px",
  },

  statBadge: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#4f46e5",
    background: "#eef2ff",
    padding: "5px 8px",
    borderRadius: "20px",
  },

  statBadgeBlue: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#2563eb",
    background: "#eff6ff",
    padding: "5px 8px",
    borderRadius: "20px",
  },

  statBadgeOrange: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#ea580c",
    background: "#fff7ed",
    padding: "5px 8px",
    borderRadius: "20px",
  },

  statBadgeGreen: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#059669",
    background: "#ecfdf5",
    padding: "5px 8px",
    borderRadius: "20px",
  },

  statNumber: {
    fontSize: "29px",
    fontWeight: "800",
    color: "#111827",
    letterSpacing: "-0.5px",
  },

  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    marginTop: "2px",
  },

  statFooter: {
    marginTop: "15px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    fontSize: "10px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  statArrow: {
    color: "#10b981",
    fontWeight: "800",
  },

  sectionCard: {
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #e8eaf3",
    boxShadow:
      "0 10px 35px rgba(15,23,42,0.055)",
    overflow: "hidden",
  },

  sectionHeader: {
    padding: "23px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eef2f7",
  },

  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  sectionIcon: {
    width: "31px",
    height: "31px",
    borderRadius: "9px",
    background: "#f1f5ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "6px 0 0 41px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  groupCount: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    padding: "7px 11px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "700",
  },

  audienceList: {
    padding: "0 25px",
  },

  audienceRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "19px 0",
    borderBottom: "1px solid #eef2f7",
  },

  audienceAvatar: {
    width: "48px",
    height: "48px",
    flexShrink: 0,
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #4f46e5, #8b5cf6)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "18px",
    boxShadow:
      "0 7px 16px rgba(79,70,229,0.18)",
  },

  audienceMain: {
    flex: 1,
    minWidth: 0,
  },

  audienceNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  audienceName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "800",
    color: "#172033",
  },

  activeDot: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "9px",
    color: "#059669",
    background: "#ecfdf5",
    padding: "4px 7px",
    borderRadius: "20px",
    fontWeight: "700",
  },

  activeDotCircle: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#10b981",
    display: "inline-block",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "8px",
  },

  tagPurple: {
    background: "#f5f3ff",
    color: "#6d28d9",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  tagBlue: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  tagOrange: {
    background: "#fff7ed",
    color: "#c2410c",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  tagGreen: {
    background: "#ecfdf5",
    color: "#047857",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  tagPink: {
    background: "#fdf2f8",
    color: "#be185d",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  tagSlate: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
    padding: "5px 8px",
    borderRadius: "7px",
    fontSize: "9px",
    fontWeight: "600",
  },

  audienceActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "10px",
    flexShrink: 0,
  },

  manageButton: {
    border: "none",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "10px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: "800",
  },

  deleteButton: {
    width: "36px",
    height: "36px",
    border: "1px solid #fee2e2",
    background: "#fff7f7",
    color: "#dc2626",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
  },

  emptyState: {
    textAlign: "center",
    padding: "65px 25px",
  },

  emptyIcon: {
    width: "65px",
    height: "65px",
    margin: "0 auto 15px",
    borderRadius: "20px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },

  loadingCircle: {
    width: "48px",
    height: "48px",
    margin: "0 auto 15px",
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
  },

  emptyTitle: {
    margin: "0 0 7px",
    fontSize: "16px",
    color: "#334155",
  },

  emptyText: {
    margin: "0 auto",
    maxWidth: "430px",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  emptyButton: {
    marginTop: "20px",
    border: "none",
    borderRadius: "10px",
    padding: "11px 16px",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "12px",
  },

  bottomInfo: {
    marginTop: "20px",
    padding: "16px 19px",
    background: "#f8faff",
    border: "1px solid #e6eaff",
    borderRadius: "15px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },

  bottomIcon: {
    fontSize: "18px",
  },

  bottomInfoStrong: {
    fontSize: "12px",
  },

  // ==========================================
  // MODAL
  // ==========================================
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.48)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
    zIndex: 1000,
  },

  modalCard: {
    width: "100%",
    maxWidth: "900px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "24px",
    boxShadow:
      "0 30px 80px rgba(15,23,42,0.25)",
    border:
      "1px solid #e8eaf3",
  },

  modalHeader: {
    padding: "26px 28px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    borderBottom: "1px solid #eef2f7",
  },

  modalEyebrow: {
    fontSize: "10px",
    color: "#4f46e5",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "5px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "23px",
    fontWeight: "850",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#8793aa",
    fontSize: "12px",
  },

  modalCloseButton: {
    width: "38px",
    height: "38px",
    border: "none",
    background: "#f1f5f9",
    color: "#64748b",
    borderRadius: "11px",
    fontSize: "23px",
    cursor: "pointer",
    flexShrink: 0,
  },

  modalSuccess: {
    margin: "18px 28px 0",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    borderRadius: "11px",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "600",
  },

  modalError: {
    margin: "18px 28px 0",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    borderRadius: "11px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "600",
  },

  recipientFormCard: {
    margin: "20px 28px",
    padding: "20px",
    background: "#f8faff",
    borderRadius: "17px",
    border: "1px solid #e6eaff",
  },

  recipientFormHeader: {
    marginBottom: "16px",
  },

  recipientFormTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
    color: "#172033",
  },

  recipientFormSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#8793aa",
  },

  recipientFormGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 1fr",
    gap: "14px",
  },

  recipientFormActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "9px",
    marginTop: "17px",
  },

  saveRecipientButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    borderRadius: "10px",
    padding: "11px 18px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "800",
  },

  recipientListHeader: {
    padding: "7px 28px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  recipientListTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "800",
    color: "#111827",
  },

  recipientListSubtitle: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  addAnotherButton: {
    border: "none",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "10px",
    padding: "9px 13px",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },

  recipientList: {
    padding: "0 28px 10px",
  },

  recipientRow: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "14px 0",
    borderBottom:
      "1px solid #eef2f7",
  },

  recipientAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
    fontWeight: "800",
    flexShrink: 0,
  },

  recipientMain: {
    flex: 1,
    minWidth: 0,
  },

  recipientName: {
    fontSize: "13px",
    fontWeight: "800",
    color: "#172033",
    marginBottom: "5px",
  },

  recipientContacts: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    color: "#64748b",
    fontSize: "11px",
  },

  recipientActions: {
    display: "flex",
    gap: "7px",
    flexShrink: 0,
  },

  editRecipientButton: {
    width: "34px",
    height: "34px",
    border: "none",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: "9px",
    cursor: "pointer",
  },

  deleteRecipientButton: {
    width: "34px",
    height: "34px",
    border: "none",
    background: "#fff1f2",
    color: "#ef4444",
    borderRadius: "9px",
    cursor: "pointer",
  },

  recipientEmpty: {
    margin: "0 28px 20px",
    padding: "42px 20px",
    textAlign: "center",
    background: "#f8fafc",
    border:
      "1px dashed #dbe2ec",
    borderRadius: "15px",
  },

  recipientEmptyIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 12px",
    borderRadius: "15px",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
  },

  recipientEmptyTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#334155",
  },

  recipientEmptyText: {
    margin: "6px auto 0",
    maxWidth: "400px",
    fontSize: "11px",
    lineHeight: "1.6",
    color: "#94a3b8",
  },

  modalFooter: {
    marginTop: "10px",
    padding: "16px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderTop:
      "1px solid #eef2f7",
    color: "#94a3b8",
    fontSize: "10px",
  },

  modalDoneButton: {
    border: "none",
    background: "#111827",
    color: "#fff",
    borderRadius: "10px",
    padding: "9px 17px",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default Audiences;