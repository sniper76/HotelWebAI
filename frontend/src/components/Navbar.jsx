import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link
          to="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "var(--primary)",
          }}
        >
          HotelWeb
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <div className="nav-links" style={{ marginTop: "0.6rem" }}>
                <Link to="/">{t("search")}</Link>
                <Link to="/my-reservations">{t("myReservations")}</Link>

                {(user.role === "OWNER" || user.role === "ADMIN") && (
                  <>
                    <Link to="/manage-hotels">{t("manageHotels")}</Link>
                    <Link to="/check-in">입실 관리</Link>
                    <Link to="/settlement">정산 내역</Link>
                  </>
                )}
                {user.role === "ADMIN" && (
                  <>
                    <Link to="/admin/users">{t("userManagement")}</Link>
                    <Link to="/admin/flights">항공권 관리</Link>
                  </>
                )}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="btn-icon"
                  title="Toggle Theme"
                  style={{ fontSize: "1.2rem", border: "1px solid var(--border)" }}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <span style={{ color: "var(--text-muted)" }}>
                  {user.username} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="btn"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                >
                  {t("logout")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

                <Link to="/login" className="nav-link">
                  {t("login")}
                </Link>
                <Link to="/register" className="nav-link">
                  {t("register")}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="btn-icon"
                  title="Toggle Theme"
                  style={{ fontSize: "1.2rem", marginRight: "1rem" }}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
