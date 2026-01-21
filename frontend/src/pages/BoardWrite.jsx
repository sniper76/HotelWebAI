import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

const BoardWrite = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams(); // If present, edit mode
    const isEdit = !!id;
    const { user } = useAuth(); // Get user for admin check
    console.log('user', user);

    const [formData, setFormData] = useState({
        category: "HOTEL_STORY",
        title: "",
        content: "",
        isNotice: false,
    });

    const categories = [
        { value: "HOTEL_STORY", label: t("hotelStory") },
        { value: "RESTAURANT_STORY", label: t("restaurantStory") },
        { value: "BAR_STORY", label: t("barStory") },
        { value: "QNA", label: 'QnA' },
    ];

    useEffect(() => {
        if (isEdit) {
            fetchBoard();
        }
    }, [id]);

    const fetchBoard = async () => {
        try {
            const response = await api.get(`/boards/${id}`);
            setFormData({
                category: response.data.category,
                title: response.data.title,
                content: response.data.content,
                isNotice: response.data.isNotice || false,
            });
        } catch (error) {
            console.error("Failed to fetch board", error);
            alert(t("searchFailed")); // Using generic fail msg
            navigate("/boards");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/boards/${id}`, formData);
                navigate(`/boards/${id}`);
            } else {
                const response = await api.post("/boards", formData);
                navigate(`/boards/${response.data}`);
            }
        } catch (error) {
            console.error("Failed to save post", error);
            alert(t("bookingFailed")); // Reusing generic fail msg or add better one
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="container" style={{ marginTop: "2rem", maxWidth: "800px" }}>
            <div className="card">
                <h2>{isEdit ? t("editPost") : t("writePost")}</h2>

                <form onSubmit={handleSubmit} className="md-form">
                    <div className="input-group">
                        <label className="md-label always-float">{t("category")}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <select
                                name="category"
                                className="md-input"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ flex: 1 }}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            {/* Admin only Notice Checkbox */}
                            {user && user.role === "ADMIN" && (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="checkbox"
                                        id="isNotice"
                                        name="isNotice"
                                        checked={formData.isNotice}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                    />
                                    <label htmlFor="isNotice" style={{ cursor: 'pointer', fontWeight: 'bold' }}>{t("notice")}</label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            name="title"
                            className="md-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder=" "
                            required
                        />
                        <label className="md-label">{t("title")}</label>
                    </div>

                    <div className="input-group">
                        <textarea
                            name="content"
                            className="md-input"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder=" "
                            rows="15"
                            style={{ resize: "vertical", minHeight: "300px" }}
                            required
                        />
                        <label className="md-label">{t("content")}</label>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => navigate(-1)}
                        >
                            {t("cancel")}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {isEdit ? t("update") : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardWrite;
