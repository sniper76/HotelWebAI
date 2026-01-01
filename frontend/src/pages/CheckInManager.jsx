import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext"; // Assuming context exists

const CheckInManager = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [reservations, setReservations] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { user } = useAuth(); // Assuming this gives user info
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
      const response = await axios.get("/owner/hotels"); // This returns My Hotels (or all if admin per my service change)
      setHotels(response.data);
      if (response.data.length > 0) {
        setSelectedHotelId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setMessage("호텔 목록을 불러오는데 실패했습니다.");
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
      setMessage("예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.put(`/reservations/${id}/check-in`);
      setMessage("체크인 처리되었습니다.");
      fetchReservations();
    } catch (error) {
      console.error("Check-in failed:", error);
      setMessage("체크인 처리에 실패했습니다.");
    }
  };

  const handleCheckOut = async (reservation) => {
    if (
      window.confirm(
        `${reservation.totalPrice} ${reservation.currency} 정산하시겠습니까?`
      )
    ) {
      try {
        await axios.put(`/reservations/${reservation.id}/check-out`);
        alert(
          `체크아웃 완료. 정산 금액: ${reservation.totalPrice} ${reservation.currency}`
        );
        setMessage("체크아웃 처리되었습니다.");
        fetchReservations();
      } catch (error) {
        console.error("Check-out failed:", error);
        setMessage("체크아웃 처리에 실패했습니다.");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>입실 관리</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <div className="row mb-4">
        <div className="col-md-6">
          <label>호텔 선택</label>
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
          <label>날짜 선택</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
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
                  <th style={{ padding: "0.5rem" }}>ID</th>
                  <th style={{ padding: "0.5rem" }}>객실</th>
                  <th style={{ padding: "0.5rem" }}>체크인 날짜</th>
                  <th style={{ padding: "0.5rem" }}>체크아웃 날짜</th>
                  <th style={{ padding: "0.5rem" }}>상태</th>
                  <th style={{ padding: "0.5rem" }}>금액</th>
                  <th style={{ padding: "0.5rem" }}>액션</th>
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
                          체크인
                        </button>
                      )}
                      {res.status === "CHECKED_IN" && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleCheckOut(res)}
                        >
                          체크아웃/정산
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center">
                      예약 내역이 없습니다.
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
