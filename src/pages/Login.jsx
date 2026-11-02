import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Login.css";
import absaLogo from "../assets/absa-logo.png";

export default function Login() {
  const nav = useNavigate();
  const { updateProfile } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    updateProfile("email", email.trim());
    nav("/dashboard");
  };

  return (
    <div className="login-page">
      {/* Left panel - form */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-dot" />
          ABSA NextGen Wealth Studio
        </div>

        <div className="login-form-wrap">
          <h1 className="login-heading">Welcome back</h1>
          <p className="login-sub">
            Sign in to your account to continue your financial journey.
          </p>

          <div className="login-field">
            <label className="login-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="Enter your email (e.g. name@email.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {errors.email && <p className="login-error">{errors.email}</p>}
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {errors.password && (
              <p className="login-error">{errors.password}</p>
            )}
          </div>

          <div className="login-row">
            <button className="login-forgot" disabled>Forgot password?</button>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Sign in
          </button>

          <p className="login-signup-text">
            Don't have an account?{" "}
            <button className="login-signup-link" disabled>Register</button>
          </p>
        </div>

        <p className="login-footer">© ABSA NextGen Wealth Studio</p>
      </div>

      {/* Right panel - brand */}
      <div className="login-right">
        <p className="login-right-eyebrow">FIRST FIVE YEARS INITIATIVE</p>

        <div className="login-logo-wrap">
          <img src={absaLogo} alt="Absa logo" className="login-absa-logo" />
        </div>

        <p className="login-right-eyebrow">ABSA NEXTGEN WEALTH STUDIO</p>
        <h2 className="login-right-heading">
          Your first five years,
          <br />
          optimised.
        </h2>

        <p className="login-right-footer">© ABSA Group Limited</p>
      </div>
    </div>
  );
}
