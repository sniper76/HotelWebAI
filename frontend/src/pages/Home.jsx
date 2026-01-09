import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
  const [searchParams, setSearchParams] = useState(() => {
    const today = new Date();
    today.setHours(13, 0, 0, 0); // 13:00 today

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0); // 11:00 tomorrow

    const toLocalISO = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    return {
      checkInTime: toLocalISO(today),
      checkOutTime: toLocalISO(tomorrow),
      guestCount: 1,
    };
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isLateCheckout, setIsLateCheckout] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Flight Search State
  const [airlines, setAirlines] = useState([]);
  const [flights, setFlights] = useState([]); // Flights for selected airline
  const [selectedAirlineId, setSelectedAirlineId] = useState("");
  const [selectedFlightId, setSelectedFlightId] = useState("");

  const toLocalISO = (d) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchAirlines();
  }, []);

  const fetchAirlines = async () => {
    try {
      const response = await api.get("/airlines");
      setAirlines(response.data);
    } catch (error) {
      console.error("Error fetching airlines", error);
    }
  };

  const handleAirlineChange = async (e) => {
    const airlineId = e.target.value;
    setSelectedAirlineId(airlineId);
    setSelectedFlightId("");
    setFlights([]);
    if (airlineId) {
      try {
        const response = await api.get(`/airlines/${airlineId}/flights`);
        setFlights(response.data);
      } catch (error) {
        console.error("Error fetching flights", error);
      }
    }
  };

  const handleFlightChange = (e) => {
    const flightId = e.target.value;
    setSelectedFlightId(flightId);

    if (flightId) {
      const flight = flights.find(f => f.id.toString() === flightId);
      if (flight) {
        // Set Check-in Date to Current Date (Today)
        const today = new Date();
        // Keep selected flight time? Or User Requirement says "Check-in at 1:00 PM"?
        // Actually, if flight arrival is X, maybe check-in should handle it?
        // But requested is "Standard criteria ... Checkin 13:00".
        // Flight selection logic "Auto-fills Dates".
        // Let's keep 13:00/11:00 default but on Flight Arrival Date?
        // Let's stick to Today/Tomorrow pattern for now, but respect 13:00/11:00.

        // console.log('flight', flight.departureTime);
        const arrivalTime = flight.arrivalTime.split(':');
        today.setHours(arrivalTime[0], arrivalTime[1], 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(tomorrow.getHours() - 1, arrivalTime[1], 0, 0);

        setSearchParams(prev => ({
          ...prev,
          checkInTime: toLocalISO(today),
          checkOutTime: toLocalISO(tomorrow)
        }));
      }
    }
  };

  const getPriceInfo = (room) => {
    if (i18n.language === "ko") {
      return { price: room.priceKrw, symbol: "₩", currency: "KRW" };
    } else if (i18n.language === "fil") {
      return { price: room.pricePhp, symbol: "₱", currency: "PHP" };
    } else {
      return { price: room.priceUsd, symbol: "$", currency: "USD" };
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      console.log('searchParams', searchParams);
      const response = await api.get("/reservations/search", {
        params: searchParams,
      });
      setAvailableRooms(response.data);
      setSelectedRooms([]);
    } catch (error) {
      console.error("Search failed", error);
      alert(t("searchFailed"));
    }
  };

  const toggleRoomSelection = (roomId, hotelId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleBook = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    let currency = "USD";
    if (i18n.language === "ko") currency = "KRW";
    if (i18n.language === "fil") currency = "PHP";

    try {
      await api.post("/reservations", {
        roomIds: selectedRooms,
        checkInTime: searchParams.checkInTime, // Updated param name
        checkOutTime: searchParams.checkOutTime, // Updated param name
        isLateCheckout,
        currency,
      });
      alert(t("bookingSuccessful"));
      navigate("/my-reservations");
    } catch (error) {
      console.error("Booking failed", error);
      alert(
        t("bookingFailed") +
        ": " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>{t("findPerfectStay")}</h2>
        <form
          onSubmit={handleSearch}
          className="form-grid" // Use the class we defined in index.css
        >
          {/* Flight Selection Section */}
          <div className="form-grid" style={{ gridColumn: "1 / -1" }}> {/* Nested grid */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                {t("selectAirlineOptional")}
              </label>
              <select
                className="input"
                value={selectedAirlineId}
                onChange={handleAirlineChange}
                style={{ width: "100%" }}
              >
                <option value="">{t("chooseAirline")}</option>
                {airlines.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
                {t("selectFlightAuto")}
              </label>
              <select
                className="input"
                value={selectedFlightId}
                onChange={handleFlightChange}
                style={{ width: "100%" }}
                disabled={!selectedAirlineId}
              >
                <option value="">{t("chooseFlight")}</option>
                {flights.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.departureAirport} ({f.departureTime})
                    → {f.arrivalAirport} ({f.arrivalTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ gridColumn: "1 / -1", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {/* Note: The inline style for 4 columns will be overridden by the !important in media query on mobile. 
             However, to be safe, we should rely on the media query or use flex-wrap. 
             Since index.css sets .form-grid to 1fr on mobile !important, this should work. */
            }
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-muted)",
                }}
              >
                {t("checkIn")} (YYYY-MM-DD HH:mm)
              </label>
              <input
                type="datetime-local"
                className="input"
                value={searchParams.checkInTime}
                style={{ width: "95%" }} // Adjusted width
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    checkInTime: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-muted)",
                }}
              >
                {t("checkOut")} (YYYY-MM-DD HH:mm)
              </label>
              <input
                type="datetime-local"
                className="input"
                value={searchParams.checkOutTime}
                style={{ width: "95%" }} // Adjusted width
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    checkOutTime: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "var(--text-muted)",
                }}
              >
                {t("guests")}
              </label>
              <input
                type="number"
                min="1"
                className="input"
                value={searchParams.guestCount}
                style={{ width: "92%" }}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    guestCount: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
            <div style={{ marginTop: "1.8rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                {t("searchAvailability")}
              </button>
            </div>
          </div>
        </form>
      </div>

      {availableRooms.length > 0 && (
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>{t("availableRooms")}</h3>
            {selectedRooms.length > 0 && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isLateCheckout}
                    onChange={(e) => setIsLateCheckout(e.target.checked)}
                  />
                  {t("lateCheckout")}
                </label>
                <button onClick={handleBook} className="btn btn-primary">
                  {t("bookSelected")} ({selectedRooms.length})
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {availableRooms.map((room) => {
              const { price, symbol } = getPriceInfo(room);
              return (
                <div
                  key={room.roomId}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    backgroundColor: selectedRooms.includes(room.roomId)
                      ? "rgba(99, 102, 241, 0.1)"
                      : "transparent",
                    borderColor: selectedRooms.includes(room.roomId)
                      ? "var(--primary)"
                      : "var(--border)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => toggleRoomSelection(room.roomId, room.hotelId)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {room.hotelName}
                    </span>
                    <span
                      style={{ color: "var(--primary)", fontWeight: "bold" }}
                    >
                      {symbol}
                      {price}
                    </span>
                  </div>
                  <div
                    style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
                  >
                    <div>
                      {t("room")}: {room.roomNumber}
                    </div>
                    <div>
                      {t("type")}: {room.roomType}
                    </div>
                    <div>
                      {t("capacity")}: {room.capacity} {t("person")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
