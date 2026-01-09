import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const CheckInManager = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetchReservations();
    }
  }, [selectedHotelId, date]);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("/owner/hotels");
      setHotels(response.data);
      if (response.data.length > 0) {
        setSelectedHotelId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setMessage(t("failFetchHotels"));
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/reservations/manager", {
        params: {
          hotelId: selectedHotelId,
          date: date,
        },
      });
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setMessage(t("failFetchReservations"));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.put(`/reservations/${id}/check-in`);
      setMessage(t("checkInSuccess"));
      fetchReservations();
    } catch (error) {
      console.error("Check-in failed:", error);
      setMessage(t("checkInFail"));
    }
  };

  const handleCheckOut = async (reservation) => {
    if (
      window.confirm(
        `${reservation.totalPrice} ${reservation.currency} ${t("confirmSettlement")}`
      )
    ) {
      try {
        await axios.put(`/reservations/${reservation.id}/check-out`);
        alert(
          `${t("checkOutSuccess")} ${t("totalSettlement")}: ${reservation.totalPrice} ${reservation.currency}`
        );
        setMessage(t("checkOutSuccess"));
        fetchReservations();
      } catch (error) {
        console.error("Check-out failed:", error);
        setMessage(t("checkOutFail"));
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t("checkInManagement")}</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="row mb-4">
        <div className="col-md-6">
          <label>{t("selectHotel")}</label>
          <select
            className="form-control"
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>{t("selectDate")}</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div className="container" style={{ marginTop: "2rem" }}>
          <div className="card">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th style={{ padding: "0.5rem" }}>{t("id")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("room")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("checkInDate")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("checkOutDate")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("status")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("amount")}</th>
                  <th style={{ padding: "0.5rem" }}>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr
                    key={res.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.5rem" }}>{res.id}</td>
                    <td style={{ padding: "0.5rem" }}>
                      {res.rooms.map((r) => r.roomNumber).join(", ")}
                    </td>
                    <td style={{ padding: "0.5rem" }}>{res.checkInDate}</td>
                    <td style={{ padding: "0.5rem" }}>{res.checkOutDate}</td>
                    <td style={{ padding: "0.5rem" }}>{res.status}</td>
                    <td style={{ padding: "0.5rem" }}>
                      {res.totalPrice} {res.currency}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {(res.status === "PENDING" ||
                        res.status === "CONFIRMED") && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleCheckIn(res.id)}
                          >
                            {t("checkIn")}
                          </button>
                        )}
                      {res.status === "CHECKED_IN" && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleCheckOut(res)}
                        >
                          {t("checkOutSettlement")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {t("noReservations")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInManager;
