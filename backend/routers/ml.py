import os
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database

router = APIRouter(tags=["Machine Learning"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load ML Artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_RENTAL_PATH = os.path.join(BASE_DIR, "models/price_prediction_model.pkl")
MODEL_LEASING_PATH = os.path.join(BASE_DIR, "models/price_prediction_model_leasing.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "models/encoders.pkl")

model_rental = None
model_leasing = None
encoders = None

if os.path.exists(MODEL_RENTAL_PATH) and os.path.exists(ENCODERS_PATH):
    model_rental = joblib.load(MODEL_RENTAL_PATH)
    encoders = joblib.load(ENCODERS_PATH)

if os.path.exists(MODEL_LEASING_PATH):
    model_leasing = joblib.load(MODEL_LEASING_PATH)

@router.post("/predict_price", response_model=schemas.PricePrediction)
def predict_price(car: schemas.CarFeatures, db: Session = Depends(get_db)):
    # Select the model based on prediction type
    active_model = model_rental if car.prediction_type == "rental" else model_leasing
    
    if not active_model or not encoders:
        raise HTTPException(status_code=503, detail="Requested ML Model not available")
    
    input_data = {
        'make': [car.make],
        'model': [car.model],
        'year': [car.year],
        'mileage': [car.mileage],
        'fuel_type': [car.fuel_type],
        'transmission': [car.transmission],
        'engine_size': [car.engine_size]
    }
    df = pd.DataFrame(input_data)
    
    try:
        normalized_data = car.model_dump()
        for col in ['make', 'model', 'fuel_type', 'transmission']:
            le = encoders.get(col)
            if le:
                # Find matching class case-insensitively
                val = str(normalized_data[col]).strip()
                matches = [c for c in le.classes_ if str(c).lower() == val.lower()]
                
                if not matches:
                     raise HTTPException(
                        status_code=400, 
                        detail=f"Unknown value for {col}: {val}. Supported values: {list(le.classes_)[:10]}..."
                    )
                
                # Update input data with exact class name as trained
                df[col] = matches[0]
                df[col] = le.transform(df[col])
    except HTTPException:
        raise
    except Exception as e:
         raise HTTPException(status_code=400, detail=str(e))
         
    df = df[['make', 'model', 'year', 'mileage', 'fuel_type', 'transmission', 'engine_size']]
    prediction = active_model.predict(df)
    predicted_val = round(prediction[0], 2)
    
    # Recommendation logic based on target type
    matching_cars = db.query(models.Car).filter(
        models.Car.brand == car.make,
        models.Car.is_available == True
    ).all()
    
    # Sort by the price type that matches the prediction
    if car.prediction_type == "rental":
        matching_cars.sort(key=lambda x: abs(x.rent_price_month - predicted_val))
    else:
        # For leasing, match against total leasing_price
        matching_cars.sort(key=lambda x: abs(x.leasing_price - predicted_val))
    
    return {
        "predicted_price": predicted_val, 
        "currency": "KZT",
        "recommended_cars": matching_cars[:10]
    }
