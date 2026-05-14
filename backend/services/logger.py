from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import models

def log_action(
    db: Session,
    action_type: str,
    description: str,
    user_id: Optional[int] = None,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    endpoint: str = "",
    method: str = "",
    status_code: Optional[int] = None,
    response_time_ms: Optional[int] = None
):
    """
    Manually log an action to the request_logs table.
    """
    db_log = models.RequestLog(
        action_type=action_type,
        description=description,
        user_id=user_id,
        user_email=user_email,
        ip_address=ip_address,
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        response_time_ms=response_time_ms,
        created_at=datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    return db_log
