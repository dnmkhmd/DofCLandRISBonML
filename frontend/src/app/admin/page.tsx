'use client';

import { useEffect, useState } from 'react';
import { getCars, Car } from '@/utils/api';
import styles from './page.module.css';

export default function AdminPage() {
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
            <h1 className={styles.title}>Admin Dashboard</h1>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h3>Total Cars</h3>
                    <p>{cars.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Available</h3>
                    <p>{cars.filter(c => c.is_available).length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Avg Price</h3>
                    <p>${(cars.reduce((acc, c) => acc + c.price, 0) / cars.length || 0).toFixed(0)}</p>
                </div>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map((car) => (
                        <tr key={car.id}>
                            <td>{car.id}</td>
                            <td>{car.make}</td>
                            <td>{car.model}</td>
                            <td>{car.year}</td>
                            <td>${car.price}</td>
                            <td>
                                <span className={car.is_available ? styles.available : styles.rented}>
                                    {car.is_available ? 'Available' : 'Rented'}
                                </span>
                            </td>
                            <td>
                                <button className={styles.actionBtn}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
