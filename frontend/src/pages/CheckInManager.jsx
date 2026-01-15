import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";

const CheckInManager = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  // Voucher State
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedReservationForVoucher, setSelectedReservationForVoucher] = useState(null);

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

  const handleViewVoucher = (reservation) => {
    setSelectedReservationForVoucher(reservation);
    setVoucherModalOpen(true);
  };

  const handleDownloadVoucher = async () => {
    const element = document.getElementById("voucher-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      // Format: Voucher_GuestName_yyyyMMddHHmmss.jpg
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T.]/g, "").slice(0, 14); // yyyyMMddHHmmss
      const guestName = selectedReservationForVoucher.guestName || "Guest";
      link.download = `Voucher_${guestName}_${timestamp}.jpg`;
      link.click();
    } catch (error) {
      console.error("Failed to download voucher", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>{t("checkInManagement")}</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="form-grid">
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
            }}>{t("selectHotel")}</label>
          <select
            className="input"
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
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
            }}>{t("selectDate")}</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>{t("loading")}</p>
      ) : (
        <div className="container" style={{ marginTop: "0.5rem" }}>
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
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-sm"
                            style={{ backgroundColor: "#17a2b8", color: "white" }}
                            onClick={() => handleViewVoucher(res)}
                          >
                            {t("viewVoucher")}
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleCheckOut(res)}
                          >
                            {t("checkOutSettlement")}
                          </button>
                        </div>
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

      {/* Voucher Modal */}
      {voucherModalOpen && selectedReservationForVoucher && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", maxWidth: "800px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}>
            <div id="voucher-content" style={{ padding: "20px", background: "white", color: "black" }}>
              <h2 style={{ textAlign: "center", borderBottom: "2px solid black", paddingBottom: "10px", marginBottom: "20px", color: "black" }}>
                {t("voucherTitle")}
              </h2>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", color: "black" }}>
                <tbody>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", width: "30%", backgroundColor: "#f9f9f9", color: "black" }}>{t("bookingReference")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>{selectedReservationForVoucher.id}</td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("hotelDetails")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      <strong>{hotels.find(h => h.id == selectedHotelId)?.name || selectedReservationForVoucher.rooms[0]?.hotel?.name}</strong><br />
                      {hotels.find(h => h.id == selectedHotelId)?.address || selectedReservationForVoucher.rooms[0]?.hotel?.address}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("guestDetails")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      {selectedReservationForVoucher.guestName}<br />
                      {selectedReservationForVoucher.guestEmail}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("bankName")} / {t("accountHolder")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      {selectedReservationForVoucher.rooms[0]?.hotel?.bankName} / {selectedReservationForVoucher.rooms[0]?.hotel?.accountHolder}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("accountNumber")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      {selectedReservationForVoucher.rooms[0]?.hotel?.accountNumber}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("room")}/{t("type")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      {selectedReservationForVoucher.rooms.map(r => `Room ${r.roomNumber}`).join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("period")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      {new Date(selectedReservationForVoucher.checkInTime).toLocaleDateString()} ~ {new Date(selectedReservationForVoucher.checkOutTime).toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ border: "1px solid black", padding: "10px", textAlign: "left", backgroundColor: "#f9f9f9", color: "black" }}>{t("paymentDetails")}</th>
                    <td style={{ border: "1px solid black", padding: "10px", color: "black" }}>
                      <span style={{ color: "#E91E63", fontWeight: "bold" }}>
                        {t("amount")}: {selectedReservationForVoucher.totalPrice} {selectedReservationForVoucher.currency}
                      </span><br />
                      {t("status")}: {selectedReservationForVoucher.status}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ textAlign: "center", fontSize: "0.8rem", color: "black", marginTop: "20px" }}>
                <p>This voucher is computer generated.</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <button className="btn" style={{ border: "1px solid black", color: "black" }} onClick={() => setVoucherModalOpen(false)}>{t("close")}</button>
              <button className="btn btn-primary" onClick={handleDownloadVoucher}>{t("download")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInManager;
