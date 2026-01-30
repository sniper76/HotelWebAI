import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../api/axiosConfig";
import moment from "moment";

const BlockedIpList = () => {
    const { t } = useTranslation();
    const [blockedIps, setBlockedIps] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ ipAddress: "", reason: "" });

    useEffect(() => {
        fetchBlockedIps(0);
    }, []);

    const fetchBlockedIps = async (pageNumber) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/blocked-ips?page=${pageNumber}&size=10&sort=createdAt,desc`);
            setBlockedIps(response.data.content);
            setTotalPages(response.data.totalPages);
            setPage(response.data.number);
        } catch (error) {
            console.error("Failed to fetch blocked IPs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/blocked-ips", formData);
            setFormData({ ipAddress: "", reason: "" });
            fetchBlockedIps(0);
            alert(t("saveSuccess"));
        } catch (error) {
            console.error("Failed to block IP", error);
            alert(error.response?.data?.message || t("saveFail"));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t("confirmDelete"))) return;
        try {
            await api.delete(`/admin/blocked-ips/${id}`);
            fetchBlockedIps(page);
        } catch (error) {
            console.error("Failed to delete IP", error);
        }
    };

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <div className="card">
                <h2>{t("blockedIpManagement")}</h2>

                {/* Add Form */}
                <form onSubmit={handleSubmit} className="md-form" style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                        <div className="input-group" style={{ flex: 1, minWidth: "200px" }}>
                            <input
                                type="text"
                                name="ipAddress"
                                className="md-input"
                                value={formData.ipAddress}
                                onChange={handleInputChange}
                                placeholder=" "
                                required
                            />
                            <label className="md-label">IP Address</label>
                        </div>
                        <div className="input-group" style={{ flex: 2, minWidth: "300px" }}>
                            <input
                                type="text"
                                name="reason"
                                className="md-input"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder=" "
                            />
                            <label className="md-label">{t("reason")}</label>
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <button type="submit" className="btn btn-primary">
                                {t("add")}
                            </button>
                        </div>
                    </div>
                </form>

                {/* List Table */}
                <div className="table-container">
                    <table className="md-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>IP Address</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blockedIps.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                                        {t("noData")}
                                    </td>
                                </tr>
                            ) : (
                                blockedIps.map(ip => (
                                    <tr key={ip.id}>
                                        <td>{ip.id}</td>
                                        <td style={{ fontWeight: "bold", color: "var(--error)" }}>{ip.ipAddress}</td>
                                        <td>{ip.reason}</td>
                                        <td>{moment(ip.createdAt).format("YYYY-MM-DD HH:mm")}</td>
                                        <td>
                                            <button className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", backgroundColor: "var(--error)", color: "white" }} onClick={() => handleDelete(ip.id)}>
                                                {t("delete")}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '1rem' }}>
                    <button
                        onClick={() => fetchBlockedIps(page - 1)}
                        disabled={page === 0}
                        className="btn"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {t('prev')}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => fetchBlockedIps(page + 1)}
                        disabled={page === totalPages - 1}
                        className="btn"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {t('next')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlockedIpList;
