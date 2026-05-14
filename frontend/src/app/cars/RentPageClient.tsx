'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCars, Car } from '@/utils/api';
import { useTranslation } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import CarCard from '@/components/CarCard';
import RentalCalculator from '@/components/RentalCalculator';

export default function RentPageClient() {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [cars, setCars] = useState<Car[]>([]);
    const [filteredCars, setFilteredCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [filters, setFilters] = useState({
        brand: '',
        body_type: '',
        fuel_type: '',
        transmission: '',
        seats: '',
        min_price: '',
        max_price: '',
        year_from: '',
        year_to: '',
    });

    const [minInput, setMinInput] = useState('');
    const [maxInput, setMaxInput] = useState('');

    const [sort, setSort] = useState('price_asc');
    const [activeCategoryLabel, setActiveCategoryLabel] = useState<string>('');
    const searchParams = useSearchParams();

    // Initial load and URL param handle
    useEffect(() => {
        const category = searchParams ? searchParams.get('category') : null;
        let initialFilters = { ...filters };

        if (category) {
            if (category === 'standard') {
                initialFilters = { ...filters, min_price: '18000', max_price: '35000' };
                setActiveCategoryLabel(`Standard Cars (${formatPrice(18000)} – ${formatPrice(35000)})`);
                setMinInput('18000');
                setMaxInput('35000');
            } else if (category === 'comfort') {
                initialFilters = { ...filters, min_price: '55000', max_price: '95000' };
                setActiveCategoryLabel(`Comfort Cars (${formatPrice(55000)} – ${formatPrice(95000)})`);
                setMinInput('55000');
                setMaxInput('95000');
            } else if (category === 'premium') {
                initialFilters = { ...filters, min_price: '110000', max_price: '200000' };
                setActiveCategoryLabel(`Premium Cars (${formatPrice(110000)} – ${formatPrice(200000)})`);
                setMinInput('110000');
                setMaxInput('200000');
            }
            setFilters(initialFilters);
        }
        
        fetchCars(initialFilters);
    }, [searchParams]);


    // Fetch initial data for filters (brands)
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const allCarsData = await getCars();
                const uniqueBrands = Array.from(new Set(allCarsData.map(c => c.brand))).sort();
                setAvailableBrands(uniqueBrands);
            } catch (error) {
                console.error("Failed to fetch initial brands", error);
            }
        }
        fetchInitialData();
    }, []);

    const fetchCars = async (currentFilters = filters, currentSort = sort) => {
        setLoading(true);
        try {
            const params: any = {};
            if (currentFilters.brand) params.brand = currentFilters.brand;
            if (currentFilters.body_type) params.body_type = currentFilters.body_type;
            if (currentFilters.fuel_type) params.fuel_type = currentFilters.fuel_type;
            if (currentFilters.transmission) params.transmission = currentFilters.transmission;
            if (currentFilters.seats) params.seats = parseInt(currentFilters.seats);
            if (currentFilters.min_price) params.min_price = parseFloat(currentFilters.min_price);
            if (currentFilters.max_price) params.max_price = parseFloat(currentFilters.max_price);
            if (currentFilters.year_from) params.year_from = parseInt(currentFilters.year_from);
            if (currentFilters.year_to) params.year_to = parseInt(currentFilters.year_to);

            const data = await getCars(params);
            
            // Sort client-side for simplicity as API doesn't support it yet
            let result = [...data];
            if (currentSort === 'price_asc') result.sort((a, b) => a.rent_price_day - b.rent_price_day);
            if (currentSort === 'price_desc') result.sort((a, b) => b.rent_price_day - a.rent_price_day);
            if (currentSort === 'year_desc') result.sort((a, b) => b.year - a.year);

            setFilteredCars(result);
            setCurrentPage(1); // Reset to page 1 on filter/sort change
        } catch (error) {
            console.error("Failed to fetch cars", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchCars();
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'min_price') {
            setMinInput(value);
            setFilters(prev => ({ ...prev, min_price: value }));
            setActiveCategoryLabel('');
            return;
        }
        if (name === 'max_price') {
            setMaxInput(value);
            setFilters(prev => ({ ...prev, max_price: value }));
            setActiveCategoryLabel('');
            return;
        }
        setFilters(prev => ({ ...prev, [name]: value }));
        if (activeCategoryLabel) setActiveCategoryLabel('');
    };

    const handleReset = () => {
        const resetFilters = {
            brand: '',
            body_type: '',
            fuel_type: '',
            transmission: '',
            seats: '',
            min_price: '',
            max_price: '',
            year_from: '',
            year_to: '',
        };
        setFilters(resetFilters);
        setSort('price_asc');
        setActiveCategoryLabel('');
        setMinInput('');
        setMaxInput('');
        fetchCars(resetFilters, 'price_asc');
    };

    if (loading && cars.length === 0) return <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}><div className="loader"></div></div>;

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>{t('rent_page.title')} <span className={styles.highlight}>{t('rent_page.highlight')}</span></h1>
                
                <div className={styles.layout}>
                    <aside className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_brand')}</h3>
                            <select name="brand" value={filters.brand} onChange={handleFilterChange} className={styles.select}>
                                <option value="">{t('rent_page.all_brands')}</option>
                                {availableBrands.map(brand => (
                                    <option key={brand} value={brand}>{brand}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_body')}</h3>
                            <select name="body_type" value={filters.body_type} onChange={handleFilterChange} className={styles.select}>
                                <option value="">{t('rent_page.all_types')}</option>
                                <option value="Sedan">{t('car_specs.Sedan')}</option>
                                <option value="SUV">{t('car_specs.SUV')}</option>
                                <option value="Coupe">{t('car_specs.Coupe')}</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_fuel')}</h3>
                            <select name="fuel_type" value={filters.fuel_type} onChange={handleFilterChange} className={styles.select}>
                                <option value="">{t('rent_page.all_fuels')}</option>
                                <option value="Petrol">{t('car_specs.Petrol')}</option>
                                <option value="Electric">{t('car_specs.Electric')}</option>
                                <option value="Hybrid">{t('car_specs.Hybrid')}</option>
                                <option value="Diesel">{t('car_specs.Diesel')}</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_transmission')}</h3>
                            <select name="transmission" value={filters.transmission} onChange={handleFilterChange} className={styles.select}>
                                <option value="">{t('rent_page.any')}</option>
                                <option value="Automatic">{t('rent_page.automatic')}</option>
                                <option value="Manual">{t('rent_page.manual')}</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_seats')}</h3>
                            <select name="seats" value={filters.seats} onChange={handleFilterChange} className={styles.select}>
                                <option value="">{t('rent_page.any')}</option>
                                <option value="2">2 {t('rent_page.seats_count')}</option>
                                <option value="4">4 {t('rent_page.seats_count')}</option>
                                <option value="5">5 {t('rent_page.seats_count')}</option>
                                <option value="7">7 {t('rent_page.seats_count')}</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_price')}</h3>
                            <div className={styles.rangeInputs}>
                                <input 
                                    type="number" 
                                    name="min_price" 
                                    placeholder={t('rent_page.min')} 
                                    value={minInput} 
                                    onChange={handleFilterChange}
                                    className={styles.input}
                                />
                                <input 
                                    type="number" 
                                    name="max_price" 
                                    placeholder={t('rent_page.max')} 
                                    value={maxInput} 
                                    onChange={handleFilterChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_year')}</h3>
                            <div className={styles.rangeInputs}>
                                <input 
                                    type="number" 
                                    name="year_from" 
                                    placeholder={t('rent_page.from')} 
                                    value={filters.year_from} 
                                    onChange={handleFilterChange}
                                    className={styles.input}
                                />
                                <input 
                                    type="number" 
                                    name="year_to" 
                                    placeholder={t('rent_page.to')} 
                                    value={filters.year_to} 
                                    onChange={handleFilterChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>{t('rent_page.filter_sort')}</h3>
                            <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.select}>
                                <option value="price_asc">{t('rent_page.sort_price_asc')}</option>
                                <option value="price_desc">{t('rent_page.sort_price_desc')}</option>
                                <option value="year_desc">{t('rent_page.sort_year_desc')}</option>
                            </select>
                        </div>

                        <button 
                            onClick={handleSearch}
                            disabled={loading}
                            className={styles.searchButton}
                        >
                            {loading ? <div className={styles.spinner} style={{ margin: '0 auto' }}></div> : t('rent.btn.search')}
                        </button>
                        
                        <button 
                            onClick={handleReset}
                            className={styles.resetLink}
                        >
                            {t('rent.btn.reset')}
                        </button>
                    </aside>

                    <main>
                        {activeCategoryLabel && (
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                                <p className="text-blue-800 dark:text-blue-300 font-medium">
                                    <span className="font-bold">Showing: </span> {activeCategoryLabel}
                                </p>
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    Clear Filter
                                </Button>
                            </div>
                        )}
                        <div className={styles.grid}>
                            {filteredCars.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(car => (
                                <CarCard 
                                    key={car.id} 
                                    car={car} 
                                    onRent={(car) => setSelectedCar(car)}
                                />
                            ))}
                        </div>
                        
                        {filteredCars.length > pageSize && (
                            <div className={styles.pagination}>
                                <button 
                                    className={styles.pageButton} 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    ←
                                </button>
                                
                                {Array.from({ length: Math.ceil(filteredCars.length / pageSize) }).map((_, i) => (
                                    <button 
                                        key={i}
                                        className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button 
                                    className={styles.pageButton} 
                                    disabled={currentPage === Math.ceil(filteredCars.length / pageSize)}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    →
                                </button>
                            </div>
                        )}
                        
                        {filteredCars.length === 0 && (
                            <div className={styles.noResults}>
                                <p>{t('rent_page.no_results')}</p>
                                <Button variant="ghost" onClick={handleReset}>
                                    {t('rent_page.clear_filters')}
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {selectedCar && (
                <RentalCalculator 
                    car={selectedCar} 
                    onClose={() => setSelectedCar(null)} 
                />
            )}
        </div>
    );
}
