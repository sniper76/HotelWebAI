import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosConfig';

const PasswordChangeModal = ({ onClose }) => {
    const { t } = useTranslation();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError(t('passwordMismatch'));
            return;
        }

        try {
            // const token = localStorage.getItem('token');
            await api.post('/auth/change-password', {
                oldPassword,
                newPassword
                // }, {
                //     headers: { Authorization: `Bearer ${token}` }
            });

            alert(t('passwordChanged'));
            // Logout
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            window.location.href = '/login';
        } catch (err) {
            console.error(err);
            setError(t('passwordChangeFailed'));
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ color: 'black', marginBottom: '1rem' }}>{t('changePassword')}</h2>
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'black' }}>{t('oldPassword')}</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd000' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'black' }}>{t('newPassword')}</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd000' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'black' }}>{t('confirmPassword')}</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd000' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#ddd', cursor: 'pointer'
                        }}>
                            {t('cancel')}
                        </button>
                        <button type="submit" style={{
                            padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer'
                        }}>
                            {t('submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangeModal;
