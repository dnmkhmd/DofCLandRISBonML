'use client';

import { useState } from 'react';
import { predictPrice, CarFeatures } from '@/utils/api';
import styles from './page.module.css';

export default function PredictPage() {
    const [formData, setFormData] = useState<CarFeatures>({
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 50000,
        fuel_type: 'Gasoline',
        transmission: 'Automatic',
        engine_size: 2.5
    });

    const [prediction, setPrediction] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'mileage' || name === 'engine_size' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await predictPrice(formData);
            setPrediction(result.predicted_price);
        } catch (error) {
            console.error("Prediction failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '4rem' }}>
            <h1 className={styles.title}>Car Price Predictor</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.group}>
                    <label>Make</label>
                    <select name="make" value={formData.make} onChange={handleChange}>
                        <option value="Toyota">Toyota</option>
                        <option value="Honda">Honda</option>
                        <option value="BMW">BMW</option>
                        <option value="Mercedes">Mercedes</option>
                        <option value="Ford">Ford</option>
                        {/* Add more as needed */}
                    </select>
                </div>

                <div className={styles.group}>
                    <label>Model</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                    <label>Year</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                    <label>Mileage</label>
                    <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required />
                </div>

                <div className={styles.group}>
                    <label>Fuel Type</label>
                    <select name="fuel_type" value={formData.fuel_type} onChange={handleChange}>
                        <option value="Gasoline">Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>

                <div className={styles.group}>
                    <label>Transmission</label>
                    <select name="transmission" value={formData.transmission} onChange={handleChange}>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                    </select>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Calculating...' : 'Predict Price'}
                </button>
            </form>

            {prediction !== null && (
                <div className={styles.result}>
                    <h2>Estimated Price: ${prediction.toFixed(2)}</h2>
                </div>
            )}
        </div>
    );
}
