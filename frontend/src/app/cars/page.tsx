'use client';

import { useEffect, useState } from 'react';
import { getCars, Car } from '@/utils/api';
import styles from './page.module.css';

export default function CarsPage() {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCars() {
            try {
                const data = await getCars();
                setCars(data);
            } catch (error) {
                console.error("Failed to fetch cars", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCars();
    }, []);

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h1 className={styles.title}>Available Cars</h1>
            <div className={styles.grid}>
                {cars.map((car) => (
                    <div key={car.id} className={styles.card}>
                        <div className={styles.imagePlaceholder}>
                            {/* Image would go here */}
                            <span>{car.make} {car.model}</span>
                        </div>
                        <div className={styles.content}>
                            <h2>{car.year} {car.make} {car.model}</h2>
                            <p className={styles.price}>${car.price} / day</p>
                            <div className={styles.details}>
                                <span>{car.mileage} miles</span>
                                <span>{car.fuel_type}</span>
                                <span>{car.transmission}</span>
                            </div>
                            <button className={styles.bookBtn}>Book Now</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
