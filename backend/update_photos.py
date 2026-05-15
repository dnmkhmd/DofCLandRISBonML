from database import SessionLocal
from models import Car
import json

db = SessionLocal()

# Photo path mapping for every model
photo_paths = {

    # ─── STANDARD ───
    ("Toyota", "Camry"): [
        "/cars/standard/toyota-camry/exterior-1.jpg",
        "/cars/standard/toyota-camry/exterior-2.jpg",
        "/cars/standard/toyota-camry/interior.jpg"
    ],
    ("Toyota", "Corolla"): [
        "/cars/standard/toyota-corolla/exterior-1.jpg",
        "/cars/standard/toyota-corolla/exterior-2.jpg",
        "/cars/standard/toyota-corolla/interior.jpg"
    ],
    ("Toyota", "Yaris"): [
        "/cars/standard/toyota-yaris/exterior-1.jpg",
        "/cars/standard/toyota-yaris/exterior-2.jpg",
        "/cars/standard/toyota-yaris/interior.jpg"
    ],
    ("Hyundai", "Sonata"): [
        "/cars/standard/hyundai-sonata/exterior-1.jpg",
        "/cars/standard/hyundai-sonata/exterior-2.jpg",
        "/cars/standard/hyundai-sonata/interior.jpg"
    ],
    ("Hyundai", "Elantra"): [
        "/cars/standard/hyundai-elantra/exterior-1.jpg",
        "/cars/standard/hyundai-elantra/exterior-2.jpg",
        "/cars/standard/hyundai-elantra/interior.jpg"
    ],
    ("Hyundai", "Accent"): [
        "/cars/standard/hyundai-accent/exterior-1.jpg",
        "/cars/standard/hyundai-accent/exterior-2.jpg",
        "/cars/standard/hyundai-accent/interior.jpg"
    ],
    ("Kia", "K5"): [
        "/cars/standard/kia-k5/exterior-1.jpg",
        "/cars/standard/kia-k5/exterior-2.jpg",
        "/cars/standard/kia-k5/interior.jpg"
    ],
    ("Kia", "Cerato"): [
        "/cars/standard/kia-cerato/exterior-1.jpg",
        "/cars/standard/kia-cerato/exterior-2.jpg",
        "/cars/standard/kia-cerato/interior.jpg"
    ],
    ("Kia", "Rio"): [
        "/cars/standard/kia-rio/exterior-1.jpg",
        "/cars/standard/kia-rio/exterior-2.jpg",
        "/cars/standard/kia-rio/interior.jpg"
    ],
    ("Volkswagen", "Passat"): [
        "/cars/standard/volkswagen-passat/exterior-1.jpg",
        "/cars/standard/volkswagen-passat/exterior-2.jpg",
        "/cars/standard/volkswagen-passat/interior.jpg"
    ],
    ("Volkswagen", "Jetta"): [
        "/cars/standard/volkswagen-jetta/exterior-1.jpg",
        "/cars/standard/volkswagen-jetta/exterior-2.jpg",
        "/cars/standard/volkswagen-jetta/interior.jpg"
    ],
    ("Skoda", "Octavia"): [
        "/cars/standard/skoda-octavia/exterior-1.jpg",
        "/cars/standard/skoda-octavia/exterior-2.jpg",
        "/cars/standard/skoda-octavia/interior.jpg"
    ],
    ("Skoda", "Rapid"): [
        "/cars/standard/skoda-rapid/exterior-1.jpg",
        "/cars/standard/skoda-rapid/exterior-2.jpg",
        "/cars/standard/skoda-rapid/interior.jpg"
    ],
    ("Nissan", "Altima"): [
        "/cars/standard/nissan-altima/exterior-1.jpg",
        "/cars/standard/nissan-altima/exterior-2.jpg",
        "/cars/standard/nissan-altima/interior.jpg"
    ],
    ("Nissan", "Sentra"): [
        "/cars/standard/nissan-sentra/exterior-1.jpg",
        "/cars/standard/nissan-sentra/exterior-2.jpg",
        "/cars/standard/nissan-sentra/interior.jpg"
    ],
    ("Honda", "Accord"): [
        "/cars/standard/honda-accord/exterior-1.jpg",
        "/cars/standard/honda-accord/exterior-2.jpg",
        "/cars/standard/honda-accord/interior.jpg"
    ],
    ("Honda", "Civic"): [
        "/cars/standard/honda-civic/exterior-1.jpg",
        "/cars/standard/honda-civic/exterior-2.jpg",
        "/cars/standard/honda-civic/interior.jpg"
    ],
    ("Mazda", "Mazda6"): [
        "/cars/standard/mazda-mazda6/exterior-1.jpg",
        "/cars/standard/mazda-mazda6/exterior-2.jpg",
        "/cars/standard/mazda-mazda6/interior.jpg"
    ],
    ("Mazda", "Mazda3"): [
        "/cars/standard/mazda-mazda3/exterior-1.jpg",
        "/cars/standard/mazda-mazda3/exterior-2.jpg",
        "/cars/standard/mazda-mazda3/interior.jpg"
    ],
    ("Chevrolet", "Malibu"): [
        "/cars/standard/chevrolet-malibu/exterior-1.jpg",
        "/cars/standard/chevrolet-malibu/exterior-2.jpg",
        "/cars/standard/chevrolet-malibu/interior.jpg"
    ],

    # ─── COMFORT ───
    ("BMW", "3 Series"): [
        "/cars/comfort/bmw-3-series/exterior-1.jpg",
        "/cars/comfort/bmw-3-series/exterior-2.jpg",
        "/cars/comfort/bmw-3-series/interior.jpg"
    ],
    ("BMW", "5 Series"): [
        "/cars/comfort/bmw-5-series/exterior-1.jpg",
        "/cars/comfort/bmw-5-series/exterior-2.jpg",
        "/cars/comfort/bmw-5-series/interior.jpg"
    ],
    ("BMW", "X3"): [
        "/cars/comfort/bmw-x3/exterior-1.jpg",
        "/cars/comfort/bmw-x3/exterior-2.jpg",
        "/cars/comfort/bmw-x3/interior.jpg"
    ],
    ("BMW", "X5"): [
        "/cars/comfort/bmw-x5/exterior-1.jpg",
        "/cars/comfort/bmw-x5/exterior-2.jpg",
        "/cars/comfort/bmw-x5/interior.jpg"
    ],
    ("Mercedes", "C-Class"): [
        "/cars/comfort/mercedes-c-class/exterior-1.jpg",
        "/cars/comfort/mercedes-c-class/exterior-2.jpg",
        "/cars/comfort/mercedes-c-class/interior.jpg"
    ],
    ("Mercedes", "E-Class"): [
        "/cars/comfort/mercedes-e-class/exterior-1.jpg",
        "/cars/comfort/mercedes-e-class/exterior-2.jpg",
        "/cars/comfort/mercedes-e-class/interior.jpg"
    ],
    ("Mercedes", "GLC"): [
        "/cars/comfort/mercedes-glc/exterior-1.jpg",
        "/cars/comfort/mercedes-glc/exterior-2.jpg",
        "/cars/comfort/mercedes-glc/interior.jpg"
    ],
    ("Mercedes", "GLE"): [
        "/cars/comfort/mercedes-gle/exterior-1.jpg",
        "/cars/comfort/mercedes-gle/exterior-2.jpg",
        "/cars/comfort/mercedes-gle/interior.jpg"
    ],
    ("Audi", "A4"): [
        "/cars/comfort/audi-a4/exterior-1.jpg",
        "/cars/comfort/audi-a4/exterior-2.jpg",
        "/cars/comfort/audi-a4/interior.jpg"
    ],
    ("Audi", "A6"): [
        "/cars/comfort/audi-a6/exterior-1.jpg",
        "/cars/comfort/audi-a6/exterior-2.jpg",
        "/cars/comfort/audi-a6/interior.jpg"
    ],
    ("Audi", "Q5"): [
        "/cars/comfort/audi-q5/exterior-1.jpg",
        "/cars/comfort/audi-q5/exterior-2.jpg",
        "/cars/comfort/audi-q5/interior.jpg"
    ],
    ("Audi", "Q7"): [
        "/cars/comfort/audi-q7/exterior-1.jpg",
        "/cars/comfort/audi-q7/exterior-2.jpg",
        "/cars/comfort/audi-q7/interior.jpg"
    ],
    ("Lexus", "ES"): [
        "/cars/comfort/lexus-es/exterior-1.jpg",
        "/cars/comfort/lexus-es/exterior-2.jpg",
        "/cars/comfort/lexus-es/interior.jpg"
    ],
    ("Lexus", "NX"): [
        "/cars/comfort/lexus-nx/exterior-1.jpg",
        "/cars/comfort/lexus-nx/exterior-2.jpg",
        "/cars/comfort/lexus-nx/interior.jpg"
    ],
    ("Lexus", "RX"): [
        "/cars/comfort/lexus-rx/exterior-1.jpg",
        "/cars/comfort/lexus-rx/exterior-2.jpg",
        "/cars/comfort/lexus-rx/interior.jpg"
    ],
    ("Volvo", "S90"): [
        "/cars/comfort/volvo-s90/exterior-1.jpg",
        "/cars/comfort/volvo-s90/exterior-2.jpg",
        "/cars/comfort/volvo-s90/interior.jpg"
    ],
    ("Volvo", "XC60"): [
        "/cars/comfort/volvo-xc60/exterior-1.jpg",
        "/cars/comfort/volvo-xc60/exterior-2.jpg",
        "/cars/comfort/volvo-xc60/interior.jpg"
    ],
    ("Tesla", "Model 3"): [
        "/cars/comfort/tesla-model-3/exterior-1.jpg",
        "/cars/comfort/tesla-model-3/exterior-2.jpg",
        "/cars/comfort/tesla-model-3/interior.jpg"
    ],
    ("Tesla", "Model Y"): [
        "/cars/comfort/tesla-model-y/exterior-1.jpg",
        "/cars/comfort/tesla-model-y/exterior-2.jpg",
        "/cars/comfort/tesla-model-y/interior.jpg"
    ],
    ("Tesla", "Model S"): [
        "/cars/comfort/tesla-model-s/exterior-1.jpg",
        "/cars/comfort/tesla-model-s/exterior-2.jpg",
        "/cars/comfort/tesla-model-s/interior.jpg"
    ],

    # ─── PREMIUM ───
    ("BMW", "7 Series"): [
        "/cars/premium/bmw-7-series/exterior-1.jpg",
        "/cars/premium/bmw-7-series/exterior-2.jpg",
        "/cars/premium/bmw-7-series/interior.jpg"
    ],
    ("BMW", "X7"): [
        "/cars/premium/bmw-x7/exterior-1.jpg",
        "/cars/premium/bmw-x7/exterior-2.jpg",
        "/cars/premium/bmw-x7/interior.jpg"
    ],
    ("BMW", "M5"): [
        "/cars/premium/bmw-m5/exterior-1.jpg",
        "/cars/premium/bmw-m5/exterior-2.jpg",
        "/cars/premium/bmw-m5/interior.jpg"
    ],
    ("Mercedes", "S-Class"): [
        "/cars/premium/mercedes-s-class/exterior-1.jpg",
        "/cars/premium/mercedes-s-class/exterior-2.jpg",
        "/cars/premium/mercedes-s-class/interior.jpg"
    ],
    ("Mercedes", "GLS"): [
        "/cars/premium/mercedes-gls/exterior-1.jpg",
        "/cars/premium/mercedes-gls/exterior-2.jpg",
        "/cars/premium/mercedes-gls/interior.jpg"
    ],
    ("Mercedes", "AMG GT"): [
        "/cars/premium/mercedes-amg-gt/exterior-1.jpg",
        "/cars/premium/mercedes-amg-gt/exterior-2.jpg",
        "/cars/premium/mercedes-amg-gt/interior.jpg"
    ],
    ("Audi", "A8"): [
        "/cars/premium/audi-a8/exterior-1.jpg",
        "/cars/premium/audi-a8/exterior-2.jpg",
        "/cars/premium/audi-a8/interior.jpg"
    ],
    ("Audi", "Q8"): [
        "/cars/premium/audi-q8/exterior-1.jpg",
        "/cars/premium/audi-q8/exterior-2.jpg",
        "/cars/premium/audi-q8/interior.jpg"
    ],
    ("Lexus", "LS"): [
        "/cars/premium/lexus-ls/exterior-1.jpg",
        "/cars/premium/lexus-ls/exterior-2.jpg",
        "/cars/premium/lexus-ls/interior.jpg"
    ],
    ("Lexus", "LX"): [
        "/cars/premium/lexus-lx/exterior-1.jpg",
        "/cars/premium/lexus-lx/exterior-2.jpg",
        "/cars/premium/lexus-lx/interior.jpg"
    ],
    ("Porsche", "Panamera"): [
        "/cars/premium/porsche-panamera/exterior-1.jpg",
        "/cars/premium/porsche-panamera/exterior-2.jpg",
        "/cars/premium/porsche-panamera/interior.jpg"
    ],
    ("Porsche", "Cayenne"): [
        "/cars/premium/porsche-cayenne/exterior-1.jpg",
        "/cars/premium/porsche-cayenne/exterior-2.jpg",
        "/cars/premium/porsche-cayenne/interior.jpg"
    ],
    ("Porsche", "911"): [
        "/cars/premium/porsche-911/exterior-1.jpg",
        "/cars/premium/porsche-911/exterior-2.jpg",
        "/cars/premium/porsche-911/interior.jpg"
    ],
    ("Range Rover", "Vogue"): [
        "/cars/premium/range-rover-vogue/exterior-1.jpg",
        "/cars/premium/range-rover-vogue/exterior-2.jpg",
        "/cars/premium/range-rover-vogue/interior.jpg"
    ],
    ("Range Rover", "Sport"): [
        "/cars/premium/range-rover-sport/exterior-1.jpg",
        "/cars/premium/range-rover-sport/exterior-2.jpg",
        "/cars/premium/range-rover-sport/interior.jpg"
    ],
    ("Range Rover", "Defender"): [
        "/cars/premium/range-rover-defender/exterior-1.jpg",
        "/cars/premium/range-rover-defender/exterior-2.jpg",
        "/cars/premium/range-rover-defender/interior.jpg"
    ],
    ("Bentley", "Continental"): [
        "/cars/premium/bentley-continental/exterior-1.jpg",
        "/cars/premium/bentley-continental/exterior-2.jpg",
        "/cars/premium/bentley-continental/interior.jpg"
    ],
    ("Rolls-Royce", "Ghost"): [
        "/cars/premium/rolls-royce-ghost/exterior-1.jpg",
        "/cars/premium/rolls-royce-ghost/exterior-2.jpg",
        "/cars/premium/rolls-royce-ghost/interior.jpg"
    ],
    ("Ferrari", "Roma"): [
        "/cars/premium/ferrari-roma/exterior-1.jpg",
        "/cars/premium/ferrari-roma/exterior-2.jpg",
        "/cars/premium/ferrari-roma/interior.jpg"
    ],
    ("Lamborghini", "Urus"): [
        "/cars/premium/lamborghini-urus/exterior-1.jpg",
        "/cars/premium/lamborghini-urus/exterior-2.jpg",
        "/cars/premium/lamborghini-urus/interior.jpg"
    ],
}

# Update all cars in DB
updated = 0
not_found = []

all_cars = db.query(Car).all()
for car in all_cars:
    key = (car.brand, car.model)
    if key in photo_paths:
        car.photos = json.dumps(photo_paths[key])
        updated += 1
    else:
        not_found.append(f"{car.brand} {car.model}")

db.commit()
db.close()

print(f"✅ Updated {updated} cars with photo paths")

if not_found:
    unique_not_found = list(set(not_found))
    print(f"⚠️  No photo path defined for:")
    for item in unique_not_found:
        print(f"   - {item}")
