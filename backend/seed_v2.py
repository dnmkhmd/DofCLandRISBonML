import database
import models
from datetime import datetime

models.Base.metadata.create_all(bind=database.engine)
db = database.SessionLocal()

# Clear existing data
db.query(models.CarImage).delete()
db.query(models.Booking).delete()
db.query(models.Review).delete()
db.query(models.Contact).delete()
db.query(models.Car).delete()
db.commit()

# CARS
cars_data = [
    {
        "brand": "Toyota", "model": "Camry", "year": 2023, "engine_volume": 2.5,
        "power": 206, "fuel_type": "Petrol", "transmission": "Automatic",
        "drive": "FWD", "seats": 5, "body_type": "Sedan", "color": "Silver",
        "rent_price_day": 35000, "rent_price_month": 750000, "leasing_price": 18000000,
        "images": [
            "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        "brand": "Tesla", "model": "Model 3", "year": 2022, "engine_volume": 0.0,
        "power": 283, "fuel_type": "Electric", "transmission": "Automatic",
        "drive": "AWD", "seats": 5, "body_type": "Sedan", "color": "White",
        "rent_price_day": 55000, "rent_price_month": 1200000, "leasing_price": 28000000,
        "images": [
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1561580125-028ee3bd62eb?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1503376760368-7c7013ab64bf?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        "brand": "BMW", "model": "X5", "year": 2024, "engine_volume": 3.0,
        "power": 335, "fuel_type": "Petrol", "transmission": "Automatic",
        "drive": "AWD", "seats": 5, "body_type": "SUV", "color": "Black",
        "rent_price_day": 85000, "rent_price_month": 1800000, "leasing_price": 45000000,
        "images": [
            "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        "brand": "Mercedes", "model": "C-Class", "year": 2021, "engine_volume": 2.0,
        "power": 255, "fuel_type": "Petrol", "transmission": "Automatic",
        "drive": "RWD", "seats": 5, "body_type": "Sedan", "color": "Grey",
        "rent_price_day": 65000, "rent_price_month": 1400000, "leasing_price": 32000000,
        "images": [
            "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1618843475016-11fefa83d1c4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1583267746897-eaedb2024ce5?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        "brand": "Honda", "model": "CR-V", "year": 2023, "engine_volume": 1.5,
        "power": 190, "fuel_type": "Hybrid", "transmission": "Automatic",
        "drive": "AWD", "seats": 5, "body_type": "SUV", "color": "Blue",
        "rent_price_day": 40000, "rent_price_month": 850000, "leasing_price": 22000000,
        "images": [
            "https://images.unsplash.com/photo-1568844293986-8d0400ba4792?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1606132918881-eb9ab63efca1?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=80&w=800"
        ]
    }
]

for c_data in cars_data:
    imgs = c_data.pop("images")
    car = models.Car(**c_data)
    db.add(car)
    db.commit()
    db.refresh(car)
    
    for url in imgs:
        img = models.CarImage(car_id=car.id, url=url)
        db.add(img)
    db.commit()

# REVIEWS
reviews_data = [
    {"author_name": "John Doe", "rating": 5, "text": "Amazing service! The car was in perfect condition.", "avatar": "https://i.pravatar.cc/150?u=1"},
    {"author_name": "Jane Smith", "rating": 4, "text": "Very smooth leasing process, but wish there were more EV options.", "avatar": "https://i.pravatar.cc/150?u=2"},
    {"author_name": "Alice Johnson", "rating": 5, "text": "Best car rental in town! The prices are super reasonable.", "avatar": "https://i.pravatar.cc/150?u=3"},
    {"author_name": "Mark Wilson", "rating": 5, "text": "Rented a BMW for the weekend. Completely flawless experience.", "avatar": "https://i.pravatar.cc/150?u=4"},
    {"author_name": "Emily Davis", "rating": 5, "text": "Highly recommend AutoLease. Top-tier customer support.", "avatar": "https://i.pravatar.cc/150?u=5"},
]

for r_data in reviews_data:
    r = models.Review(**r_data)
    db.add(r)
db.commit()

print("Database seeded with sample data.")
db.close()
