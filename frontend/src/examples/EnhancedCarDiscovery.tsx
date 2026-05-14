'use client';

import React, { useState, useEffect } from 'react';
import { getCars, predictPrice, Car, CarFeatures, PricePrediction } from '@/utils/api';

/**
 * Enhanced Car Discovery Page with:
 * 1. Gallery featuring multiple photos per car.
 * 2. Detailed feature display (make, model, year, mileage, price, fuel, transmission, engine, description).
 * 3. AI Prediction and matching logic.
 */
const EnhancedCarDiscovery = () => {
    const [allCars, setAllCars] = useState<Car[]>([]);
    const [features, setFeatures] = useState<CarFeatures>({
        make: 'Mercedes',
        model: 'C-Class',
        year: 2022,
        mileage: 15000,
        fuel_type: 'Gasoline',
        transmission: 'Automatic',
        engine_size: 2.0,
    });

    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllCars = async () => {
            try {
                const cars = await getCars();
                setAllCars(cars);
            } catch (err) {
                console.error('Error fetching cars:', err);
            }
        };
        fetchAllCars();
    }, []);

    const handlePredict = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const result = await predictPrice(features);
            setPrediction(result);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Prediction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-10 text-center">Premium Car Discovery</h1>

                {/* AI Section */}
                <section className="bg-white rounded-3xl shadow-xl overflow-hidden mb-16 border border-slate-100">
                    <div className="bg-blue-600 p-8 text-white">
                        <h2 className="text-2xl font-bold mb-2">AI Price Expert</h2>
                        <p className="opacity-90 italic">Let our ML model find your optimal price and match you with our inventory.</p>
                    </div>

                    <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <form onSubmit={handlePredict} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Make', key: 'make' },
                                    { label: 'Model', key: 'model' },
                                    { label: 'Year', key: 'year', type: 'number' },
                                    { label: 'Mileage', key: 'mileage', type: 'number' },
                                    { label: 'Fuel Type', key: 'fuel_type' },
                                    { label: 'Transmission', key: 'transmission' },
                                    { label: 'Engine Size (L)', key: 'engine_size', type: 'number', step: '0.1' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                                        <input
                                            type={field.type || 'text'}
                                            step={field.step}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            value={(features as any)[field.key]}
                                            onChange={(e) => setFeatures({ ...features, [field.key]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transform hover:-translate-y-1 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Analyzing Data...' : 'Find My Optimal Match'}
                            </button>
                        </form>

                        {/* Result Display */}
                        <div className="flex flex-col justify-center">
                            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 mb-4">{error}</div>}

                            {prediction ? (
                                <div className="animate-in fade-in slide-in-from-right duration-500">
                                    <div className="text-center mb-8">
                                        <h3 className="text-slate-500 text-lg">AI Estimated Fair Price</h3>
                                        <p className="text-5xl font-black text-blue-600">${prediction.predicted_price.toLocaleString()}</p>
                                    </div>

                                    <h4 className="font-bold text-slate-900 mb-4 border-b pb-2">Top Inventory Matches</h4>
                                    <div className="space-y-4">
                                        {prediction.recommended_cars.map(car => (
                                            <div key={car.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition">
                                                <img src={car.images[0]?.url || '/placeholder.jpg'} className="w-24 h-24 object-cover rounded-xl" alt="" />
                                                <div className="flex-grow">
                                                    <h5 className="font-bold">{car.brand} {car.model}</h5>
                                                    <p className="text-sm text-slate-500">{car.year} • {car.transmission}</p>
                                                    <p className="text-blue-600 font-black">${car.rent_price_day.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {prediction.recommended_cars.length === 0 && <p className="text-slate-400 italic text-center">No inventory matches your current criteria.</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl opacity-50">
                                    <p className="text-slate-400">Select car features to see AI recommendations</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Inventory Gallery */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-900">Current Inventory</h2>
                        <span className="bg-slate-200 text-slate-700 px-4 py-1 rounded-full text-sm font-bold">{allCars.length} Vehicles</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {allCars.map(car => (
                            <CarCard key={car.id} car={car} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

/**
 * Detailed Car Card with all features and multi-photo support
 */
const CarCard = ({ car }: { car: Car }) => {
    const [activePhoto, setActivePhoto] = useState(0);
    const photos = car.images.length > 0 ? car.images.map(i => i.url) : ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'];

    return (
        <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-slate-200">
                <img
                    src={photos[activePhoto]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={`${car.brand} ${car.model}`}
                />

                {/* Photo Pips */}
                {photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/20 backdrop-blur-md rounded-full">
                        {photos.slice(0, 5).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActivePhoto(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${activePhoto === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">${car.rent_price_day.toLocaleString()}</span>
                </div>
            </div>

            {/* Features Info */}
            <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-none mb-1">{car.brand} {car.model}</h3>
                        <p className="text-slate-400 font-medium">{car.year} Premium Edition</p>
                    </div>
                    {!car.is_available && (
                        <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Reserved</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6 text-sm">
                    <FeatureItem label="Engine" value={`${car.engine_volume}L`} />
                    <FeatureItem label="Fuel" value={car.fuel_type} />
                    <FeatureItem label="Gearbox" value={car.transmission} />
                </div>

                <p className="text-slate-500 text-sm italic mb-6 line-clamp-2">
                    Premium vehicle with advanced features and exceptional performance.
                </p>

                <button className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-600 transition-colors shadow-md">
                    View Full Spec
                </button>
            </div>
        </div>
    );
};

const FeatureItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">{label}</span>
        <span className="text-slate-800 font-bold leading-none">{value}</span>
    </div>
);

export default EnhancedCarDiscovery;
