import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export interface CarImage {
    id: number;
    url: string;
}

export interface Car {
    id: number;
    brand: string;
    model: string;
    year: number;
    engine_volume: number;
    power: number;
    fuel_type: string;
    transmission: string;
    drive: string;
    seats: number;
    body_type: string;
    color: string;
    rent_price_day: number;
    rent_price_month: number;
    leasing_price: number;
    is_available: boolean;
    images: CarImage[];
}

export interface CarFeatures {
    make: string;
    model: string;
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    engine_size: number;
    prediction_type: string;
}

export interface PricePrediction {
    predicted_price: number;
    currency: string;
    recommended_cars: Car[];
}

export interface CarFilters {
    brand?: string;
    model?: string;
    model_name?: string;
    year_from?: number;
    year_to?: number;
    min_price?: number;
    max_price?: number;
    body_type?: string;
    fuel_type?: string;
    transmission?: string;
    seats?: number;
    skip?: number;
    limit?: number;
}

export const getCars = async (filters: CarFilters = {}) => {
    const response = await api.get<Car[]>('/cars', { params: filters });
    return response.data;
};

export const createCar = async (car: Omit<Car, 'id'>) => {
    const response = await api.post<Car>('/cars/', car);
    return response.data;
};

export const predictPrice = async (features: CarFeatures) => {
    const response = await api.post<PricePrediction>('/predict_price', features);
    return response.data;
};

export default api;
