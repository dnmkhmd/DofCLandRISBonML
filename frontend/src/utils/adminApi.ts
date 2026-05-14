import axios from 'axios';

const adminApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the admin token to headers
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
                if (!window.location.pathname.includes('/admin/login')) {
                    window.location.href = '/admin/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export interface RequestLog {
    id: number;
    action_type: string;
    description: string;
    user_id?: number;
    user_email?: string;
    ip_address?: string;
    endpoint: string;
    method: string;
    status_code?: number;
    response_time_ms?: number;
    created_at: string;
}

export interface AdminStats {
    total_cars: number;
    active_rentals: number;
    pending_leasing: number;
    total_users: number;
    requests_today: number;
}

export const adminLogin = async (email: string, password: string) => {
    const response = await adminApi.post('/admin/login', { email, password });
    if (response.data.access_token) {
        localStorage.setItem('admin_token', response.data.access_token);
    }
    return response.data;
};

export const getAdminStats = async () => {
    const response = await adminApi.get<AdminStats>('/admin/stats');
    return response.data;
};

export const getAdminLogs = async (params: { skip?: number, limit?: number, action_type?: string, user_email?: string } = {}) => {
    const response = await adminApi.get<RequestLog[]>('/admin/logs', { params });
    return response.data;
};

export const clearAdminLogs = async () => {
    const response = await adminApi.delete('/admin/logs');
    return response.data;
};

export const exportAdminLogsUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/admin/logs/export`;

export default adminApi;
