'use client';

import React, { useState, useEffect } from 'react';
import { getCars, predictPrice, Car, CarFeatures, PricePrediction } from '@/utils/api';

/**
 * Example Next.js component demonstrating:
 * 1. Fetching all cars for a "View Cars" section.
 * 2. An AI prediction form that returns recommended cars.
 */
const CarDiscoveryPage = () => {
    // State for View Cars page
    const [allCars, setAllCars] = useState<Car[]>([]);

    // State for AI Prediction
    const [features, setFeatures] = useState<CarFeatures>({
        make: 'Toyota',
        model: 'Highlander',
        year: 2020,
        mileage: 50000,
        fuel_type: 'Gasoline',
        transmission: 'Automatic',
        engine_size: 2.5,
    });

    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch all cars on component mount
    useEffect(() => {
        const fetchAllCars = async () => {
            try {
                const cars = await getCars();
                setAllCars(cars);
                console.log('Successfully fetched all cars:', cars);
            } catch (err) {
                console.error('Error fetching cars:', err);
            }
        };
        fetchAllCars();
    }, []);

    // 2. Handle Price Prediction and Matching
    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('Sending prediction request...', features);
            const result = await predictPrice(features);
            setPrediction(result);
            console.log('Prediction Result with Matches:', result);
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Failed to get prediction';
            setError(errorMsg);
            console.error('Prediction Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Car Discovery & AI Pricing</h1>

            {/* AI Prediction Section */}
            <section className="bg-slate-50 p-6 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-blue-700">AI Price Estimator & Matcher</h2>
                <form onSubmit={handlePredict} className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium">Make</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={features.make}
                            onChange={(e) => setFeatures({ ...features, make: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Model</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={features.model}
                            onChange={(e) => setFeatures({ ...features, model: e.target.value })}
                        />
                    </div>
                    {/* Add other inputs as needed... for brevity showing buttons */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="col-span-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
                    >
                        {loading ? 'Processing...' : 'Predict Price & Find Matches'}
                    </button>
                </form>

                {error && <p className="text-red-500 mb-4">{error}</p>}

                {prediction && (
                    <div className="border-t pt-4">
                        <h3 className="text-xl font-bold">Predicted Price: {prediction.currency} {prediction.predicted_price.toLocaleString()}</h3>
                        <p className="text-gray-600 mb-4">Based on your preferences, we found these matches in our database:</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {prediction.recommended_cars.map(car => (
                                <div key={car.id} className="border p-4 rounded bg-white shadow-sm">
                                    <img src={car.images[0]?.url || '/placeholder-car.jpg'} alt={car.brand} className="w-full h-32 object-cover rounded mb-2" />
                                    <h4 className="font-bold">{car.brand} {car.model} ({car.year})</h4>
                                    <p className="text-blue-600 font-bold">${car.rent_price_day.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">{car.transmission} · {car.fuel_type}</p>
                                </div>
                            ))}
                            {prediction.recommended_cars.length === 0 && <p>No exact matches found in current inventory.</p>}
                        </div>
                    </div>
                )}
            </section>

            {/* View All Cars Section */}
            <section>
                <h2 className="text-2xl font-semibold mb-6">All Available Cars</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {allCars.map(car => (
                        <div key={car.id} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                            <img src={car.images[0]?.url || '/placeholder-car.jpg'} alt={`${car.brand} ${car.model}`} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-bold">{car.brand} {car.model}</h3>
                                <p className="text-gray-500">{car.year} • {car.fuel_type}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-xl font-bold text-blue-600">${car.rent_price_day}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${car.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {car.is_available ? 'Available' : 'Booked'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CarDiscoveryPage;
