import axios from 'axios';
import { getAuthToken, persistLoginUrl } from '../stores/authStore';

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');
const rawApiUrl = import.meta.env.VITE_API_URL;
const rawLoginUrl = import.meta.env.VITE_WEB_HATCHERY_LOGIN_URL;

if (!rawApiUrl) {
    throw new Error('VITE_API_URL environment variable is required');
}

if (!rawLoginUrl) {
    throw new Error('VITE_WEB_HATCHERY_LOGIN_URL environment variable is required');
}

const BASE_URL = normalizeBaseUrl(rawApiUrl);
const WEB_HATCHERY_LOGIN_URL = normalizeBaseUrl(rawLoginUrl);

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const loginUrl = error.response?.data?.login_url || WEB_HATCHERY_LOGIN_URL;
            if (loginUrl) {
                persistLoginUrl(loginUrl);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
