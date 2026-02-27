from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Car Schemas
class CarBase(BaseModel):
    make: str
    model: str
    year: int
    mileage: int
    price: float
    fuel_type: str
    transmission: str
    engine_size: float
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True

class CarCreate(CarBase):
    pass

class Car(CarBase):
    id: int

    class Config:
        orm_mode = True

# ML Prediction Schemas
class CarFeatures(BaseModel):
    make: str
    model: str
    year: int
    mileage: int
    fuel_type: str
    transmission: str
    engine_size: float = 2.5

class PricePrediction(BaseModel):
    predicted_price: float
    currency: str = "USD"
