from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    bookings = relationship("Booking", back_populates="user")


class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    make = Column(String, index=True)
    model = Column(String, index=True)
    year = Column(Integer)
    mileage = Column(Integer)
    price = Column(Float)  # Daily rental price or monthly lease price
    fuel_type = Column(String)
    transmission = Column(String)
    engine_size = Column(Float)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    is_available = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="car")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="pending")  # pending, confirmed, active, completed, cancelled

    user = relationship("User", back_populates="bookings")
    car = relationship("Car", back_populates="bookings")
