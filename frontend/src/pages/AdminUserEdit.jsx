import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useTranslation } from "react-i18next";

const AdminUserEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fullName: '',
        email: '',
        role: 'USER',
        useYn: 'Y'
    });
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/admin/users/${id}`);
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        };
        fetchUser();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${id}`, user);
            navigate('/admin/users');
        } catch (error) {
            alert('Failed to update user');
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem', maxWidth: '500px' }}>
            <h2>{t("editUser")}</h2>
            <div className="card">
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                        <label>{t("username")}</label>
                        <input
                            className="input"
                            value={user.username || ''}
                            disabled
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                        />
                    </div>
                    <div>
                        <label>{t("fullName")}</label>
                        <input
                            className="input"
                            value={user.fullName || ''}
                            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Email</label>
                        <input
                            className="input"
                            value={user.email || ''}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label>Role</label>
                        <select
                            className="input"
                            value={user.role}
                            onChange={(e) => setUser({ ...user, role: e.target.value })}
                        >
                            <option value="USER">USER</option>
                            <option value="OWNER">OWNER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    <div>
                        <label>Use Y/N</label>
                        <select
                            className="input"
                            value={user.useYn}
                            onChange={(e) => setUser({ ...user, useYn: e.target.value })}
                        >
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary">{t("save")}</button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => navigate('/admin/users')}
                            style={{ border: '1px solid var(--border)' }}
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminUserEdit;
