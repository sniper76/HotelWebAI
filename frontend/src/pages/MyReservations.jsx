import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useTranslation } from "react-i18next";

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await api.get("/reservations");
        setReservations(response.data);
      } catch (error) {
        console.error("Failed to fetch reservations", error);
      }
    };
    fetchReservations();
  }, []);

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>{t("myReservations")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {reservations.map((res) => (
          <div
            key={res.id}
            className="card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                {res.rooms.map((r) => r.hotel.name).join(", ")}
                {"  "}
                {res.rooms.map((r) => r.roomNumber).join(", ")}
              </div>
              <div style={{ color: "var(--text-muted)" }}>
                {res.checkInDate} - {res.checkOutDate}
                {res.isLateCheckout && (
                  <span
                    style={{ color: "var(--secondary)", marginLeft: "0.5rem" }}
                  >
                    ({t("lateCheckout")})
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "var(--primary)",
                }}
              >
                {res.currency === "KRW"
                  ? "₩"
                  : res.currency === "PHP"
                  ? "₱"
                  : "$"}
                {res.totalPrice}
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "1rem",
                  fontSize: "0.8rem",
                  backgroundColor:
                    res.status === "CONFIRMED"
                      ? "rgba(16, 185, 129, 0.2)"
                      : "rgba(234, 179, 8, 0.2)",
                  color: res.status === "CONFIRMED" ? "#10b981" : "#eab308",
                  marginTop: "0.5rem",
                }}
              >
                {t(res.status.toLowerCase()) || res.status}
              </div>
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "2rem",
            }}
          >
            {t("noReservations")}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
