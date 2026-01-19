import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

const AdminAccessLogs = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchLogs = async (pageNumber) => {
        try {
            const response = await api.get(`/admin/logs?page=${pageNumber}&size=20&sort=timestamp,desc`);
            setLogs(response.data.content);
            setTotalPages(response.data.totalPages);
            setPage(response.data.number);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    useEffect(() => {
        fetchLogs(0);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchLogs(newPage);
        }
    };

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h2>{t('accessLogs')}</h2>
            <div className="table-container" style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>{t('timestamp')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('method')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('url')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('status')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('clientIp')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('username')}</th>
                            <th style={{ padding: '0.5rem' }}>{t('requestParams')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>{moment(log.timestamp).add(9, 'hours').format('YYYY-MM-DD HH:mm:ss')}</td>
                                <td style={{ padding: '0.5rem' }}>{log.method}</td>
                                <td style={{ padding: '0.5rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.url}>{log.url}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <span style={{
                                        color: log.status >= 200 && log.status < 300 ? 'green' : log.status >= 400 ? 'red' : 'orange',
                                        fontWeight: 'bold'
                                    }}>
                                        {log.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.5rem' }}>{log.clientIp}</td>
                                <td style={{ padding: '0.5rem' }}>{log.username || '-'}</td>
                                <td style={{ padding: '0.5rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.requestParams}>
                                    {log.requestParams}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '1rem' }}>
                <button
                    onClick={() => handlePageChange(page - 1)}
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
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="btn"
                    style={{ padding: '0.5rem 1rem' }}
                >
                    {t('next')}
                </button>
            </div>
        </div>
    );
};

export default AdminAccessLogs;
