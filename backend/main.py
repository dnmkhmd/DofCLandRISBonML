from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
load_dotenv()
import joblib
import pandas as pd
import math

import models
import schemas
import database
import auth
import time
from fastapi import Request
import schemas
from services import logger as logger_service
from sqlalchemy import func
from pydantic import BaseModel
import json
import hashlib


models.Base.metadata.create_all(bind=database.engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

from routers import cars, auth as auth_router, bookings, ml, admin

@app.get("/")
def read_root():
    return {"message": "Car Leasing ML API is running"}

@app.get("/model/metrics")
async def get_model_metrics():
    import json
    try:
        with open("model_metrics.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Metrics not found"}

# Update CORS to be compatible with credentials
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.20.10.2:3000",
    "http://172.20.10.3:3000",
    "http://172.20.10.4:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = int((time.time() - start_time) * 1000)
    
    if not request.url.path.startswith(("/admin/logs", "/static", "/favicon.ico")):
        db = database.SessionLocal()
        try:
            user_id = None
            user_email = "Guest"
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                parts = auth_header.split(" ")
                if len(parts) == 2:
                    token = parts[1]
                    try:
                        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
                        email = payload.get("sub")
                        if email:
                            user = db.query(models.User).filter(models.User.email == email).first()
                            if user:
                                user_id = user.id
                                user_email = user.email
                    except:
                        pass

            ip_address = request.client.host if request.client else "unknown"
            
            db_log = models.RequestLog(
                action_type="api_call",
                description=f"{request.method} {request.url.path}",
                user_id=user_id,
                user_email=user_email,
                ip_address=ip_address,
                endpoint=request.url.path,
                method=request.method,
                status_code=response.status_code,
                response_time_ms=process_time,
                created_at=datetime.utcnow()
            )
            db.add(db_log)
            db.commit()
        except Exception as e:
            print(f"Error logging request: {e}")
        finally:
            db.close()
            
    return response

USERS_FILE = "users.json"

def load_users():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({"users": []}, f)
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(data):
    with open(USERS_FILE, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# REGISTER endpoint:
@app.post("/auth/register")
async def register(data: RegisterRequest):
    users_data = load_users()
    
    # Check if email already exists
    existing = [u for u in users_data["users"] 
                if u["email"] == data.email]
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Create new user
    new_user = {
        "id": len(users_data["users"]) + 1,
        "full_name": data.full_name,
        "email": data.email,
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "created_at": datetime.now().isoformat(),
        "role": "user",
        "is_active": True,
        "bookings": [],
        "favorites": []
    }
    
    users_data["users"].append(new_user)
    save_users(users_data)
    
    # Return user without password
    return {
        "success": True,
        "message": "Registration successful",
        "user": {
            "id": new_user["id"],
            "full_name": new_user["full_name"],
            "email": new_user["email"],
            "phone": new_user["phone"],
            "role": new_user["role"]
        }
    }

from fastapi import Header

@app.get("/auth/me")
async def get_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    
    if token == "admin-token":
        return {
            "id": 0,
            "full_name": "Administrator",
            "email": "admin",
            "role": "admin"
        }
    
    if token.startswith("user-token-"):
        try:
            user_id = int(token.split("-")[-1])
            users_data = load_users()
            user = next((u for u in users_data["users"] if u["id"] == user_id), None)
            if user:
                return {
                    "id": user["id"],
                    "full_name": user["full_name"],
                    "email": user["email"],
                    "phone": user["phone"],
                    "role": user["role"]
                }
        except:
            pass
            
    raise HTTPException(status_code=401, detail="Invalid token")

# LOGIN endpoint:
@app.post("/auth/login")
async def login(data: LoginRequest):
    # Admin check
    if data.email == "admin" and data.password == "admin":
        return {
            "success": True,
            "role": "admin",
            "user": {
                "id": 0,
                "full_name": "Administrator",
                "email": "admin",
                "role": "admin"
            },
            "token": "admin-token"
        }
    
    users_data = load_users()
    
    # Find user by email
    user = next(
        (u for u in users_data["users"] 
         if u["email"] == data.email), 
        None
    )
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    
    # Check password
    if user["password_hash"] != hash_password(data.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )
    
    if not user["is_active"]:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled"
        )
    
    # Update last login
    users_data["users"] = [
        {**u, "last_login": datetime.now().isoformat()}
        if u["email"] == data.email else u
        for u in users_data["users"]
    ]
    save_users(users_data)
    
    return {
        "success": True,
        "role": "user",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"]
        },
        "token": f"user-token-{user['id']}"
    }

# GET all users (admin only):
@app.get("/auth/users")
async def get_users():
    users_data = load_users()
    # Return without passwords
    safe_users = [
        {k: v for k, v in u.items() 
         if k != "password_hash"}
        for u in users_data["users"]
    ]
    return {"users": safe_users, 
            "total": len(safe_users)}

class BookingRequest(BaseModel):
    user_id: int
    car_id: int
    car_brand: str
    car_model: str
    car_photo: str
    booking_type: str  # "rent" or "leasing"
    start_date: str
    end_date: str
    total_price: float

@app.post("/bookings")
async def create_booking(data: BookingRequest):
    users_data = load_users()
    
    booking = {
        "id": int(datetime.now().timestamp()),
        "car_id": data.car_id,
        "car_brand": data.car_brand,
        "car_model": data.car_model,
        "car_photo": data.car_photo,
        "booking_type": data.booking_type,
        "start_date": data.start_date,
        "end_date": data.end_date,
        "total_price": data.total_price,
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    
    for user in users_data["users"]:
        if user["id"] == data.user_id:
            if "bookings" not in user:
                user["bookings"] = []
            user["bookings"].append(booking)
            break
    
    save_users(users_data)
    return {"success": True, "booking": booking}

@app.get("/bookings/{user_id}")
async def get_user_bookings(user_id: int):
    users_data = load_users()
    for user in users_data["users"]:
        if user["id"] == user_id:
            return {
                "bookings": user.get("bookings", []),
                "total": len(user.get("bookings", []))
            }
    return {"bookings": [], "total": 0}

@app.put("/bookings/{user_id}/{booking_id}/cancel")
async def cancel_booking(user_id: int, booking_id: int):
    users_data = load_users()
    for user in users_data["users"]:
        if user["id"] == user_id:
            for booking in user.get("bookings", []):
                if booking["id"] == booking_id:
                    booking["status"] = "cancelled"
                    break
    save_users(users_data)
    return {"success": True}

# Include Routers
app.include_router(cars.router)
app.include_router(auth_router.router)
app.include_router(bookings.router)
app.include_router(ml.router)
app.include_router(admin.router)
