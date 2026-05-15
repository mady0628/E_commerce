const DEFAULT_API_URL = 'http://localhost:3000';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

export const apiUrl = (path = '') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (url, option = {}) => {
    const requestUrl = /^https?:\/\//.test(url) ? url : apiUrl(url);
    const res = await fetch(requestUrl, {
        ...option,
        headers: {
            'Content-Type': 'application/json',
            ...option.headers
        }
    });

    return res.json();
};
