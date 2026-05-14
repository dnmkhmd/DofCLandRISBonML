// Specific images for each car model. 
// Format: 'Brand Model': '/images/cars/filename.jpg'
export const CAR_SPECIFIC_IMAGES: Record<string, string> = {
    'BMW 5 Series': '/images/cars/bmw_5_series.jpg',
    'Mercedes E-Class': '/images/cars/mercedes_e_class.jpg',
    'Audi A6': '/images/cars/audi_a6.jpg',
    'Tesla Model S': '/images/cars/tesla_model_s.jpg',
    'Porsche 911 Carrera': '/images/cars/porsche_911_carrera.jpg',
    'Hyundai Elantra': '/images/cars/hyundai_elantra.jpg',
    'Toyota Corolla': '/images/cars/toyota_corolla.jpg',
    'Range Rover Sport': '/images/cars/range_rover_sport.jpg',
    'Lamborghini Urus': '/images/cars/lamborghini_urus.jpg',
    'Ferrari F8 Tributo': '/images/cars/ferrari_f8_tributo.jpg',
    'Bentley Bentayga': '/images/cars/bentley_bentayga.jpg',
    'Toyota Yaris': '/images/cars/toyota_yaris.jpg',
};

export const getCarDisplayImage = (car: { brand: string, model: string, images?: { url: string }[] }) => {
    // 1. Check manual override first
    const key = `${car.brand} ${car.model}`;
    if (CAR_SPECIFIC_IMAGES[key]) {
        return CAR_SPECIFIC_IMAGES[key];
    }

    // 2. Check if car has its own images from database (which are now also local paths)
    if (car.images && car.images.length > 0) {
        return car.images[0].url;
    }

    return null;
};

export const getCarFallbackImage = (brand: string, model: string) => {
    const key = `${brand} ${model}`;
    return CAR_SPECIFIC_IMAGES[key] || null;
};
