'use client';

import React, { useState, useEffect } from 'react';
import { getCars, Car } from '@/utils/api';

/**
 * A clean Next.js example for the "View Cars" page.
 * Fetches all cars from the FastAPI backend and displays them as cards.
 */
const ViewCarsPage = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cars from API on mount
    useEffect(() => {
        const loadCars = async () => {
            try {
                console.log('Fetching cars from /cars/ endpoint...');
                const data = await getCars();
                setCars(data);
                console.log('Successfully loaded cars:', data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch cars';
                setError(errorMessage);
                console.error('Error fetching cars:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCars();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center text-red-600">
            <h2 className="text-2xl font-bold">Error</h2>
            <p>{error}</p>
        </div>
    );

    return (
        <main className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Our Car Collection</h1>
                    <p className="text-gray-600">Browse our wide range of premium vehicles</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {cars.map((car) => (
                        <div
                            key={car.id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
                        >
                            {/* Car Image Hook */}
                            <div className="relative h-48 w-full bg-gray-200">
                                <img
                                    src={car.images[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'}
                                    alt={`${car.brand} ${car.model}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800';
                                    }}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${car.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {car.is_available ? 'Available' : 'Reserved'}
                                    </span>
                                </div>
                            </div>

                            {/* Car Details */}
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                        {car.brand} <span className="text-blue-600">{car.model}</span>
                                    </h3>
                                    <span className="text-sm font-medium text-gray-500">{car.year}</span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {`Experience the power and elegance of this ${car.brand} ${car.model}. Perfect for your next journey.`}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Starting at</span>
                                        <span className="text-2xl font-black text-gray-900">₸{car.rent_price_day.toLocaleString()}</span>
                                    </div>
                                    <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors duration-200">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {cars.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 text-xl font-medium">No cars available at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ViewCarsPage;
