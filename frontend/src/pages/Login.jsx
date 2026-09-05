import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decorations */}
      <div style={styles.circleOne}></div>
      <div style={styles.circleTwo}></div>

      <div style={styles.container}>
        {/* LEFT SIDE */}
        <div style={styles.leftPanel}>
          <div style={styles.logoCircle}>🌐</div>

          <h1 style={styles.brandTitle}>
            AI <span>Multilingual</span>
          </h1>

          <h2 style={styles.brandSubTitle}>
            Communication Platform
          </h2>

          <p style={styles.description}>
            Break language barriers. Connect, communicate,
            and create impact globally.
          </p>

          <div style={styles.features}>
            <div style={styles.feature}>
              <div style={styles.featureIcon}>🌍</div>
              <div>
                <h3>Smart Translation</h3>
                <p>AI-powered multilingual communication</p>
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>💬</div>
              <div>
                <h3>Mass Communication</h3>
                <p>Reach your audience with ease</p>
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureIcon}>🔐</div>
              <div>
                <h3>Secure & Reliable</h3>
                <p>Protected with JWT authentication</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.rightPanel}>
          <div style={styles.welcomeIcon}>✨</div>

          <h1 style={styles.welcomeTitle}>
            Welcome Back!
          </h1>

          <p style={styles.welcomeText}>
            Sign in to continue your journey
          </p>

          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <label style={styles.label}>
              Email Address
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>✉️</span>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            {/* PASSWORD */}
            <label style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.eyeButton}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div style={styles.error}>
                ⚠️ {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login
                  <span style={styles.arrow}>→</span>
                </>
              )}
            </button>
          </form>

          <div style={styles.security}>
            <span>🛡️</span>
            Secure login powered by JWT authentication
          </div>

          <p style={styles.footer}>
            AI Multilingual Communication Platform
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 45%, #f5f3ff 100%)",
    fontFamily:
      "Inter, Segoe UI, Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "30px",
    boxSizing: "border-box",
  },

  circleOne: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #6366f1, #a855f7)",
    opacity: 0.15,
    top: "-120px",
    left: "-100px",
  },

  circleTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    opacity: 0.12,
    bottom: "-180px",
    right: "-120px",
  },

  container: {
    width: "100%",
    maxWidth: "1050px",
    minHeight: "620px",
    display: "grid",
    gridTemplateColumns: "45% 55%",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow:
      "0 25px 70px rgba(67, 56, 202, 0.18)",
    position: "relative",
    zIndex: 2,
  },

  leftPanel: {
    background:
      "linear-gradient(145deg, #111b55 0%, #312e81 55%, #4c1d95 100%)",
    color: "#ffffff",
    padding: "55px 45px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  logoCircle: {
    width: "82px",
    height: "82px",
    borderRadius: "24px",
    background:
      "linear-gradient(135deg, #60a5fa, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    marginBottom: "25px",
    boxShadow:
      "0 15px 35px rgba(0,0,0,0.25)",
  },

  brandTitle: {
    margin: "0",
    fontSize: "40px",
    fontWeight: "800",
    letterSpacing: "-1.5px",
  },

  brandSubTitle: {
    margin: "5px 0 22px",
    fontSize: "21px",
    fontWeight: "500",
    color: "#93c5fd",
  },

  description: {
    fontSize: "16px",
    lineHeight: "1.7",
    color: "#c7d2fe",
    maxWidth: "390px",
    marginBottom: "35px",
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  featureIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    border:
      "1px solid rgba(255,255,255,0.12)",
  },

  

  rightPanel: {
    padding: "55px 65px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  welcomeIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "15px",
  },

  welcomeTitle: {
    margin: "0",
    fontSize: "34px",
    fontWeight: "800",
    color: "#111827",
  },

  welcomeText: {
    margin: "8px 0 35px",
    color: "#6b7280",
    fontSize: "16px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "18px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },

  inputWrapper: {
    width: "100%",
    height: "52px",
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #dbe2f0",
    borderRadius: "12px",
    backgroundColor: "#fafbff",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },

  inputIcon: {
    marginLeft: "16px",
    fontSize: "18px",
  },

  input: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    padding: "0 14px",
    fontSize: "15px",
    color: "#111827",
  },

  eyeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "17px",
    marginRight: "12px",
  },

  error: {
    marginTop: "15px",
    padding: "10px 12px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: "13px",
  },

  loginButton: {
    width: "100%",
    height: "54px",
    marginTop: "28px",
    border: "none",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(79,70,229,0.25)",
  },

  arrow: {
    marginLeft: "10px",
    fontSize: "20px",
  },

  security: {
    textAlign: "center",
    marginTop: "25px",
    fontSize: "12px",
    color: "#9ca3af",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    fontSize: "12px",
    color: "#c4c8d0",
  },
};

export default Login;