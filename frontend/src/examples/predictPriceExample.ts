import axios from 'axios';

/**
 * Interface for car features matching the backend schema
 */
export interface CarFeatures {
    make: string;
    model: string;
    year: number;
    mileage: number;
    fuel_type: string;
    transmission: string;
    engine_size: number;
}

/**
 * Interface for the price prediction response
 */
export interface PricePrediction {
    predicted_price: number;
    currency: string;
}

// Create an axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Function to predict car price using the ML model
 * @param features The car features to send to the model
 */
export const predictCarPrice = async (features: CarFeatures): Promise<void> => {
    try {
        console.log('Making price prediction request with features:', features);

        const response = await api.post<PricePrediction>('/predict_price', features);

        console.log('Prediction Result:');
        console.log(`Estimated Price: ${response.data.currency} ${response.data.predicted_price.toLocaleString()}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error making prediction request:');
            console.error(`Status: ${error.response?.status}`);
            console.error(`Message: ${error.response?.data?.detail || error.message}`);
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
};

/**
 * Example usage with valid categorical values from the ML training set
 */
const runExample = () => {
    const sampleCar: CarFeatures = {
        make: 'Mercedes',        // Valid categorical value
        model: 'C-Class',         // Valid categorical value
        year: 2022,              // Numbers can be reasonable values
        mileage: 15000,          // Numbers can be reasonable values
        fuel_type: 'Gasoline',   // Valid categorical value
        transmission: 'Automatic', // Valid categorical value
        engine_size: 2.0         // Numbers can be reasonable values
    };

    predictCarPrice(sampleCar);
};

// Export the example runner
export default runExample;
