import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useTranslation } from "react-i18next";

const FlightManagement = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("airlines");
    const [airlines, setAirlines] = useState([]);
    const [flights, setFlights] = useState([]);
    const [showAddAirline, setShowAddAirline] = useState(false);
    const [selectedAirlineId, setSelectedAirlineId] = useState(null);

    const [editingAirlineId, setEditingAirlineId] = useState(null);
    const [editAirlineData, setEditAirlineData] = useState({});
    const [editingFlightId, setEditingFlightId] = useState(null);
    const [editFlightData, setEditFlightData] = useState({});

    const [newAirline, setNewAirline] = useState({
        name: "",
        code: "",
        useYn: "Y",
    });

    const [newFlight, setNewFlight] = useState({
        airlineId: "",
        departureAirport: "",
        departureTime: "",
        arrivalAirport: "",
        arrivalTime: "",
        useYn: "Y",
    });

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
    const handleCreateAirline = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/airlines", newAirline);
            setShowAddAirline(false);
            setNewAirline({ name: "", code: "", useYn: "Y" });
            fetchAirlines();
        } catch (error) {
            alert(t("errorSavingAirline"));
        }
    }

    const handleUpdateAirline = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/airlines/${editingAirlineId}`, editAirlineData);
            setEditingAirlineId(null);
            fetchAirlines();
        } catch (error) {
            alert(t("errorSavingAirline"));
        }
    };

    const startEditAirline = (airline) => {
        setEditingAirlineId(airline.id);
        setEditAirlineData({
            name: airline.name,
            code: airline.code,
            useYn: airline.useYn || "Y",
        });
    };

    const deleteAirline = async (id) => {
        if (!window.confirm(t("confirmDeleteAirline"))) return;
        try {
            await api.delete(`/admin/airlines/${id}`);
            fetchAirlines();
        } catch (error) {
            alert(t("errorDeletingAirline") + ": " + (error.response?.data?.message || "Unknown error"));
        }
    };

    const deleteFlight = async (id) => {
        if (!window.confirm(t("confirmDeleteFlight"))) return;
        try {
            await api.delete(`/admin/flights/${id}`);
            fetchFlights();
        } catch (error) {
            alert(t("errorDeletingFlight"));
        }
    };

    const startEditFlight = (rt) => {
        setEditingFlightId(rt.id);
        setEditFlightData({
            airlineId: rt.airlineId,
            departureAirport: rt.departureAirport,
            departureTime: rt.departureTime,
            arrivalAirport: rt.arrivalAirport,
            arrivalTime: rt.arrivalTime,
            useYn: rt.useYn || "Y",
        });
    };

    const handleAddFlight = async (e) => {
        e.preventDefault();
        try {
            // console.log('e', e);
            // Ensure time format HH:mm:ss
            const formattedForm = {
                ...newFlight,
                airlineId: e.target.airlineId.value,
                departureTime: newFlight.departureTime.length === 5 ? newFlight.departureTime + ":00" : newFlight.departureTime,
                arrivalTime: newFlight.arrivalTime.length === 5 ? newFlight.arrivalTime + ":00" : newFlight.arrivalTime,
            };
            // console.log('add formattedForm', formattedForm);
            await api.post(`/admin/flights`, formattedForm);
            setNewFlight({
                airlineId: "",
                departureAirport: "",
                departureTime: "",
                arrivalAirport: "",
                arrivalTime: "",
                useYn: "Y",
            });
            fetchFlights();
        } catch (error) {
            alert("Failed to add flight");
            console.log('error', error);
        }
    };

    const handleUpdateFlight = async (e) => {
        e.preventDefault();
        try {
            // console.log('update editFlightData', e, editingFlightId, editFlightData);
            await api.put(`/admin/flights/${editingFlightId}`, editFlightData);
            setEditingFlightId(null);
            fetchFlights();
        } catch (error) {
            alert("Failed to update flight");
            console.log('error', error);
        }
    };

    // --- Render ---
    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                }}
            >
                <h2>{t("flightManagement")}</h2>
                <button
                    onClick={() => setShowAddAirline(!showAddAirline)}
                    className="btn btn-primary"
                >
                    {showAddAirline ? t("cancel") : t("addAirline")}
                </button>
            </div>

            {showAddAirline && (
                <div className="card" style={{ marginBottom: "2rem" }}>
                    <h3>{t("airlines")}</h3>
                    <form
                        onSubmit={handleCreateAirline}
                        className="form-grid"
                        style={{ marginTop: "1rem" }}
                    >
                        <input
                            placeholder={t("airlineName")}
                            className="input"
                            style={{ width: "97%" }}
                            value={newAirline.name}
                            onChange={(e) => setNewAirline({ ...newAirline, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder={t("airlineCode")}
                            className="input"
                            style={{ width: "97%" }}
                            value={newAirline.code}
                            onChange={(e) => setNewAirline({ ...newAirline, code: e.target.value })}
                        />
                        <select
                            className="input"
                            style={{ width: "97%" }}
                            value={newAirline.useYn}
                            onChange={(e) => setNewAirline({ ...newAirline, useYn: e.target.value })}
                        >
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                        </select>
                        <button type="submit" className="btn btn-primary">
                            {t("create")}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: "grid", gap: "2rem" }}>
                {airlines.map((airline) => (
                    <div key={airline.id} className="card">
                        {editingAirlineId === airline.id ? (
                            <form
                                onSubmit={handleUpdateAirline}
                                className="form-grid"
                                style={{ marginBottom: "1rem" }}
                            >
                                <input
                                    placeholder={t("name")}
                                    className="input"
                                    style={{ width: "97%" }}
                                    value={editAirlineData.name}
                                    onChange={(e) =>
                                        setEditAirlineData({ ...editAirlineData, name: e.target.value })
                                    }
                                    required
                                />
                                <input
                                    placeholder={t("code")}
                                    className="input"
                                    style={{ width: "97%" }}
                                    value={editAirlineData.code}
                                    onChange={(e) =>
                                        setEditAirlineData({
                                            ...editAirlineData,
                                            code: e.target.value,
                                        })
                                    }
                                />
                                <select
                                    className="input"
                                    style={{ width: "97%" }}
                                    value={editAirlineData.useYn}
                                    onChange={(e) => setEditAirlineData({ ...editAirlineData, useYn: e.target.value })}
                                >
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </select>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="submit" className="btn btn-primary">
                                        {t("save")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingAirlineId(null)}
                                        className="btn"
                                        style={{ border: "1px solid var(--border)" }}
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "start",
                                }}
                            >
                                <div>
                                    <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                                        {airline.name}{" "}{airline.code}
                                        <span
                                            onClick={() => startEditAirline(airline)}
                                            style={{
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                                color: "var(--primary)",
                                                marginLeft: "0.5rem",
                                            }}
                                        >
                                            [{t("edit")}]
                                        </span>
                                    </h3>
                                </div>
                                <button
                                    onClick={() =>
                                        setSelectedAirlineId(
                                            selectedAirlineId === airline.id ? null : airline.id
                                        )
                                    }
                                    className="btn"
                                    style={{ border: "1px solid var(--border)" }}
                                >
                                    {selectedAirlineId === airline.id ? t("cancel") : t("addFlight")}
                                </button>
                            </div>
                        )}

                        {selectedAirlineId === airline.id && (
                            <div
                                style={{
                                    marginTop: "1rem",
                                    padding: "1rem",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: "0.5rem",
                                }}
                            >
                                <h4>{t("newFlight")}</h4>
                                <form
                                    onSubmit={handleAddFlight}
                                    className="form-grid"
                                >
                                    <input
                                        type="hidden"
                                        name="airlineId"
                                        value={airline.id}
                                    />
                                    <input
                                        className="input"
                                        placeholder={t("fromAirport")}
                                        value={newFlight.departureAirport}
                                        onChange={(e) => setNewFlight({ ...newFlight, departureAirport: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        type="time"
                                        placeholder={t("departureTime")}
                                        value={newFlight.departureTime}
                                        onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        placeholder={t("toAirport")}
                                        value={newFlight.arrivalAirport}
                                        onChange={(e) => setNewFlight({ ...newFlight, arrivalAirport: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input"
                                        type="time"
                                        placeholder={t("arrivalTime")}
                                        value={newFlight.arrivalTime}
                                        onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                                        required
                                    />
                                    <select
                                        className="input"
                                        style={{ width: "90%" }}
                                        value={newFlight.useYn}
                                        onChange={(e) => setNewFlight({ ...newFlight, useYn: e.target.value })}
                                    >
                                        <option value="Y">Y</option>
                                        <option value="N">N</option>
                                    </select>
                                    <button type="submit" className="btn btn-primary">
                                        {t("addFlight")}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div style={{ marginTop: "1.5rem" }}>
                            <h4 style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>
                                {t("flightTickets")}
                            </h4>
                            {flights &&
                                flights.filter((f) => f.airlineId === airline.id).map((rt) => (
                                    <div
                                        key={rt.id}
                                        style={{
                                            marginLeft: "1rem",
                                            marginBottom: "1rem",
                                            paddingLeft: "1rem",
                                            borderLeft: "2px solid var(--border)",
                                        }}
                                    >
                                        {editingFlightId === rt.id ? (
                                            <form
                                                onSubmit={handleUpdateFlight}
                                                className="form-grid"
                                                style={{
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="airlineId"
                                                    value={airline.id}
                                                />
                                                <input
                                                    className="input"
                                                    placeholder={t("fromAirport")}
                                                    value={editFlightData.departureAirport}
                                                    onChange={(e) => setEditFlightData({ ...editFlightData, departureAirport: e.target.value })}
                                                    required
                                                />
                                                <input
                                                    className="input"
                                                    type="time"
                                                    placeholder={t("departureTime")}
                                                    value={editFlightData.departureTime}
                                                    onChange={(e) => setEditFlightData({ ...editFlightData, departureTime: e.target.value })}
                                                    required
                                                />
                                                <input
                                                    className="input"
                                                    placeholder={t("toAirport")}
                                                    value={editFlightData.arrivalAirport}
                                                    onChange={(e) => setEditFlightData({ ...editFlightData, arrivalAirport: e.target.value })}
                                                    required
                                                />
                                                <input
                                                    className="input"
                                                    type="time"
                                                    placeholder={t("arrivalTime")}
                                                    value={editFlightData.arrivalTime}
                                                    onChange={(e) => setEditFlightData({ ...editFlightData, arrivalTime: e.target.value })}
                                                    required
                                                />
                                                <select
                                                    className="input"
                                                    value={editFlightData.useYn}
                                                    onChange={(e) => setEditFlightData({ ...editFlightData, useYn: e.target.value })}
                                                >
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                </select>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        {t("save")}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingFlightId(null)}
                                                        className="btn btn-sm"
                                                        style={{ border: "1px solid var(--border)" }}
                                                    >
                                                        {t("cancel")}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div>
                                                    <strong>{rt.departureAirport}{' '}{rt.departureTime}</strong><span style={{ color: "#999" }}>➝</span><strong>{rt.arrivalAirport}{' '}{rt.arrivalTime}</strong>
                                                    <span
                                                        onClick={() => startEditFlight(rt)}
                                                        style={{
                                                            fontSize: "0.8rem",
                                                            cursor: "pointer",
                                                            color: "var(--primary)",
                                                            marginLeft: "0.5rem",
                                                        }}
                                                    >
                                                        [{t("edit")}]
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FlightManagement;
