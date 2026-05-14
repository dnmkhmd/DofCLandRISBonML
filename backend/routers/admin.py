from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta, datetime
import models, schemas, database, auth
from services import logger as logger_service

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_admin(current_user_email: str = Depends(auth.get_current_user_email)):
    if current_user_email != "admin":
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    return current_user_email

@router.post("/login")
def admin_login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    if form_data.email == "admin" and form_data.password == "admin":
        access_token_expires = timedelta(hours=24)
        access_token = auth.create_access_token(
            data={"sub": "admin", "is_admin": True}, 
            expires_delta=access_token_expires
        )
        logger_service.log_action(db, action_type="admin_login", description="Admin logged in", user_email="admin", endpoint="/admin/login", method="POST")
        return {"access_token": access_token, "token_type": "bearer"}
    
    logger_service.log_action(db, action_type="admin_login_failed", description=f"Failed admin login attempt: {form_data.email}", user_email=form_data.email, endpoint="/admin/login", method="POST", status_code=401)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.get("/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    total_cars = db.query(models.Car).count()
    active_rentals = db.query(models.Booking).filter(models.Booking.status == "Active").count()
    pending_leasing = db.query(models.LeasingApplication).filter(models.LeasingApplication.status == "Pending").count()
    total_users = db.query(models.User).count()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    requests_today = db.query(models.RequestLog).filter(models.RequestLog.created_at >= today_start).count()
    
    return {
        "total_cars": total_cars, "active_rentals": active_rentals,
        "pending_leasing": pending_leasing, "total_users": total_users,
        "requests_today": requests_today
    }

@router.get("/logs", response_model=List[schemas.RequestLog])
def get_admin_logs(skip: int = 0, limit: int = 100, action_type: Optional[str] = None, user_email: Optional[str] = None, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    query = db.query(models.RequestLog)
    if action_type: query = query.filter(models.RequestLog.action_type == action_type)
    if user_email: query = query.filter(models.RequestLog.user_email.ilike(f"%{user_email}%"))
    return query.order_by(models.RequestLog.created_at.desc()).offset(skip).limit(limit).all()

@router.delete("/logs")
def clear_admin_logs(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    db.query(models.RequestLog).delete()
    db.commit()
    logger_service.log_action(db, action_type="admin_action", description="Admin cleared all logs", user_email="admin", endpoint="/admin/logs", method="DELETE")
    return {"status": "Logs cleared"}

@router.get("/logs/export")
def export_admin_logs(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    import csv, io
    from fastapi.responses import StreamingResponse
    logs = db.query(models.RequestLog).order_by(models.RequestLog.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Action Type", "Description", "User", "IP Address", "Endpoint", "Method", "Status", "Time (ms)"])
    for log in logs:
        writer.writerow([log.id, log.created_at.strftime("%Y-%m-%d %H:%M:%S"), log.action_type, log.description, log.user_email or "Guest", log.ip_address, log.endpoint, log.method, log.status_code, log.response_time_ms])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=request_history.csv"})
