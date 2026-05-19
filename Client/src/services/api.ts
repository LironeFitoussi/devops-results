import axios from "axios";

// In development, use relative URLs to leverage Vite proxy
// In production, use the full API URL from environment variable
const getBaseURL = () => {
    // If VITE_API_URL is explicitly set and not empty, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // In development, use relative URL (will be proxied by Vite)
    if (import.meta.env.DEV) {
        return '';
    }
    // Fallback for production
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

export default api;