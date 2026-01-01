import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const SettlementReport = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [reservations, setReservations] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchHotels();
    setThisMonth();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("/owner/hotels");
      setHotels(response.data);
      if (response.data.length > 0) {
        setSelectedHotelId(response.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setThisWeek = () => {
    // 오늘 날짜를 "자정"으로 고정
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 시작일 계산
    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());

    // ❗ end는 start 기준으로 새로 생성
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  const setThisMonth = () => {
    const baseDate = new Date()
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth(); // 0-based

    const firstDay = new Date(year, month, 1);
    // 다음 달 0일 = 이번 달 마지막 날
    const lastDay = new Date(year, month + 1, 0);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  };

  const setBefore30Days = () => {
    const baseDate = new Date()
    const date = new Date();
    date.setDate(baseDate.getDate() - 30);

    setStartDate(formatDate(date));
    setEndDate(formatDate(baseDate));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  };

  const fetchSettlement = async () => {
    if (!selectedHotelId) return;
    try {
      const response = await axios.get("/reservations/settlement", {
        params: {
          hotelId: selectedHotelId,
          startDate: startDate,
          endDate: endDate,
        },
      });
      setReservations(response.data);
      setLoaded(true);
    } catch (error) {
      console.error("Fetch settlement failed", error);
    }
  };

  const calculateTotals = () => {
    const totals = {};
    reservations.forEach((r) => {
      const curr = r.currency || "USD";
      if (!totals[curr]) totals[curr] = 0;
      totals[curr] += r.totalPrice;
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="container mt-4">
      <h2>정산 내역 (Settlement Report)</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <label>호텔</label>
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
        <div className="col-md-3">
          <label>시작일</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label>종료일</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-2 align-self-end">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={setThisWeek}
          >
            이번 주
          </button>
          <button className="btn btn-outline-secondary" onClick={setThisMonth}>
            이번 달
          </button>
          <button className="btn btn-outline-secondary" onClick={setBefore30Days}>
            현재일 -30일
          </button>
          <button className="btn btn-primary w-100" onClick={fetchSettlement}>
            조회
          </button>
        </div>
      </div>

      {loaded && (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">기간 총 정산금액</h5>
              {Object.entries(totals).map(([curr, amt]) => (
                <p key={curr} className="card-text fw-bold">
                  {amt.toLocaleString()} {curr}
                </p>
              ))}
              {Object.keys(totals).length === 0 && <p>정산 내역이 없습니다.</p>}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <th style={{ padding: "0.5rem" }}>체크아웃 일시</th>
                <th style={{ padding: "0.5rem" }}>객실</th>
                <th style={{ padding: "0.5rem" }}>결제 금액</th>
                <th style={{ padding: "0.5rem" }}>통화</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>
                    {new Date(
                      r.actualCheckOutTime || r.checkOutDate
                    ).toLocaleString()}
                  </td>
                  <td>{r.rooms.map((rm) => rm.roomNumber).join(", ")}</td>
                  <td>{r.totalPrice}</td>
                  <td>{r.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default SettlementReport;
