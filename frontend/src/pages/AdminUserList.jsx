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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '0.5rem' }}>ID</th>
                            <th style={{ padding: '0.5rem' }}>{t("username")}</th>
                            <th style={{ padding: '0.5rem' }}>{t("fullName")}</th>
                            <th style={{ padding: '0.5rem' }}>Email</th>
                            <th style={{ padding: '0.5rem' }}>Role</th>
                            <th style={{ padding: '0.5rem' }}>Use Y/N</th>
                            <th style={{ padding: '0.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.5rem' }}>{user.id}</td>
                                <td style={{ padding: '0.5rem' }}>{user.username}</td>
                                <td style={{ padding: '0.5rem' }}>{user.fullName}</td>
                                <td style={{ padding: '0.5rem' }}>{user.email}</td>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUserList;
