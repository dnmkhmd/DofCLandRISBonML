from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user")
    leasing_applications = relationship("LeasingApplication", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, index=True)
    model = Column(String, index=True)
    year = Column(Integer)
    engine_volume = Column(Float)
    power = Column(Integer)
    fuel_type = Column(String)
    transmission = Column(String)
    drive = Column(String)
    seats = Column(Integer)
    body_type = Column(String)
    color = Column(String)
    rent_price_day = Column(Float)
    rent_price_month = Column(Float)
    leasing_price = Column(Float)
    is_available = Column(Boolean, default=True)
    images = relationship("CarImage", back_populates="car", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="car")
    leasing_applications = relationship("LeasingApplication", back_populates="car")
    favorites = relationship("Favorite", back_populates="car")

class CarImage(Base):
    __tablename__ = "car_images"
    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id"))
    url = Column(String)
    car = relationship("Car", back_populates="images")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional for now
    car_id = Column(Integer, ForeignKey("cars.id"))
    user_name = Column(String)
    phone = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    type = Column(String)  # rent or leasing
    total_price = Column(Float)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")

class LeasingApplication(Base):
    __tablename__ = "leasing_applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    down_payment = Column(Float)
    term_months = Column(Integer)
    monthly_payment = Column(Float)
    status = Column(String, default="Pending") # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="leasing_applications")
    car = relationship("Car", back_populates="leasing_applications")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    car = relationship("Car", back_populates="favorites")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String)
    rating = Column(Integer)
    text = Column(String)
    date = Column(DateTime, default=datetime.utcnow)
    avatar = Column(String, nullable=True)

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String)
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class RequestLog(Base):
    __tablename__ = "request_logs"
    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String, index=True)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    endpoint = Column(String)
    method = Column(String)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
