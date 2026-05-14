import pandas as pd
from backend.database import SessionLocal, engine
import backend.models as models

# Create tables if not exist
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists (more than just test data)
    if db.query(models.Car).count() > 5:
        print("Database already seeded.")
        db.close()
        return

    try:
        import os
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        CSV_PATH = os.path.join(BASE_DIR, 'car_data.csv')
        df = pd.read_csv(CSV_PATH)
        
        # Take a subset to be faster and not overwhelm (e.g. 50 cars)
        df_subset = df.head(50)
        
        for _, row in df_subset.iterrows():
            car = models.Car(
                make=row['make'],
                model=row['model'],
                year=int(row['year']),
                mileage=int(row['mileage']),
                price=float(row['price']),
                fuel_type=row['fuel_type'],
                transmission=row['transmission'],
                engine_size=float(row['engine_size']),
                description=f"A reliable {row['year']} {row['make']} {row['model']}.",
                is_available=True
            )
            db.add(car)
            db.flush() # To get the ID
            
            # Add a placeholder image
            img = models.CarImage(
                car_id=car.id,
                url='https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'
            )
            db.add(img)
        
        db.commit()
        print("Database seeded successfully with 50 cars.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
