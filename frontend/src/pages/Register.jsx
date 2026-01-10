import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "USER",
    language: i18n.language, // Initialize with current language
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setFormData({ ...formData, language: lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="container" style={{ marginTop: "4rem", maxWidth: "400px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          {t("register")}
        </h2>

        {/* <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <label style={{ marginRight: '10px' }}>{t('language')}:</label>
                    
                </div> */}

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
          <input
            type="text"
            placeholder={t("fullName")}
            className="input"
            value={formData.fullName}
            style={{ width: "92%" }}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
          <input
            type="email"
            placeholder={t("email")}
            className="input"
            value={formData.email}
            style={{ width: "92%" }}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <select
            className="input"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">{t("user")}</option>
            <option value="OWNER">{t("owner")}</option>
            {/* <option value="ADMIN">{t("admin")}</option> */}
          </select>
          <select
            className="input"
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
          >
            <option value="ko">{t("ko")}</option>
            <option value="en">{t("en")}</option>
            <option value="fil">{t("fil")}</option>
          </select>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            {t("register")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
