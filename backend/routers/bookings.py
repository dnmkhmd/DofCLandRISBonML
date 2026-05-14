from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import math
import models, schemas, database, auth
from services import logger as logger_service

router = APIRouter(tags=["Bookings & Calculations"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CALCULATORS
@router.post("/calculate/rent", response_model=schemas.RentCalculateResponse)
def calculate_rent(request: schemas.RentCalculateRequest, db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == request.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    def parse_date(date_str: str):
        try:
            if len(date_str) == 10:
                return datetime.fromisoformat(date_str)
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {date_str}")

    start = parse_date(request.start_date)
    end = parse_date(request.end_date)
    if end <= start:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    days = (end - start).days + 1
    months = days // 30
    remaining_days = days % 30
    
    base_cost_months = months * car.rent_price_month
    base_cost_days = remaining_days * car.rent_price_day
    
    insurance_cost = days * 15.0 if request.insurance else 0
    gps_cost = days * 5.0 if request.gps else 0
    child_seat_cost = days * 3.0 if request.child_seat else 0
    
    total = base_cost_months + base_cost_days + insurance_cost + gps_cost + child_seat_cost
    
    return schemas.RentCalculateResponse(
        days=remaining_days, months=months,
        base_cost_days=base_cost_days, base_cost_months=base_cost_months,
        insurance_cost=insurance_cost, gps_cost=gps_cost, child_seat_cost=child_seat_cost,
        total_cost=total
    )

@router.post("/calculate/leasing", response_model=schemas.LeasingCalculateResponse)
def calculate_leasing(request: schemas.LeasingCalculateRequest):
    p = request.car_price - request.down_payment
    r = (request.interest_rate / 100.0) / 12.0
    n = request.term_months
    
    if r > 0:
        monthly = p * (r * math.pow(1 + r, n)) / (math.pow(1 + r, n) - 1)
    else:
        monthly = p / n

    total_cost = (monthly * n) + request.down_payment
    total_overpayment = total_cost - request.car_price
    
    return schemas.LeasingCalculateResponse(
        monthly_payment=round(monthly, 2),
        total_overpayment=round(total_overpayment, 2),
        total_cost=round(total_cost, 2)
    )

@router.get("/bookings/my", response_model=List[schemas.Booking])
def get_my_bookings(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return current_user.bookings

@router.post("/bookings", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_booking = models.Booking(**booking.model_dump(), user_id=current_user.id)
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    car = db.query(models.Car).filter(models.Car.id == booking.car_id).first()
    logger_service.log_action(db, action_type="booking", description=f"New booking by {current_user.full_name}", user_id=current_user.id, user_email=current_user.email, endpoint="/bookings", method="POST")
    return db_booking

@router.delete("/bookings/{booking_id}")
def cancel_booking(booking_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id, models.Booking.user_id == current_user.id).first()
    if not booking: raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "Active": raise HTTPException(status_code=400, detail="Only active bookings can be cancelled")
    booking.status = "Cancelled"
    db.commit()
    return {"status": "Cancelled"}

@router.get("/leasing/my", response_model=List[schemas.LeasingApplication])
def get_my_leasing(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return current_user.leasing_applications

@router.post("/leasing", response_model=schemas.LeasingApplication)
def create_leasing(application: schemas.LeasingApplicationCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db_app = models.LeasingApplication(**application.model_dump(), user_id=current_user.id)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    logger_service.log_action(db, action_type="leasing", description=f"Leasing application by {current_user.full_name}", user_id=current_user.id, user_email=current_user.email, endpoint="/leasing", method="POST")
    return db_app

@router.get("/favorites", response_model=List[schemas.Favorite])
def get_my_favorites(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return current_user.favorites

@router.post("/favorites/{car_id}", response_model=schemas.Favorite)
def add_favorite(car_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if not car: raise HTTPException(status_code=404, detail="Car not found")
    fav = db.query(models.Favorite).filter(models.Favorite.car_id == car_id, models.Favorite.user_id == current_user.id).first()
    if fav: return fav
    db_fav = models.Favorite(user_id=current_user.id, car_id=car_id)
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    logger_service.log_action(db, action_type="favorite", description=f"Favorited by {current_user.email}", user_id=current_user.id, user_email=current_user.email, endpoint=f"/favorites/{car_id}", method="POST")
    return db_fav

@router.delete("/favorites/{car_id}")
def remove_favorite(car_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    fav = db.query(models.Favorite).filter(models.Favorite.car_id == car_id, models.Favorite.user_id == current_user.id).first()
    if not fav: raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"status": "Removed"}

@router.get("/reviews", response_model=List[schemas.Review])
def read_reviews(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.Review).order_by(models.Review.date.desc()).offset(skip).limit(limit).all()

@router.post("/reviews", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    db_review = models.Review(**review.model_dump())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.post("/contact")
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    logger_service.log_action(db, action_type="contact", description=f"Contact form submitted by {contact.email}", endpoint="/contact", method="POST")
    return {"status": "Message received"}
