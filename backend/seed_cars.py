import models
import database
from sqlalchemy.orm import Session
import random

def seed_cars():
    db = database.SessionLocal()
    
    # We will try to UPDATE existing records or CREATE if missing
    print("Starting seeding and update process...")

    # Variants config (Common years/colors)
    variants_info = [
        {"year": 2020, "color": "White"},
        {"year": 2021, "color": "Black"},
        {"year": 2021, "color": "Silver"},
        {"year": 2022, "color": "Blue"},
        {"year": 2023, "color": "Gray"},
        {"year": 2024, "color": "White"},
    ]

    # Model Configurations with Variant Specs
    # Each list under engines/trans/photos must have 6 items
    CARS_CONFIG = [
        # --- STANDARD ---
        {
            "category": "standard", "brand": "Toyota", "model": "Camry", "slug": "toyota-camry", "photo_prefix": "camry",
            "engines": [2.5, 2.0, 2.5, 3.5, 2.0, 2.5],
            "trans": ["Automatic", "Automatic", "Hybrid", "Automatic", "Automatic", "Hybrid"],
            "prices": [2200000, 2300000, 2400000, 2500000, 2600000, 2700000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "standard", "brand": "Hyundai", "model": "Sonata", "slug": "hyundai-sonata", "photo_prefix": "sonata",
            "engines": [2.0, 2.5, 2.0, 2.5, 3.0, 2.0],
            "trans": ["Automatic", "Automatic", "Automatic", "Automatic", "Manual", "Automatic"],
            "prices": [1900000, 2000000, 2100000, 2200000, 2300000, 2400000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "standard", "brand": "Kia", "model": "K5", "slug": "kia-k5", "photo_prefix": "k5",
            "engines": [1.6, 2.0, 1.6, 2.5, 2.0, 1.6],
            "trans": ["Automatic"] * 6,
            "prices": [1800000, 1900000, 2000000, 2100000, 2200000, 2300000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "standard", "brand": "Volkswagen", "model": "Passat", "slug": "volkswagen-passat", "photo_prefix": "passat",
            "engines": [1.4, 2.0, 1.4, 2.0, 1.4, 2.0],
            "trans": ["Automatic"] * 6,
            "prices": [2000000, 2100000, 2200000, 2300000, 2400000, 2500000],
            "body": "Sedan", "drive": "FWD", "fuel": "Diesel"
        },
        {
            "category": "standard", "brand": "Skoda", "model": "Octavia", "slug": "skoda-octavia", "photo_prefix": "octavia",
            "engines": [1.4, 1.5, 2.0, 1.4, 1.5, 2.0],
            "trans": ["Automatic"] * 6,
            "prices": [1800000, 1900000, 2000000, 2100000, 2200000, 2300000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },

        # --- COMFORT ---
        {
            "category": "comfort", "brand": "BMW", "model": "5 Series", "slug": "bmw-5-series", "photo_prefix": "bmw5",
            "engines": [2.0, 3.0, 2.0, 3.0, 2.0, 3.0],
            "trans": ["Automatic"] * 6,
            "prices": [5800000, 6000000, 6200000, 6500000, 6800000, 7200000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "comfort", "brand": "Mercedes", "model": "E-Class", "slug": "mercedes-e-class", "photo_prefix": "merc-e",
            "engines": [2.0, 3.0, 2.0, 3.0, 2.0, 3.0],
            "trans": ["Automatic"] * 6,
            "prices": [6000000, 6300000, 6500000, 6800000, 7200000, 7800000],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "comfort", "brand": "Audi", "model": "A6", "slug": "audi-a6", "photo_prefix": "audi-a6",
            "engines": [2.0, 3.0, 2.0, 3.0, 2.0, 3.0],
            "trans": ["Automatic"] * 6,
            "prices": [46055, 48095, 49035, 51075, 53015, 56055],
            "body": "Sedan", "drive": "FWD", "fuel": "Gasoline"
        },
        {
            "category": "comfort", "brand": "Lexus", "model": "ES", "slug": "lexus-es", "photo_prefix": "lexus-es",
            "engines": [2.5, 2.5, 3.5, 2.5, 2.5, 3.5],
            "trans": ["Automatic"] * 6,
            "prices": [50055, 52075, 53095, 55015, 57035, 60055],
            "body": "Sedan", "drive": "FWD", "fuel": "Hybrid"
        },
        {
            "category": "comfort", "brand": "Volvo", "model": "S90", "slug": "volvo-s90", "photo_prefix": "volvo-s90",
            "engines": [2.0] * 6,
            "trans": ["Automatic"] * 6,
            "prices": [44044, 46066, 47088, 49010, 51032, 54054],
            "body": "Sedan", "drive": "FWD", "fuel": "Hybrid"
        },

        # --- PREMIUM ---
        {
            "category": "premium", "brand": "BMW", "model": "7 Series", "slug": "bmw-7-series", "photo_prefix": "bmw7",
            "engines": [3.0, 4.4, 3.0, 4.4, 3.0, 4.4],
            "trans": ["Automatic"] * 6,
            "prices": [90099, 93019, 95039, 98059, 102079, 108099],
            "body": "Sedan", "drive": "AWD", "fuel": "Gasoline"
        },
        {
            "category": "premium", "brand": "Mercedes", "model": "S-Class", "slug": "mercedes-s-class", "photo_prefix": "merc-s",
            "engines": [3.0, 4.0, 3.0, 4.0, 3.0, 4.0],
            "trans": ["Automatic"] * 6,
            "prices": [95010, 98020, 100030, 105040, 110050, 115060],
            "body": "Sedan", "drive": "AWD", "fuel": "Gasoline"
        },
        {
            "category": "premium", "brand": "Porsche", "model": "Panamera", "slug": "porsche-panamera", "photo_prefix": "porsche-pan",
            "engines": [3.0, 4.0, 2.9, 4.0, 3.0, 2.9],
            "trans": ["Automatic"] * 6,
            "prices": [110011, 115025, 118039, 122053, 128067, 135081],
            "body": "Sedan", "drive": "AWD", "fuel": "Gasoline"
        },
        {
            "category": "premium", "brand": "Range Rover", "model": "Vogue", "slug": "range-rover-vogue", "photo_prefix": "rr-vogue",
            "engines": [3.0, 4.4, 3.0, 4.4, 3.0, 4.4],
            "trans": ["Automatic"] * 6,
            "prices": [100055, 105065, 108075, 112085, 118095, 125005],
            "body": "SUV", "drive": "AWD", "fuel": "Gasoline"
        },
        {
            "category": "premium", "brand": "Lexus", "model": "LS", "slug": "lexus-ls", "photo_prefix": "lexus-ls",
            "engines": [3.5, 5.0, 3.5, 5.0, 3.5, 5.0],
            "trans": ["Automatic"] * 6,
            "prices": [88080, 91090, 93010, 96020, 100030, 105040],
            "body": "Sedan", "drive": "AWD", "fuel": "Hybrid"
        },
    ]

    updated_count = 0
    created_count = 0

    for config in CARS_CONFIG:
        for i, variant in enumerate(variants_info):
            brand = config["brand"]
            model = config["model"]
            year = variant["year"]
            color = variant["color"]
            
            # Find existing car
            existing_car = db.query(models.Car).filter(
                models.Car.brand == brand,
                models.Car.model == model,
                models.Car.year == year,
                models.Car.color == color
            ).first()

            engine = config["engines"][i]
            trans = config["trans"][i]
            rent_day = config["prices"][i]
            
            # Power estimation update
            power = 250 if engine >= 2.0 else 150
            if engine >= 3.0: power = 400
            if engine >= 4.0: power = 550

            photo_urls = [
                f"/cars/{config['category']}/{config['slug']}/{config['photo_prefix']}-{i+1}-exterior-1.jpg",
                f"/cars/{config['category']}/{config['slug']}/{config['photo_prefix']}-{i+1}-exterior-2.jpg",
                f"/cars/{config['category']}/{config['slug']}/{config['photo_prefix']}-{i+1}-interior.jpg"
            ]

            if existing_car:
                # Update existing record
                existing_car.engine_volume = engine
                existing_car.transmission = trans
                existing_car.power = power
                existing_car.rent_price_day = float(rent_day)
                existing_car.rent_price_month = float(rent_day * 25)
                existing_car.leasing_price = float(rent_day * 15)
                
                # Update images: clear existing and add new unique ones
                db.query(models.CarImage).filter(models.CarImage.car_id == existing_car.id).delete()
                for url in photo_urls:
                    img = models.CarImage(car_id=existing_car.id, url=url)
                    db.add(img)
                
                updated_count += 1
                status = "Updated"
            else:
                # Create new record
                new_car = models.Car(
                    brand=brand, model=model, year=year, color=color,
                    engine_volume=engine, transmission=trans, power=power,
                    fuel_type=config["fuel"], drive=config["drive"], 
                    seats=5, body_type=config["body"],
                    rent_price_day=float(rent_day),
                    rent_price_month=float(rent_day * 25),
                    leasing_price=float(rent_day * 15),
                    is_available=True
                )
                db.add(new_car)
                db.commit()
                db.refresh(new_car)
                
                for url in photo_urls:
                    img = models.CarImage(car_id=new_car.id, url=url)
                    db.add(img)
                created_count += 1
                status = "Created"

            db.commit()
            print(f"[{status}] {brand} {model} ({year}, {color}) | {engine}L | {trans} | 3 photos assigned")

def generate_cars():
    db = database.SessionLocal()
    print("Starting massive data generation (900+ cars)...")

    # Standard cars (rent 150-250 AED/day)
    standard = [
        ("Toyota", "Camry", 2.5, "Gasoline", "Sedan"),
        ("Toyota", "Corolla", 1.8, "Gasoline", "Sedan"),
        ("Toyota", "Yaris", 1.5, "Gasoline", "Hatchback"),
        ("Hyundai", "Sonata", 2.0, "Gasoline", "Sedan"),
        ("Hyundai", "Elantra", 1.6, "Gasoline", "Sedan"),
        ("Hyundai", "Accent", 1.4, "Gasoline", "Sedan"),
        ("Kia", "K5", 2.0, "Gasoline", "Sedan"),
        ("Kia", "Cerato", 1.6, "Gasoline", "Sedan"),
        ("Kia", "Rio", 1.4, "Gasoline", "Sedan"),
        ("Volkswagen", "Passat", 2.0, "Diesel", "Sedan"),
        ("Volkswagen", "Jetta", 1.4, "Gasoline", "Sedan"),
        ("Skoda", "Octavia", 1.5, "Gasoline", "Sedan"),
        ("Skoda", "Rapid", 1.4, "Gasoline", "Sedan"),
        ("Nissan", "Altima", 2.5, "Gasoline", "Sedan"),
        ("Nissan", "Sentra", 1.8, "Gasoline", "Sedan"),
        ("Honda", "Accord", 2.0, "Gasoline", "Sedan"),
        ("Honda", "Civic", 1.5, "Gasoline", "Sedan"),
        ("Mazda", "Mazda6", 2.0, "Gasoline", "Sedan"),
        ("Mazda", "Mazda3", 1.5, "Gasoline", "Sedan"),
        ("Chevrolet", "Malibu", 1.5, "Gasoline", "Sedan"),
    ]
    
    # Comfort cars (rent 400-700 AED/day)
    comfort = [
        ("BMW", "5 Series", 2.0, "Gasoline", "Sedan"),
        ("BMW", "3 Series", 2.0, "Gasoline", "Sedan"),
        ("BMW", "X3", 2.0, "Gasoline", "SUV"),
        ("BMW", "X5", 3.0, "Gasoline", "SUV"),
        ("Mercedes", "E-Class", 2.0, "Gasoline", "Sedan"),
        ("Mercedes", "C-Class", 1.5, "Gasoline", "Sedan"),
        ("Mercedes", "GLC", 2.0, "Gasoline", "SUV"),
        ("Mercedes", "GLE", 3.0, "Gasoline", "SUV"),
        ("Audi", "A6", 2.0, "Gasoline", "Sedan"),
        ("Audi", "A4", 2.0, "Gasoline", "Sedan"),
        ("Audi", "Q5", 2.0, "Gasoline", "SUV"),
        ("Audi", "Q7", 3.0, "Gasoline", "SUV"),
        ("Lexus", "ES", 2.5, "Hybrid", "Sedan"),
        ("Lexus", "NX", 2.5, "Hybrid", "SUV"),
        ("Lexus", "RX", 3.5, "Hybrid", "SUV"),
        ("Volvo", "S90", 2.0, "Hybrid", "Sedan"),
        ("Volvo", "XC60", 2.0, "Hybrid", "SUV"),
        ("Tesla", "Model 3", 0.0, "Electric", "Sedan"),
        ("Tesla", "Model Y", 0.0, "Electric", "SUV"),
        ("Tesla", "Model S", 0.0, "Electric", "Sedan"),
    ]
    
    # Premium cars (rent 800-1500 AED/day)
    premium = [
        ("BMW", "7 Series", 3.0, "Gasoline", "Sedan"),
        ("BMW", "X7", 3.0, "Gasoline", "SUV"),
        ("BMW", "M5", 4.4, "Gasoline", "Sedan"),
        ("Mercedes", "S-Class", 3.0, "Gasoline", "Sedan"),
        ("Mercedes", "GLS", 3.0, "Gasoline", "SUV"),
        ("Mercedes", "AMG GT", 4.0, "Gasoline", "Coupe"),
        ("Audi", "A8", 3.0, "Gasoline", "Sedan"),
        ("Audi", "Q8", 3.0, "Gasoline", "SUV"),
        ("Lexus", "LS", 3.5, "Hybrid", "Sedan"),
        ("Lexus", "LX", 5.7, "Gasoline", "SUV"),
        ("Porsche", "Panamera", 3.0, "Gasoline", "Sedan"),
        ("Porsche", "Cayenne", 3.0, "Gasoline", "SUV"),
        ("Porsche", "911", 3.0, "Gasoline", "Coupe"),
        ("Range Rover", "Vogue", 4.4, "Gasoline", "SUV"),
        ("Range Rover", "Sport", 3.0, "Gasoline", "SUV"),
        ("Range Rover", "Defender", 3.0, "Gasoline", "SUV"),
        ("Bentley", "Continental", 6.0, "Gasoline", "Coupe"),
        ("Rolls-Royce", "Ghost", 6.75, "Gasoline", "Sedan"),
        ("Ferrari", "Roma", 3.9, "Gasoline", "Coupe"),
        ("Lamborghini", "Urus", 4.0, "Gasoline", "SUV"),
    ]

    colors = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown', 'Gold', 'Orange']
    years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
    
    total_added = 0

    def add_variants(car_list, price_range):
        nonlocal total_added
        for brand, model, engine, fuel, body in car_list:
            base_price = random.uniform(price_range[0], price_range[1])
            for _ in range(15):
                year = random.choice(years)
                color = random.choice(colors)
                # Formula with logical correlation for ML accuracy
                # Price depends on base + year seniority + engine size
                price_day = round(base_price + (year - 2018) * 12 + engine * 35 + random.uniform(-15, 15))
                if fuel == "Electric": price_day += 50
                
                engine_v = round(engine + random.uniform(-0.1, 0.1), 1)
                trans = random.choice(['Automatic', 'Manual'])
                power = int(120 + engine * 40 + (year - 2018) * 5 + random.uniform(-10, 10))
                if fuel == "Electric": power = 350 + (year - 2018) * 10
                
                # Check for existing to avoid duplicates
                exists = db.query(models.Car).filter_by(
                    brand=brand, model=model, year=year, 
                    color=color, engine_volume=engine_v
                ).first()
                if exists: continue

                new_car = models.Car(
                    brand=brand, model=model, year=year,
                    engine_volume=engine_v, power=power,
                    fuel_type=fuel, transmission=trans,
                    drive='AWD' if price_range[0] >= 400 else 'FWD',
                    seats=5, body_type=body, color=color,
                    rent_price_day=float(price_day),
                    rent_price_month=float(price_day * 25),
                    leasing_price=float(price_day * 15 + (year - 2018) * 30),
                    is_available=True
                )
                db.add(new_car)
                db.flush()

                # Add placeholder image
                img = models.CarImage(car_id=new_car.id, url=f"/placeholder-car.jpg")
                db.add(img)
                total_added += 1

    add_variants(standard, (18000, 35000))
    add_variants(comfort, (55000, 95000))
    add_variants(premium, (110000, 200000))

    db.commit()
    print(f"Successfully added {total_added} new variants.")
    db.close()

def export_to_csv():
    import pandas as pd
    db = database.SessionLocal()
    print("Exporting database to car_data.csv for training...")
    
    cars = db.query(models.Car).all()
    data = []
    for c in cars:
        data.append({
            'make': c.brand,
            'model': c.model,
            'year': c.year,
            'mileage': random.randint(0, 120000) if c.year < 2024 else random.randint(0, 5000), # Synthetic mileage
            'fuel_type': c.fuel_type,
            'transmission': c.transmission,
            'engine_size': c.engine_volume,
            'rent_price_day': c.rent_price_day,
            'leasing_price': c.leasing_price
        })
    
    df = pd.DataFrame(data)
    df.to_csv('car_data.csv', index=False)
    print(f"Exported {len(df)} records to car_data.csv")
    db.close()

def update_prices_from_csv():
    import pandas as pd
    db = database.SessionLocal()
    print("Updating prices from backend/car_data.csv...")
    
    csv_path = 'backend/car_data.csv'
    try:
        df = pd.read_csv(csv_path)
    except FileNotFoundError:
        csv_path = 'car_data.csv'
        df = pd.read_csv(csv_path)

    updated_ids = set()
    total_updated = 0
    total_rows = len(df)

    for index, row in df.iterrows():
        # Match by brand, model, year, and engine size
        # Since DB doesn't have mileage, we use these features
        # engine_size in CSV maps to engine_volume in DB
        brand = row['make']
        model = row['model']
        year = int(row['year'])
        engine_v = float(row['engine_size'])
        fuel = row['fuel_type']
        trans = row['transmission']
        
        # New prices
        new_rent_price_day = float(row['rent_price_day'])
        new_leasing_price = float(row['leasing_price'])

        # Find a car in DB that hasn't been updated yet
        car = db.query(models.Car).filter(
            models.Car.brand == brand,
            models.Car.model == model,
            models.Car.year == year,
            models.Car.engine_volume >= engine_v - 0.1,
            models.Car.engine_volume <= engine_v + 0.1,
            models.Car.fuel_type == fuel,
            models.Car.transmission == trans,
            models.Car.id.notin_(updated_ids)
        ).first()

        if car:
            car.rent_price_day = new_rent_price_day
            car.rent_price_month = new_rent_price_day * 25
            car.leasing_price = new_leasing_price
            updated_ids.add(car.id)
            total_updated += 1
            
            if total_updated % 500 == 0:
                print(f"Progress: {total_updated}/{total_rows} cars updated...")

    db.commit()
    print(f"Successfully updated {total_updated} cars in database from CSV.")
    db.close()

if __name__ == "__main__":
    # seed_cars()
    # generate_cars()
    # export_to_csv()
    update_prices_from_csv()
