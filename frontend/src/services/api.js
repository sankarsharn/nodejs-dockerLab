import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data)
};

// Book APIs
export const bookAPI = {
    getAll: (params) => api.get('/books', { params }),
    getById: (id) => api.get(`/books/${id}`),
    create: (data) => api.post('/books', data),
    update: (id, data) => api.put(`/books/${id}`, data),
    delete: (id) => api.delete(`/books/${id}`),
    getCategories: () => api.get('/books/categories')
};

// Member APIs
export const memberAPI = {
    getAll: (params) => api.get('/members', { params }),
    getById: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`),
    getHistory: (id) => api.get(`/members/${id}/history`)
};

// Transaction APIs
export const transactionAPI = {
    getAll: (params) => api.get('/transactions', { params }),
    getMyTransactions: (params) => api.get('/transactions/my', { params }),
    issueBook: (data) => api.post('/transactions/issue', data),
    returnBook: (id) => api.post(`/transactions/return/${id}`),
    getOverdue: () => api.get('/transactions/overdue'),
    payFine: (id) => api.put(`/transactions/${id}/pay-fine`)
};

// Dashboard APIs
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRecent: () => api.get('/dashboard/recent'),
    getCategories: () => api.get('/dashboard/categories'),
    getMonthly: () => api.get('/dashboard/monthly')
};

export default api;
