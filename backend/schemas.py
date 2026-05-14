from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CarImageBase(BaseModel):
    url: str

class CarImage(CarImageBase):
    id: int
    class Config:
        from_attributes = True

class CarBase(BaseModel):
    brand: str
    model: str
    year: int
    engine_volume: float
    power: int
    fuel_type: str
    transmission: str
    drive: str
    seats: int
    body_type: str
    color: str
    rent_price_day: float
    rent_price_month: float
    leasing_price: float
    is_available: bool = True

class CarCreate(CarBase):
    images: List[CarImageBase] = []

class Car(CarBase):
    id: int
    images: List[CarImage] = []
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    author_name: str
    rating: int
    text: str
    avatar: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    date: datetime
    class Config:
        from_attributes = True

class ContactBase(BaseModel):
    name: str
    phone: str
    email: str
    message: str

class ContactCreate(ContactBase):
    pass

class Contact(ContactBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    user_name: Optional[str] = None
    phone: Optional[str] = None
    start_date: datetime
    end_date: datetime
    type: str # 'rent' or 'leasing'
    total_price: float

class BookingCreate(BookingBase):
    car_id: int

class Booking(BookingBase):
    id: int
    car_id: int
    user_id: Optional[int] = None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class RentCalculateRequest(BaseModel):
    car_id: int
    start_date: str
    end_date: str
    insurance: bool = False
    gps: bool = False
    child_seat: bool = False

class RentCalculateResponse(BaseModel):
    days: int
    months: int
    base_cost_days: float
    base_cost_months: float
    insurance_cost: float
    gps_cost: float
    child_seat_cost: float
    total_cost: float

class LeasingCalculateRequest(BaseModel):
    car_price: float
    down_payment: float
    term_months: int
    interest_rate: float

class LeasingCalculateResponse(BaseModel):
    monthly_payment: float
    total_overpayment: float
    total_cost: float

class CarFeatures(BaseModel):
    make: str
    model: str
    year: int
    mileage: int
    fuel_type: str
    transmission: str
    engine_size: float = 2.5
    prediction_type: str = "rental" # 'rental' or 'leasing'

class PricePrediction(BaseModel):
    predicted_price: float
    currency: str = "USD"
    recommended_cars: List[Car] = []

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str
    full_name: str
    phone: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    avatar: Optional[str] = None
    is_active: bool
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class LeasingApplicationBase(BaseModel):
    car_id: int
    down_payment: float
    term_months: int
    monthly_payment: float

class LeasingApplicationCreate(LeasingApplicationBase):
    pass

class LeasingApplication(LeasingApplicationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    car: Optional[Car] = None
    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    car_id: int

class FavoriteCreate(FavoriteBase):
    pass

class Favorite(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    car: Optional[Car] = None
    class Config:
        from_attributes = True

class RequestLogBase(BaseModel):
    action_type: str
    description: str
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: str
    method: str
    status_code: Optional[int] = None
    response_time_ms: Optional[int] = None

class RequestLogCreate(RequestLogBase):
    pass

class RequestLog(RequestLogBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AdminStats(BaseModel):
    total_cars: int
    active_rentals: int
    pending_leasing: int
    total_users: int
    requests_today: int
