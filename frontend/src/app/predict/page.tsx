'use client';

import { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, 
    Car as CarIcon, 
    Search, 
    TrendingUp, 
    History,
    ChevronRight,
    Loader2,
    Cpu,
    CheckCircle,
    Trophy,
    Brain,
    BarChart3,
    Zap,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    MapPin,
    Fuel,
    Gauge,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslation } from '@/context/LanguageContext';
import { predictPrice, CarFeatures, PricePrediction, Car, getCars } from '@/utils/api';
import styles from './page.module.css';
import axios from 'axios';
import { getCarDisplayImage } from '@/utils/carImages';

// Training data categories
const BRAND_MODELS: Record<string, string[]> = {
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5'],
    'Chevrolet': ['Equinox', 'Impala', 'Malibu', 'Silverado', 'Tahoe'],
    'Ford': ['Escape', 'Explorer', 'F-150', 'Focus', 'Mustang'],
    'Honda': ['Accord', 'CR-V', 'Civic', 'Odyssey', 'Pilot'],
    'Hyundai': ['Elantra', 'Kona', 'Santa Fe', 'Sonata', 'Tucson'],
    'Kia': ['Forte', 'Optima', 'Sorento', 'Soul', 'Sportage'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Nissan': ['Altima', 'Maxima', 'Murano', 'Rogue', 'Sentra'],
    'Toyota': ['Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4']
};

export default function PredictPage() {
    const [formData, setFormData] = useState({
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        engine_size: 2.0
    });

    const [prediction, setPrediction] = useState<PricePrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stepPhase, setStepPhase] = useState(1);
    const [mounted, setMounted] = useState(false);
    const [predictionType, setPredictionType] = useState<'rental' | 'leasing'>('rental');
    
    // Discovery features
    const [similarCars, setSimilarCars] = useState<Car[]>([]);
    const [fetchingSimilar, setFetchingSimilar] = useState(false);
    const [showSimilar, setShowSimilar] = useState(false);
    
    const { formatPrice } = useCurrency();
    const { t } = useTranslation();
    const router = useRouter();
    const similarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
       const { name, value } = e.target;
        
        if (name === 'make') {
            const firstModel = BRAND_MODELS[value][0];
            setFormData(prev => ({
                ...prev,
                make: value,
                model: firstModel
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'year' || name === 'engine_size' ? Number(value) : value
            }));
        }
        
        if (error) setError(null);
    };

    const getRealisticPrice = (brand: string, model: string): number => {
        const b = brand.toLowerCase();
        const m = model.toLowerCase();

        // Budget
        if (['hyundai', 'kia', 'toyota'].includes(b) &&
            ['yaris', 'accent', 'rio', 'creta', 'forte', 'corolla', 'civic', 'sentra', 'focus'].some(x => m.includes(x))) {
            return Math.round((10000 + Math.random() * 5000));
        }

        // Mid-range
        if (['toyota', 'hyundai', 'kia'].includes(b)) {
            return Math.round((18000 + Math.random() * 7000));
        }

        // Business
        if (['bmw', 'mercedes', 'audi'].includes(b) &&
            ['3', '4', '5', 'c', 'e', 'a4', 'a6'].some(x => m.includes(x))) {
            return Math.round((45000 + Math.random() * 15000));
        }

        // BMW/Mercedes/Audi SUV (X5, X7, GLE, GLS, Q7, Q8)
        if (['bmw', 'mercedes', 'audi'].includes(b) &&
            ['x5', 'x7', 'gle', 'gls', 'q7', 'q8'].some(x => m.includes(x))) {
            return Math.round((65000 + Math.random() * 20000));
        }

        // Lexus
        if (b === 'lexus') {
            return Math.round((55000 + Math.random() * 20000));
        }

        // Tesla
        if (b === 'tesla') {
            return Math.round((50000 + Math.random() * 15000));
        }

        // Range Rover
        if (b === 'range rover' || m.includes('range')) {
            return Math.round((90000 + Math.random() * 30000));
        }

        // Porsche
        if (b === 'porsche') {
            return Math.round((110000 + Math.random() * 40000));
        }

        // Ferrari, Lamborghini
        if (['ferrari', 'lamborghini'].includes(b)) {
            return Math.round((200000 + Math.random() * 100000));
        }

        // Default
        return Math.round((30000 + Math.random() * 10000));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setPrediction(null);
        setSimilarCars([]);
        setShowSimilar(false);
        setStepPhase(1);

        try {
            // Processing phases
            setTimeout(() => setStepPhase(2), 300);
            setTimeout(() => setStepPhase(3), 600);

            const payload: CarFeatures = {
                make: formData.make,
                model: formData.model,
                year: formData.year,
                mileage: 10000, // Default for prediction if not specified
                fuel_type: 'Gasoline', // Default for now
                transmission: 'Automatic', // Default for now
                engine_size: formData.engine_size,
                prediction_type: predictionType
            };

            const result = await predictPrice(payload);
            setPrediction(result);
            setSimilarCars(result.recommended_cars || []);

            setTimeout(() => {
                setLoading(false);
                setShowSimilar(true);
                
                // Scroll to results
                setTimeout(() => {
                    similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }, 1000);

        } catch (err: any) {
            console.error("Prediction failed", err);
            setError(err.response?.data?.detail || err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    // loadSimilarCars is now integrated into handleSubmit for immediate response
    const loadSimilarCars = () => {
        similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCarAction = (carId: number) => {
        router.push(`/cars/${carId}`);
    };

    if (!mounted) return <div className={styles.page} />;

    const currentStep = loading ? stepPhase : (prediction ? 3 : 1);

    const steps = [
        { id: 1, label: t('predict.step1') },
        { id: 2, label: t('predict.step2') },
        { id: 3, label: t('predict.step3') },
        { id: 4, label: t('predict.step4') }
    ];

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Steps Indicator */}
                <div className={styles.stepsContainer}>
                    <div className={styles.stepLine}></div>
                    <div className={styles.stepsRow}>
                        {steps.map((step) => (
                            <div 
                                key={step.id} 
                                className={`${styles.stepItem} ${currentStep === step.id ? styles.stepActive : ''} ${currentStep > step.id ? styles.stepCompleted : ''}`}
                            >
                                <div className={styles.stepCircle}>
                                    {currentStep > step.id ? <CheckCircle size={20} /> : step.id}
                                </div>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.splitLayout}>
                    {/* Info Side (Left) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.infoSide}
                    >
                        <CarIcon size={64} className={styles.brandingIcon} />
                        <h1 className={styles.mainTitle}>{t('predict.title', 'AI Prediction')}</h1>
                        <p className={styles.mainSubtitle}>
                            {t('predict.subtitle')}
                        </p>

                        <div className={styles.featuresGrid}>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}><Brain size={24} color="#7C3AED" /></div>
                                <div className={styles.featureText}>
                                    <h4>{t('predict.feature1_title')}</h4>
                                    <p>{t('predict.feature1_desc')}</p>
                                </div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}><BarChart3 size={24} color="#3B82F6" /></div>
                                <div className={styles.featureText}>
                                    <h4>{t('predict.feature2_title')}</h4>
                                    <p>{t('predict.feature2_desc')}</p>
                                </div>
                            </div>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}><Zap size={24} color="#22C55E" /></div>
                                <div className={styles.featureText}>
                                    <h4>{t('predict.feature3_title')}</h4>
                                    <p>{t('predict.feature3_desc')}</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/models">
                            <button style={{
                                background: 'transparent',
                                border: '1px solid #7C3AED',
                                color: '#A78BFA',
                                borderRadius: 10,
                                padding: '10px 20px',
                                width: '100%',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                marginTop: 16
                            }}>
                                📊 {t('predict.models_link')}
                            </button>
                        </Link>
                    </motion.div>

                    {/* Form Side (Right) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className={styles.formCard}
                    >
                        <div className={styles.formHeader}>
                            <h2>{t('predict.form_title')}</h2>
                            <p>{t('predict.form_subtitle')}</p>
                        </div>

                        {/* Prediction Type Toggle */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '24px',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '6px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <button
                                type="button"
                                onClick={() => setPredictionType('rental')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: predictionType === 'rental' ? '#7C3AED' : 'transparent',
                                    color: predictionType === 'rental' ? 'white' : '#64748B'
                                }}
                            >
                                🚗 {t('models.rental_tab')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setPredictionType('leasing')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: predictionType === 'leasing' ? '#7C3AED' : 'transparent',
                                    color: predictionType === 'leasing' ? 'white' : '#64748B'
                                }}
                            >
                                📋 {t('models.leasing_tab')}
                            </button>
                        </div>

                        <div className={styles.divider}></div>

                        <form onSubmit={handleSubmit} className={styles.formGrid}>
                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start mb-4"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-red-400 text-sm font-semibold">{t('predict.error_title', 'Prediction Error')}</p>
                                            <p className="text-red-400/80 text-xs mt-1">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={styles.fieldGroup}>
                                <label>{t('predict.make', 'Brand')}</label>
                                <select name="make" value={formData.make} onChange={handleChange} className={styles.select}>
                                    {Object.keys(BRAND_MODELS).map(brand => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={styles.fieldGroup}>
                                <label>{t('predict.model', 'Model')}</label>
                                <select name="model" value={formData.model} onChange={handleChange} className={styles.select}>
                                    {BRAND_MODELS[formData.make].map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </motion.div>

                            <div className={styles.formRow}>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={styles.fieldGroup}>
                                    <label>{t('predict.year', 'Year')}</label>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} min="2015" max="2025" required className={styles.input} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={styles.fieldGroup}>
                                    <label>{t('predict.engine', 'Engine, L')}</label>
                                    <input type="number" step="0.1" name="engine_size" value={formData.engine_size} onChange={handleChange} min="1.0" max="6.0" required className={styles.input} />
                                </motion.div>
                            </div>

                            <button type="submit" disabled={loading} className={styles.predictBtn}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>{t('predict.analyzing', 'Analyzing...')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        <span>{t('predict.btn', 'Predict Price')}</span>
                                    </>
                                )}
                            </button>

                            <AnimatePresence>
                                {prediction && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={styles.resultCard}
                                    >
                                        <div className={styles.resultLabel}>
                                            {predictionType === 'rental' ? t('predict.est_label') : t('predict.est_leasing_label', 'Estimated Leasing Cost')}
                                        </div>
                                        <div className={styles.resultPrice}>
                                            {formatPrice(prediction.predicted_price)}
                                        </div>
                                        <div className={styles.resultUnit}>
                                            {predictionType === 'rental' ? t('predict.per_day_rental') : t('predict.total_leasing_price', 'Total Leasing Price')}
                                        </div>

                                        <div className={styles.confidenceSection}>
                                            <div className={styles.confidenceLabel}>{t('predict.confidence_label')}</div>
                                            <div className={styles.progressTrack}>
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '87%' }}
                                                    transition={{ duration: 0.6, delay: 0.2 }}
                                                    className={styles.progressBar}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.insightGrid}>
                                            <div className={`${styles.badge} ${styles.badgeSuccess}`}>{t('predict.badge1')}</div>
                                            <div className={`${styles.badge} ${styles.badgePrimary}`}>{t('predict.badge2')}</div>
                                            <div className={`${styles.badge} ${styles.badgeVariant}`}>{t('predict.badge3')}</div>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={loadSimilarCars}
                                            disabled={fetchingSimilar}
                                            className={styles.similarBtn}
                                        >
                                            {fetchingSimilar ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>{t('similar_discovery.loading', 'Searching...')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CarIcon size={18} />
                                                    <span>{t('predict.similar.btn', { count: '5-10' })}</span>
                                                </>
                                            )}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.div>
                </div>

                {/* Similar Cars Results Grid */}
                <AnimatePresence>
                    {showSimilar && similarCars.length > 0 && (
                        <motion.div 
                            ref={similarRef}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.6 }}
                            className={styles.similarSection}
                        >
                            <div className={styles.similarHeader}>
                                <div>
                                    <h2>{t('predict.similar.title')}</h2>
                                    <div className={styles.similarCount}>
                                        {t('predict.similar.subtitle')} {formData.make} {formData.model} • {t('predict.similar.found', { count: similarCars.length })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.similarGrid}>
                                {similarCars.map((car, index) => {
                                    const P = prediction?.predicted_price || 0;
                                    const isMatch = Math.abs(car.rent_price_day - P) <= P * 0.15;

                                    return (
                                        <motion.div
                                            key={car.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className={styles.similarCard}
                                        >
                                            <div className={styles.cardImageWrapper}>
                                                {/* Use a simple check for photo. If it contains photo1.jpg, it might not exist yet */}
                                                <div className={styles.imageContainer}>
                                                    {getCarDisplayImage(car) ? (
                                                        <img 
                                                            src={getCarDisplayImage(car)!} 
                                                            alt={car.brand + ' ' + car.model} 
                                                            className={styles.cardImage}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className={styles.photoPlaceholder} style={{ background: '#1E293B' }}>
                                                            <CarIcon size={40} className="text-white/10 mb-2" />
                                                            <div className="text-white/30 text-[11px] font-medium">{car.brand} {car.model}</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.cardBodyType}>{car.body_type}</div>
                                            </div>
                                            
                                            <div className={styles.cardContent}>
                                                {isMatch && (
                                                    <div className={styles.matchBadge}>
                                                        {t('similar_discovery.match_badge', '✓ Matches estimate')}
                                                    </div>
                                                )}
                                                <h3 className={styles.cardTitle}>{car.brand} {car.model}</h3>
                                                <div className={styles.cardSpecs}>
                                                    {car.engine_volume}L | {car.year} | {car.transmission}
                                                </div>
                                                
                                                <div className={styles.cardPrice}>
                                                    {predictionType === 'rental' 
                                                        ? `${formatPrice(car.rent_price_day)} ${t('predict.per_day', '/day')}`
                                                        : `${formatPrice(car.leasing_price)}`
                                                    }
                                                </div>
                                                
                                                <div className={styles.cardActions}>
                                                    <button 
                                                        onClick={() => handleCarAction(car.id)}
                                                        className={styles.btnDetails}
                                                    >
                                                        {t('similar_discovery.details', 'Details')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleCarAction(car.id)}
                                                        className={styles.btnBook}
                                                    >
                                                        {t('similar_discovery.book', 'Book')}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
            </div>
        </div>
    );
}
