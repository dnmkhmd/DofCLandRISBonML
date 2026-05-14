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

# Include Routers
app.include_router(cars.router)
app.include_router(auth_router.router)
app.include_router(bookings.router)
app.include_router(ml.router)
app.include_router(admin.router)
