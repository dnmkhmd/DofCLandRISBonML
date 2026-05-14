'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api, { Car } from '@/utils/api';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import CarDetailCalculator from '@/components/CarDetailCalculator';

export default function CarDetailPage() {
    const { id } = useParams();
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchCar() {
            try {
                const res = await api.get(`/cars/${id}`);
                setCar(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchCar();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><div className="loader"></div></div>;
    if (!car) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>{t('common.not_found')}</div>;

    const images = car.images.length > 0 ? car.images : [];

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.layout}>
                    <div className={styles.main}>
                        <div className={styles.gallery}>
                            {images.length > 0 ? (
                                <>
                                    <img 
                                        src={images[activeIdx].url} 
                                        className={styles.mainImage} 
                                        alt="" 
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <div className={styles.thumbnails}>
                                        {images.map((img, idx) => (
                                            <img 
                                                key={idx} 
                                                src={img.url} 
                                                className={`${styles.thumbnail} ${activeIdx === idx ? styles.activeThumbnail : ''}`}
                                                onClick={() => setActiveIdx(idx)}
                                                alt=""
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className={styles.mainImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))' }}>
                                    {t('common.no_image_available')}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '3rem' }}>
                            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{car.brand} {car.model}</h1>
                            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.25rem', marginBottom: '2rem' }}>
                                {t('car_detail.description_prefix')} {car.year} {t(`car_specs.${car.body_type}`)} {t('car_detail.description_suffix')}
                            </p>

                            <div className={styles.specs}>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.engine')}</span>
                                    <span className={styles.specValue}>{car.engine_volume} {t('car_detail.liters')}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.power')}</span>
                                    <span className={styles.specValue}>{car.power} HP</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.transmission')}</span>
                                    <span className={styles.specValue}>{t(`car_specs.${car.transmission}`)}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.drive')}</span>
                                    <span className={styles.specValue}>{car.drive}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.seats')}</span>
                                    <span className={styles.specValue}>{car.seats} {t('car_detail.people')}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>{t('car_detail.fuel')}</span>
                                    <span className={styles.specValue}>{t(`car_specs.${car.fuel_type}`)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className={styles.sidebar}>
                        <div className={styles.stickyCard}>
                            <div className={styles.priceTitle}>
                                {formatPrice(car.rent_price_day)} <span>{t('car_detail.per_day')}</span>
                            </div>
                            <div className={styles.leasingOffer}>
                                <p>{t('car_detail.weekly')}: {formatPrice(car.rent_price_day * 6)}</p>
                                <p>{t('car_detail.monthly')}: {formatPrice(car.rent_price_month)}</p>
                            </div>

                            <div className={styles.actionStack}>
                                <Button size="lg" style={{ width: '100%' }} onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                    {t('car_detail.rent_btn')}
                                </Button>
                                <Button variant="outline" size="lg" style={{ width: '100%' }} onClick={() => document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                    {t('car_detail.leasing_btn')}
                                </Button>
                            </div>

                            <div style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                                {t('car_detail.insurance_maintenance')}
                            </div>
                        </div>
                    </aside>
                </div>
                <div id="calculator-section">
                    <CarDetailCalculator car={car} />
                </div>
            </div>
        </div>
    );
}
