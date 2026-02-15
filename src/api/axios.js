import axios from 'axios';

// In-memory access token — never stored in localStorage
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies (refresh token) with every request
});

// Track if a refresh is already in progress to avoid duplicate calls
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
    refreshSubscribers.push(cb);
};

// REQUEST INTERCEPTOR — attach access token
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR — handle 401 with silent refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401 and if we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh the refresh endpoint itself or auth endpoints
            const skipUrls = ['/auth/refresh', '/auth/login', '/auth/signup', '/auth/register', '/auth/verify-email', '/auth/google'];
            if (skipUrls.some(url => originalRequest.url?.includes(url))) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (isRefreshing) {
                // Another refresh is in progress — queue this request
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newToken = data.accessToken;
                setAccessToken(newToken);
                onRefreshed(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed — user must re-login
                setAccessToken(null);
                refreshSubscribers = [];

                // Only redirect if this wasn't a silent background check
                // (skipAuthRedirect flag is set by AuthContext on initial load)
                if (!originalRequest._skipAuthRedirect &&
                    window.location.pathname !== '/login' &&
                    window.location.pathname !== '/signup' &&
                    window.location.pathname !== '/verify-email' &&
                    window.location.pathname !== '/forgot-password' &&
                    window.location.pathname !== '/reset-password') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
