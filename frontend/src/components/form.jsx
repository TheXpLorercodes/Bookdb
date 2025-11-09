// src/components/Form.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../style/Form.css";
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiPhone } from "react-icons/fi";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState(""); // optional display name
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("password"); // "password" | "otp"
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const nameLabel = method === "login" ? "Login" : "Register";
  const subtext = method === "login" ? "Access your dashboard" : "Create a new account";

  // helper to save tokens
  const saveTokens = (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_TOKEN, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN, refresh);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (method === "login") {
        if (loginMode === "password") {
          // ---- password login ----
          const res = await api.post("users/login/", { username, password });
          saveTokens(res.data.access, res.data.refresh);
          navigate("/Dashboard");
        } else {
          // ---- otp login ----
          const res = await api.post("users/verify-otp/", { phone, otp });
          saveTokens(res.data.access, res.data.refresh);
          navigate("/Dashboard");
        }
      } else {
        // ---- register ----
        // ensure backend receives a username (fallback to phone if user left it empty)
        const payload = {
          username: username || phone,
          email,
          phone,
          password,
          password2,
        };

        // include optional fields safely
        if (name) payload.name = name;
        // also send duplicate key if backend might expect user_name
        payload.user_name = payload.username;

        const res = await api.post("users/register/", payload);
        // Some backends auto-login after register; if tokens provided, save them
        if (res.data?.access) saveTokens(res.data.access, res.data?.refresh);
        // Navigate to login page (or Dashboard if auto-logged)
        if (res.data?.access) navigate("/Dashboard");
        else navigate("/login");
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.response) {
        console.error("response data:", error.response.data);
        const data = error.response.data;
        if (typeof data === "object") {
          const messages = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n");
          alert(messages);
        } else {
          alert(data);
        }
      } else {
        alert("Network or CORS error");
      }
    } finally {
      setLoading(false);
    }
  };

  // send OTP
  const handleSendOtp = async () => {
    if (!phone) {
      alert("Enter phone number first");
      return;
    }
    try {
      setLoading(true);
      await api.post("users/send-otp/", { phone });
      setOtpSent(true);
      alert("OTP sent to your phone");
    } catch (err) {
      console.error("Send OTP error:", err);
      alert(err.response?.data?.error || JSON.stringify(err.response?.data) || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // auto-fill username with phone while registering if username empty (optional UX)
  const handlePhoneChange = (value) => {
    setPhone(value);
    if (method === "register" && !username) setUsername(value);
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="form-container" noValidate>
        <header>
          <h2>{nameLabel}</h2>
          <p>{subtext}</p>
        </header>

        {/* LOGIN MODE TOGGLE */}
        {method === "login" && (
          <div className="login-toggle">
            <button
              type="button"
              className={loginMode === "password" ? "active" : ""}
              onClick={() => {
                setLoginMode("password");
                setOtpSent(false);
              }}
            >
              Password Login
            </button>
            <button
              type="button"
              className={loginMode === "otp" ? "active" : ""}
              onClick={() => setLoginMode("otp")}
            >
              OTP Login
            </button>
          </div>
        )}

        {/* username - only for password login */}
        {method === "login" && loginMode === "password" && (
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
        )}

        {/* username - for register (optional, but helpful) */}
        {method === "register" && (
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username (optional — phone will be used if left blank)"
            />
          </div>
        )}

        {/* display name - optional for register */}
        {method === "register" && (
          <div className="input-wrapper">
            <FiUser className="input-icon" />
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name (optional)"
            />
          </div>
        )}

        {/* phone - for register and otp login */}
        {(method === "register" || loginMode === "otp") && (
          <div className="input-wrapper">
            <FiPhone className="input-icon" />
            <input
              className="form-input"
              type="text"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Phone"
              required
            />
          </div>
        )}

        {/* email - only for register */}
        {method === "register" && (
          <div className="input-wrapper">
            <FiMail className="input-icon" />
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
        )}

        {/* password - only if not otp login */}
        {(method === "register" || (method === "login" && loginMode === "password")) && (
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              className="form-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <div
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              aria-label="Toggle password visibility"
              tabIndex={0}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </div>
        )}

        {/* confirm password - only for register */}
        {method === "register" && (
          <div className="input-wrapper">
            <FiLock className="input-icon" />
            <input
              className="form-input"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          </div>
        )}

        {/* otp field - only if login by otp */}
        {method === "login" && loginMode === "otp" && (
          <div className="otp-section">
            {otpSent && (
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                />
              </div>
            )}
            {!otpSent && (
              <button
                type="button"
                className="form-button secondary"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "..." : "Send OTP"}
              </button>
            )}
          </div>
        )}

        {/* submit button */}
        <button className="form-button" type="submit" disabled={loading}>
          {loading ? "..." : nameLabel}
        </button>

        {/* toggle login/register link */}
        <p className="toggle-link">
          {method === "login" ? (
            <>
              Don’t have an account? <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Login</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}

export default Form;
