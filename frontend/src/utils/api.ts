import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    mileage: number;
    price: number;
    fuel_type: string;
    transmission: string;
    engine_size: number;
    description?: string;
    image_url?: string;
    is_available: boolean;
}

export interface CarFeatures {
    make: string;
    model: string;
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    engine_size: number;
}

export interface PricePrediction {
    predicted_price: number;
    currency: string;
}

export const getCars = async () => {
    const response = await api.get<Car[]>('/cars/');
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
