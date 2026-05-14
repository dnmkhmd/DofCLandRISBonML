import sqlite3
import csv
import os

def seed_db():
    db_path = 'backend/sql_app.db'
    csv_path = 'backend/car_data.csv'
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Clear existing data
    cursor.execute("DELETE FROM car_images")
    cursor.execute("DELETE FROM cars")
    
    try:
        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                if count >= 20: # Seed 20 cars for demo
                    break
                
                # Insert car
                cursor.execute("""
                    INSERT INTO cars (make, model, year, mileage, price, fuel_type, transmission, engine_size, description, is_available)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    row['make'], 
                    row['model'], 
                    int(row['year']), 
                    int(row['mileage']), 
                    float(row['price']), 
                    row['fuel_type'], 
                    row['transmission'], 
                    float(row['engine_size']),
                    f"A premium {row['year']} {row['make']} {row['model']} in excellent condition.",
                    1
                ))
                
                car_id = cursor.lastrowid
                
                # Insert 3 placeholder images for each car to demonstrate multi-photo feature
                images = [
                    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
                ]
                
                for url in images:
                    cursor.execute("INSERT INTO car_images (car_id, url) VALUES (?, ?)", (car_id, url))
                
                count += 1
            
        conn.commit()
        print(f"Successfully seeded {count} cars with 3 images each.")
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_db()
