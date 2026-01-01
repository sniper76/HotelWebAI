import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useTranslation } from "react-i18next";

const FlightManagement = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("airlines");
    const [airlines, setAirlines] = useState([]);
    const [flights, setFlights] = useState([]);

    // Form States
    const [airlineForm, setAirlineForm] = useState({ id: null, name: "", code: "" });
    const [flightForm, setFlightForm] = useState({
        id: null,
        airlineId: "",
        departureAirport: "",
        departureTime: "", // LocalTime HH:mm:ss
        arrivalAirport: "",
        arrivalTime: "",   // LocalTime HH:mm:ss
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchAirlines();
        fetchFlights();
    }, []);

    const fetchAirlines = async () => {
        try {
            const response = await api.get("/airlines");
            setAirlines(response.data);
        } catch (error) {
            console.error("Error fetching airlines", error);
        }
    };

    const fetchFlights = async () => {
        try {
            const response = await api.get("/flights");
            setFlights(response.data);
        } catch (error) {
            console.error("Error fetching flights", error);
        }
    };

    // --- Airline Handlers ---
    const handleAirlineSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/admin/airlines/${airlineForm.id}`, airlineForm);
            } else {
                await api.post("/admin/airlines", airlineForm);
            }
            fetchAirlines();
            resetAirlineForm();
        } catch (error) {
            alert("Error saving airline");
        }
    };

    const deleteAirline = async (id) => {
        if (!window.confirm("Delete this airline?")) return;
        try {
            await api.delete(`/admin/airlines/${id}`);
            fetchAirlines();
        } catch (error) {
            alert("Error deleting airline: " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const editAirline = (airline) => {
        setAirlineForm(airline);
        setIsEditing(true);
        setActiveTab("airlines");
    };

    const resetAirlineForm = () => {
        setAirlineForm({ id: null, name: "", code: "" });
        setIsEditing(false);
    };

    // --- Flight Handlers ---
    const handleFlightSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure time format HH:mm:ss
            const formattedForm = {
                ...flightForm,
                departureTime: flightForm.departureTime.length === 5 ? flightForm.departureTime + ":00" : flightForm.departureTime,
                arrivalTime: flightForm.arrivalTime.length === 5 ? flightForm.arrivalTime + ":00" : flightForm.arrivalTime,
            };

            if (isEditing) {
                await api.put(`/admin/flights/${flightForm.id}`, formattedForm);
            } else {
                await api.post("/admin/flights", formattedForm);
            }
            fetchFlights();
            resetFlightForm();
        } catch (error) {
            alert("Error saving flight ticket");
        }
    };

    const deleteFlight = async (id) => {
        if (!window.confirm("Delete this flight?")) return;
        try {
            await api.delete(`/admin/flights/${id}`);
            fetchFlights();
        } catch (error) {
            alert("Error deleting flight");
        }
    };

    const editFlight = (flight) => {
        setFlightForm({
            ...flight,
            airlineId: flight.airlineId,
        });
        setIsEditing(true);
        setActiveTab("flights");
    };

    const resetFlightForm = () => {
        setFlightForm({
            id: null,
            airlineId: "",
            departureAirport: "",
            departureTime: "",
            arrivalAirport: "",
            arrivalTime: "",
        });
        setIsEditing(false);
    };

    // --- Render ---
    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "300", color: "var(--primary-dark)", marginBottom: "1.5rem" }}>
                Flight Management
            </h2>

            <div className="tabs" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1px" }}>
                <button
                    className={`tab-btn ${activeTab === "airlines" ? "active" : ""}`}
                    onClick={() => setActiveTab("airlines")}
                    style={{
                        padding: "0.8rem 1.5rem",
                        border: "none",
                        background: "none",
                        fontSize: "1rem",
                        color: activeTab === "airlines" ? "var(--primary)" : "#666",
                        borderBottom: activeTab === "airlines" ? "2px solid var(--primary)" : "2px solid transparent",
                        cursor: "pointer",
                        fontWeight: activeTab === "airlines" ? "600" : "400",
                        transition: "all 0.2s"
                    }}
                >
                    Airlines
                </button>
                <button
                    className={`tab-btn ${activeTab === "flights" ? "active" : ""}`}
                    onClick={() => setActiveTab("flights")}
                    style={{
                        padding: "0.8rem 1.5rem",
                        border: "none",
                        background: "none",
                        fontSize: "1rem",
                        color: activeTab === "flights" ? "var(--primary)" : "#666",
                        borderBottom: activeTab === "flights" ? "2px solid var(--primary)" : "2px solid transparent",
                        cursor: "pointer",
                        fontWeight: activeTab === "flights" ? "600" : "400",
                        transition: "all 0.2s"
                    }}
                >
                    Flight Tickets
                </button>
            </div>

            {activeTab === "airlines" && (
                <div className="card fade-in">
                    <h3 className="section-title">{isEditing ? "Edit Airline" : "Add New Airline"}</h3>
                    <form onSubmit={handleAirlineSubmit} className="md-form">
                        <div className="form-row">
                            <div className="input-group">
                                <input
                                    className="md-input"
                                    placeholder=" "
                                    value={airlineForm.name}
                                    onChange={(e) => setAirlineForm({ ...airlineForm, name: e.target.value })}
                                    required
                                />
                                <label className="md-label">Airline Name</label>
                            </div>
                            <div className="input-group">
                                <input
                                    className="md-input"
                                    placeholder=" "
                                    value={airlineForm.code}
                                    onChange={(e) => setAirlineForm({ ...airlineForm, code: e.target.value })}
                                />
                                <label className="md-label">Code (e.g. KE)</label>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-primary ripple" type="submit">
                                {isEditing ? "Update Airline" : "Add Airline"}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn btn-text ripple" onClick={resetAirlineForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="table-container">
                        <table className="md-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {airlines.map((a) => (
                                    <tr key={a.id}>
                                        <td>{a.id}</td>
                                        <td>{a.name}</td>
                                        <td><span className="badge">{a.code}</span></td>
                                        <td style={{ textAlign: "right" }}>
                                            <button className="btn-icon" onClick={() => editAirline(a)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => deleteAirline(a.id)} title="Delete">
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "flights" && (
                <div className="card fade-in">
                    <h3 className="section-title">{isEditing ? "Edit Flight Ticket" : "Add New Flight Ticket"}</h3>
                    <form onSubmit={handleFlightSubmit} className="md-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <select
                                    className="md-input"
                                    value={flightForm.airlineId}
                                    onChange={(e) => setFlightForm({ ...flightForm, airlineId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled hidden></option>
                                    {airlines.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.name}
                                        </option>
                                    ))}
                                </select>
                                <label className="md-label" style={{ top: flightForm.airlineId ? "-10px" : "12px", fontSize: flightForm.airlineId ? "0.8rem" : "1rem" }}>Airline</label>
                            </div>

                            <div className="input-group">
                                <input
                                    className="md-input"
                                    placeholder=" "
                                    value={flightForm.departureAirport}
                                    onChange={(e) => setFlightForm({ ...flightForm, departureAirport: e.target.value })}
                                    required
                                />
                                <label className="md-label">From (Airport Code)</label>
                            </div>

                            <div className="input-group">
                                <input
                                    className="md-input"
                                    type="time"
                                    placeholder=" "
                                    value={flightForm.departureTime}
                                    onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                                    required
                                />
                                <label className="md-label always-float">Departure Time</label>
                            </div>

                            <div className="input-group">
                                <input
                                    className="md-input"
                                    placeholder=" "
                                    value={flightForm.arrivalAirport}
                                    onChange={(e) => setFlightForm({ ...flightForm, arrivalAirport: e.target.value })}
                                    required
                                />
                                <label className="md-label">To (Airport Code)</label>
                            </div>

                            <div className="input-group">
                                <input
                                    className="md-input"
                                    type="time"
                                    placeholder=" "
                                    value={flightForm.arrivalTime}
                                    onChange={(e) => setFlightForm({ ...flightForm, arrivalTime: e.target.value })}
                                    required
                                />
                                <label className="md-label always-float">Arrival Time</label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-primary ripple" type="submit">
                                {isEditing ? "Update Ticket" : "Add Ticket"}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn btn-text ripple" onClick={resetFlightForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="table-container">
                        <table className="md-table">
                            <thead>
                                <tr>
                                    <th>Airline</th>
                                    <th>Route</th>
                                    <th>Times</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flights.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.airlineName}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span style={{ fontWeight: "500" }}>{f.departureAirport}</span>
                                                <span style={{ color: "#999" }}>➝</span>
                                                <span style={{ fontWeight: "500" }}>{f.arrivalAirport}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "0.9rem", color: "#666" }}>
                                                {f.departureTime} - {f.arrivalTime}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <button className="btn-icon" onClick={() => editFlight(f)} title="Edit">
                                                ✎
                                            </button>
                                            <button className="btn-icon delete" onClick={() => deleteFlight(f.id)} title="Delete">
                                                🗑
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightManagement;
