import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const DiscountManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotelId, setSelectedHotelId] = useState("");
    const [policies, setPolicies] = useState([]);
    const { user } = useAuth();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [minDays, setMinDays] = useState(0);
    const [type, setType] = useState("PERCENTAGE"); // PERCENTAGE, FIXED_AMOUNT
    const [discountRate, setDiscountRate] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);

    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchHotels();
    }, []);

    useEffect(() => {
        if (selectedHotelId) {
            fetchPolicies();
        }
    }, [selectedHotelId]);

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

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/discounts", {
                params: { hotelId: selectedHotelId }
            });
            setPolicies(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!name || minDays < 0) {
            setFormError(t("invalidInput"));
            return;
        }

        const payload = {
            hotelId: selectedHotelId,
            name,
            minDays,
            type
        };

        if (type === "PERCENTAGE") {
            if (discountRate <= 0 || discountRate > 100) {
                setFormError(t("invalidRate"));
                return;
            }
            payload.discountRate = discountRate;
        } else {
            if (discountAmount <= 0) {
                setFormError(t("invalidAmount"));
                return;
            }
            payload.discountAmount = discountAmount;
        }

        try {
            await axios.post("/discounts", payload);
            fetchPolicies();
            // Reset form
            setName("");
            setMinDays(0);
            setDiscountRate(0);
            setDiscountAmount(0);
        } catch (error) {
            console.error(error);
            setFormError(t("createFail"));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t("confirmDelete"))) return;
        try {
            await axios.delete(`/discounts/${id}`);
            fetchPolicies();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mt-4">
            <h2>{t("discountManagement")}</h2>

            <div className="form-group mb-4">
                <label className="label">{t("selectHotel")}</label>
                <select
                    className="input"
                    value={selectedHotelId}
                    onChange={(e) => setSelectedHotelId(e.target.value)}
                >
                    {hotels.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            <div className="card mb-4" style={{ padding: "1.5rem" }}>
                <h4>{t("createNewPolicy")}</h4>
                {formError && <div className="alert alert-danger">{formError}</div>}
                <form onSubmit={handleCreate}>
                    <div className="form-grid">
                        <div>
                            <label className="label">{t("policyName")}</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Long Stay Discount"
                            />
                        </div>
                        <div>
                            <label className="label">{t("minDays")}</label>
                            <input
                                type="number"
                                className="input"
                                value={minDays}
                                onChange={(e) => setMinDays(parseInt(e.target.value))}
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="label">{t("discountType")}</label>
                            <select
                                className="input"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="PERCENTAGE">{t("percentage")}</option>
                                <option value="FIXED_AMOUNT">{t("fixedAmount")}</option>
                            </select>
                        </div>
                        {type === "PERCENTAGE" ? (
                            <div>
                                <label className="label">{t("discountRate")} (%)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={discountRate}
                                    onChange={(e) => setDiscountRate(e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="label">{t("discountAmount")} (Per Night)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(e.target.value)}
                                    min="0"
                                    step="100"
                                />
                            </div>
                        )}

                    </div>
                    <button type="submit" className="btn btn-primary mt-3">{t("create")}</button>
                </form>
            </div>

            <div className="card">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "0.5rem" }}>{t("name")}</th>
                            <th style={{ padding: "0.5rem" }}>{t("minDays")}</th>
                            <th style={{ padding: "0.5rem" }}>{t("discount")}</th>
                            <th style={{ padding: "0.5rem" }}>{t("actions")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map((p) => (
                            <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.5rem" }}>{p.name}</td>
                                <td style={{ padding: "0.5rem" }}>{p.minDays}</td>
                                <td style={{ padding: "0.5rem" }}>
                                    {p.type === "PERCENTAGE"
                                        ? `${p.discountRate}%`
                                        : `${p.discountAmount} (Per Night)`}
                                </td>
                                <td style={{ padding: "0.5rem" }}>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(p.id)}
                                    >
                                        {t("delete")}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {policies.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center" style={{ padding: "1rem" }}>{t("noPolicies")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiscountManagement;
