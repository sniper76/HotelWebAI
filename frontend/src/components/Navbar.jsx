import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

import PasswordChangeModal from "./PasswordChangeModal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar" style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 998,
          }}
        />
      )}

      <div className="container nav-content" style={{ position: "relative", zIndex: 999 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Link
            to="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "var(--primary)",
              textDecoration: "none",
            }}
            onClick={closeMenu}
          >
            HotelWeb
          </Link>

          {/* Hamburger Button */}
          <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            ☰
          </button>
        </div>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>

          {user ? (
            <>
              <Link to="/" onClick={closeMenu}>{t("search")}</Link>
              <Link to="/my-reservations" onClick={closeMenu}>{t("myReservations")}</Link>
              <Link to="/boards" onClick={closeMenu}>{t("freeBoard")}</Link>

              {(user.role === "OWNER" || user.role === "ADMIN") && (
                <>
                  <Link to="/manage-hotels" onClick={closeMenu}>{t("manageHotels")}</Link>
                  <Link to="/manage-discounts" onClick={closeMenu}>{t("discountManagement")}</Link>
                  <Link to="/check-in" onClick={closeMenu}>{t("checkInManagement")}</Link>
                  <Link to="/settlement" onClick={closeMenu}>{t("settlementReport")}</Link>
                </>
              )}
              {user.role === "ADMIN" && (
                <>
                  <Link to="/admin/users" onClick={closeMenu}>{t("userManagement")}</Link>
                  <Link to="/admin/flights" onClick={closeMenu}>{t("flightManagement")}</Link>
                  <Link to="/admin/logs" onClick={closeMenu}>{t("accessLogs")}</Link>
                </>
              )}

              <div className="nav-controls" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <select
                  onChange={changeLanguage}
                  value={i18n.language}
                  className="input"
                  style={{
                    padding: "0.4rem",
                    width: "auto",
                    margin: 0
                  }}
                >
                  <option value="ko">KR</option>
                  <option value="en">EN</option>
                  <option value="fil">FIL</option>
                </select>

                <button
                  onClick={toggleTheme}
                  className="btn-icon"
                  style={{ fontSize: "1.2rem", border: "1px solid var(--border)" }}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    {user.username}
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "var(--primary)" }}>
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn-icon"
                  title={t("changePassword")}
                  style={{ fontSize: "1.2rem", border: "1px solid var(--border)", padding: "0.4rem", cursor: "pointer" }}
                >
                  🔑
                </button>

                <button
                  onClick={handleLogout}
                  className="btn"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    width: "5.5rem",
                    padding: "0.4rem 0.8rem"
                  }}
                >
                  {t("logout")}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/boards" className="nav-link" onClick={closeMenu}>{t("freeBoard")}</Link>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                {t("login")}
              </Link>
              <Link to="/register" className="nav-link" onClick={closeMenu}>
                {t("register")}
              </Link>

              <div className="nav-controls" style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                <select
                  onChange={changeLanguage}
                  value={i18n.language}
                  className="input"
                  style={{
                    padding: "0.4rem",
                    width: "auto",
                    margin: 0
                  }}
                >
                  <option value="ko">KR</option>
                  <option value="en">EN</option>
                  <option value="fil">FIL</option>
                </select>
                <button
                  onClick={toggleTheme}
                  className="btn-icon"
                  title="Toggle Theme"
                  style={{ fontSize: "1.2rem" }}
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
