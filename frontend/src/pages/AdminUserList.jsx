import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleEdit = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2>{t("userManagement")}</h2>
            <div className="card">
                <div className="table-container">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }} className="desktop-only">{t("id")}</th>
                                <th style={{ padding: '0.5rem' }}>{t("username")}</th>
                                <th style={{ padding: '0.5rem' }} className="desktop-only">{t("fullName")}</th>
                                <th style={{ padding: '0.5rem' }} className="desktop-only">{t("email")}</th>
                                <th style={{ padding: '0.5rem' }}>{t("role")}</th>
                                <th style={{ padding: '0.5rem' }}>{t("useYn")}</th>
                                <th style={{ padding: '0.5rem' }}>{t("actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                                        {t("noUsers")}
                                    </td>
                                </tr>
                            ) : (users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }} className="desktop-only">{user.id}</td>
                                    <td style={{ padding: '0.5rem' }}>{user.username}</td>
                                    <td style={{ padding: '0.5rem' }} className="desktop-only">{user.fullName}</td>
                                    <td style={{ padding: '0.5rem' }} className="desktop-only">{user.email}</td>
                                    <td style={{ padding: '0.5rem' }}>{user.role}</td>
                                    <td style={{ padding: '0.5rem' }}>{user.useYn}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleEdit(user.id)}
                                        >
                                            {t("edit")}
                                        </button>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUserList;
