import pandas as pd
import random

# Use backend/ prefix assuming we run from root
csv_path = 'backend/car_data.csv'

try:
    df = pd.read_csv(csv_path)
except FileNotFoundError:
    # Fallback for local run inside backend folder
    csv_path = 'car_data.csv'
    df = pd.read_csv(csv_path)

# Define categories
standard_makes = [
    'Toyota', 'Hyundai', 'Kia', 'Volkswagen', 
    'Skoda', 'Nissan', 'Honda', 'Mazda', 'Chevrolet'
]

comfort_makes = ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Volvo', 'Tesla']
comfort_models = [
    '3 Series', '5 Series', 'X3', 'X5',
    'C-Class', 'E-Class', 'GLC', 'GLE',
    'A4', 'A6', 'Q5', 'Q7',
    'ES', 'NX', 'RX', 'S90', 'XC60',
    'Model 3', 'Model Y', 'Model S'
]

premium_makes = [
    'Porsche', 'Bentley', 'Rolls-Royce', 
    'Ferrari', 'Lamborghini'
]
premium_models_bmw = ['7 Series', 'X7', 'M5', 'M3']
premium_models_merc = ['S-Class', 'GLS', 'AMG GT']
premium_models_audi = ['A8', 'Q8']
premium_models_lexus = ['LS', 'LX']
premium_models_rr = ['Vogue', 'Sport', 'Defender']

def get_category(row):
    make = str(row['make'])
    model = str(row['model'])
    
    # Premium/Luxury
    if make in premium_makes:
        return 'premium'
    if make == 'BMW' and model in premium_models_bmw:
        return 'premium'
    if make == 'Mercedes' and model in premium_models_merc:
        return 'premium'
    if make == 'Audi' and model in premium_models_audi:
        return 'premium'
    if make == 'Lexus' and model in premium_models_lexus:
        return 'premium'
    if make == 'Range Rover' and model in premium_models_rr:
        return 'premium'
    
    # Comfort
    if make in comfort_makes and model in comfort_models:
        return 'comfort'
    if make in comfort_makes:
        return 'comfort'
    
    # Standard
    if make in standard_makes:
        return 'standard'
    
    return 'standard'

def fix_price(row):
    category = get_category(row)
    make = str(row['make'])
    model = str(row['model'])
    year = int(row['year'])
    
    # Year factor: newer = more expensive
    year_factor = 1.0 + (year - 2018) * 0.02
    
    if category == 'standard':
        # 10,000 - 15,000 KZT/day
        base = random.uniform(10000, 15000)
        price = round(base * year_factor, -2)  # round to 100
        price = max(10000, min(15000, price))
        
    elif category == 'comfort':
        # 15,000 - 25,000 KZT/day
        base = random.uniform(15000, 25000)
        price = round(base * year_factor, -2)
        price = max(15000, min(25000, price))
        
    else:  # premium
        # 30,000 - 150,000 KZT/day
        # More variation within premium
        if make in ['Ferrari', 'Rolls-Royce', 'Bentley']:
            base = random.uniform(100000, 150000)
        elif make == 'Lamborghini':
            base = random.uniform(80000, 130000)
        elif make in ['Porsche']:
            base = random.uniform(60000, 100000)
        elif make == 'Range Rover' and model == 'Vogue':
            base = random.uniform(70000, 110000)
        elif make == 'Range Rover':
            base = random.uniform(50000, 90000)
        elif make == 'BMW' and model == '7 Series':
            base = random.uniform(50000, 80000)
        elif make == 'Mercedes' and model == 'S-Class':
            base = random.uniform(55000, 85000)
        else:
            base = random.uniform(30000, 60000)
        
        price = round(base * year_factor, -2)
        price = max(30000, min(150000, price))
    
    return price

# Apply fixes
random.seed(42)
df['rent_price_day'] = df.apply(fix_price, axis=1)
df['leasing_price'] = df['rent_price_day'] * 15

# Verify results
print("=== PRICE CHECK ===")
for cat_name, makes in [
    ('STANDARD', standard_makes),
    ('COMFORT', comfort_makes),
    ('PREMIUM', premium_makes + ['Range Rover', 'BMW', 'Mercedes'])
]:
    subset = df[df['make'].isin(makes)]
    if not subset.empty:
        print(f"\n{cat_name}:")
        print(f"  Min: {subset['rent_price_day'].min():,.0f} ₸")
        print(f"  Max: {subset['rent_price_day'].max():,.0f} ₸")
        print(f"  Avg: {subset['rent_price_day'].mean():,.0f} ₸")

# Save updated CSV
df.to_csv(csv_path, index=False)
print(f"\n✅ {csv_path} updated successfully!")
print(f"Total rows: {len(df)}")
