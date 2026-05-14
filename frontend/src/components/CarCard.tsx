'use client';

import Link from 'next/link';
import { Car } from '@/utils/api';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getCarDisplayImage, getCarFallbackImage } from '@/utils/carImages';
import { Tag, Car as CarIcon } from 'lucide-react';
import styles from './CarCard.module.css';
import Button from './ui/Button';

interface CarCardProps {
    car: Car;
    onRent: (car: Car) => void;
}

export default function CarCard({ car, onRent }: CarCardProps) {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const displayImage = getCarDisplayImage(car);
    const fallbackImage = getCarFallbackImage(car.brand, car.model);
    
    // Final src safely handles null by not passing '' to img
    const finalSrc = displayImage || fallbackImage;

    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                {finalSrc ? (
                    <img 
                        src={finalSrc} 
                        alt={`${car.brand} ${car.model}`}
                        className={styles.image}
                        onError={(e) => { 
                            // If first image fails, try generic fallback if it was different
                            if (fallbackImage && displayImage !== fallbackImage && !e.currentTarget.src.endsWith(fallbackImage)) {
                                e.currentTarget.src = fallbackImage; 
                            } else {
                                // Final fallback: hide broken image element via state or CSS
                                e.currentTarget.style.display = 'none';
                            }
                        }}
                    />
                ) : (
                    <div className={styles.photoPlaceholder}>
                        <CarIcon size={48} className={styles.placeholderIcon} strokeWidth={1} />
                        <span className={styles.placeholderText}>{car.brand}</span>
                    </div>
                )}
                <div className={styles.badge}>{car.year}</div>
            </div>
            
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{car.brand} {car.model}</h3>
                    <div className={styles.type}>{t(`car_specs.${car.body_type}`)}</div>
                </div>

                <div className={styles.specs}>
                    <div className={styles.spec}>
                        <span>{car.engine_volume}L</span>
                        <p>{t('car.engine')}</p>
                    </div>
                    <div className={styles.spec}>
                        <span>{car.power} HP</span>
                        <p>{t('car.power')}</p>
                    </div>
                    <div className={styles.spec}>
                        <span>{t(`car_specs.${car.transmission}`)}</span>
                        <p>{t('car.transmission')}</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.pricing}>
                        <div className={styles.price}>
                            {formatPrice(car.rent_price_day)} <span>{t('car.per_day')}</span>
                        </div>
                        <div className={styles.leasePrice}>
                            {t('car.lease_from')} {formatPrice(car.leasing_price)} {t('car.per_month')}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <Link href={`/cars/${car.id}`}>
                            <Button variant="outline" size="md" style={{ width: '100%' }}>
                                {t('car.info')}
                            </Button>
                        </Link>
                        <Button size="md" onClick={() => onRent(car)}>
                            {t('car.rent')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
