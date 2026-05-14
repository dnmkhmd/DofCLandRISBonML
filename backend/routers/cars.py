from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas, database
from services import logger as logger_service

router = APIRouter(tags=["Cars"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import func

@router.get("/cars", response_model=List[schemas.Car])
def read_cars(
    brand: Optional[str] = None,
    model: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    body_type: Optional[str] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    seats: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Car)
    
    if brand:
        query = query.filter(func.lower(models.Car.brand) == brand.lower())
    
    if model:
        query = query.filter(func.lower(models.Car.model) == model.lower())
    
    if year_from: query = query.filter(models.Car.year >= year_from)
    if year_to: query = query.filter(models.Car.year <= year_to)
    if min_price: query = query.filter(models.Car.rent_price_day >= min_price)
    if max_price: query = query.filter(models.Car.rent_price_day <= max_price)
    if body_type: query = query.filter(models.Car.body_type.ilike(f"%{body_type}%"))
    if fuel_type: query = query.filter(models.Car.fuel_type.ilike(f"%{fuel_type}%"))
    if transmission: query = query.filter(models.Car.transmission.ilike(f"%{transmission}%"))
    if seats: query = query.filter(models.Car.seats == seats)
    
    return query.offset(skip).limit(limit).all()

@router.get("/cars/{car_id}", response_model=schemas.Car)
def read_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    logger_service.log_action(
        db, 
        action_type="view",
        description=f"Car viewed: {car.brand} {car.model}",
        endpoint=f"/cars/{car_id}",
        method="GET"
    )
    return car

@router.post("/cars", response_model=schemas.Car)
def create_car(car: schemas.CarCreate, db: Session = Depends(get_db)):
    car_data = car.model_dump()
    images_data = car_data.pop("images", [])
    db_car = models.Car(**car_data)
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    for img in images_data:
        db_img = models.CarImage(car_id=db_car.id, **img)
        db.add(db_img)
    db.commit()
    db.refresh(db_car)
    return db_car
