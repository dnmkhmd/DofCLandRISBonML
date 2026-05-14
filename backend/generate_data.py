import pandas as pd
import numpy as np
import random

# Constants
MAKES = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'Audi']
MODELS = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', '7 Series'],
    'Mercedes': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Focus'],
    'Chevrolet': ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Impala'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Murano', 'Maxima'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona'],
    'Kia': ['Optima', 'Sorento', 'Soul', 'Sportage', 'Forte'],
    'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7']
}
FUEL_TYPES = ['Gasoline', 'Hybrid', 'Electric', 'Diesel']
TRANSMISSION_TYPES = ['Automatic', 'Manual']

def generate_car_data(num_samples=1000):
    data = []
    
    for _ in range(num_samples):
        make = random.choice(MAKES)
        model = random.choice(MODELS[make])
        year = random.randint(2015, 2024)
        mileage = random.randint(0, 150000)
        
        # Logic for price generation (synthetic ground truth)
        base_price = 20000
        if make in ['BMW', 'Mercedes', 'Audi']:
            base_price += 15000
        
        age = 2025 - year
        price_depreciation = age * 1500
        mileage_depreciation = mileage * 0.05
        
        price = base_price - price_depreciation - mileage_depreciation
        
        # Add some randomness
        price += random.randint(-2000, 2000)
        
        # Ensure minimum price
        if price < 5000:
            price = 5000
            
        fuel_type = random.choice(FUEL_TYPES)
        transmission = random.choice(TRANSMISSION_TYPES)
        engine_size = round(random.uniform(1.5, 5.0), 1)
        
        data.append({
            'make': make,
            'model': model,
            'year': year,
            'mileage': mileage,
            'fuel_type': fuel_type,
            'transmission': transmission,
            'engine_size': engine_size,
            'rent_price_day': int(price * 0.001) + random.randint(500, 1500), # Synthetic rental price
            'leasing_price': int(price * 0.02) + random.randint(5000, 10000) # Synthetic leasing price
        })
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = generate_car_data()
    df.to_csv('car_data.csv', index=False)
    print("Data generated and saved to car_data.csv")
