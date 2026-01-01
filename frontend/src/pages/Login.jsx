import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.username, formData.password);
    if (success) {
      navigate("/");
    } else {
      setError(t("invalidCredentials"));
    }
  };

  return (
    <div className="container" style={{ marginTop: "4rem", maxWidth: "400px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          {t("welcomeBack")}
        </h2>
        {error && (
          <div
            style={{
              color: "#ef4444",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("username")}
            className="input"
            value={formData.username}
            style={{ width: "92%" }}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder={t("password")}
            className="input"
            value={formData.password}
            style={{ width: "92%" }}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {t("login")}
          </button>
          <p style={{ marginTop: "1rem", textAlign: "center" }}>
            <a
              href="/register"
              style={{ color: "var(--primary)", textDecoration: "none" }}
            >
              {t("alreadyHaveAccount")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
