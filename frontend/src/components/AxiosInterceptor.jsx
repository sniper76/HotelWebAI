import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const AxiosInterceptor = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // console.log('Unauthorized or Forbidden - Logging out...'); 
                    // Optional: Check if we are already on login page to avoid loops (though 401 on login page usually means failed login, not forced logout)
                    // But typically we want to logout global state.

                    logout();
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount
        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [navigate, logout]);

    return null; // This component renders nothing
};

export default AxiosInterceptor;
