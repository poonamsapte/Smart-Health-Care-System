from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from .. import models, database, schemas, auth

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)

@router.get("/me", response_model=List[schemas.NotificationOut])
def get_my_notifications(
    notification_type: Optional[str] = Query(None, description="Filter by type"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get all notifications for the logged-in user with optional filters"""
    query = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )
    
    # Apply filters
    if notification_type:
        query = query.filter(models.Notification.notification_type == notification_type)
    if is_read is not None:
        query = query.filter(models.Notification.is_read == is_read)
    
    # Order by scheduled datetime descending (newest first)
    notifications = query.order_by(
        models.Notification.scheduled_datetime.desc()
    ).offset(offset).limit(limit).all()
    
    return notifications


@router.get("/stats", response_model=schemas.NotificationStats)
def get_notification_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get notification statistics for the logged-in user"""
    total_unread = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).count()
    
    # Upcoming reminders (scheduled in the future and not read)
    upcoming_reminders = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.scheduled_datetime >= datetime.utcnow(),
        models.Notification.is_read == False
    ).count()
    
    total_notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).count()
    
    return {
        "total_unread": total_unread,
        "upcoming_reminders": upcoming_reminders,
        "total_notifications": total_notifications
    }


@router.get("/upcoming", response_model=List[schemas.NotificationOut])
def get_upcoming_reminders(
    limit: int = Query(5, le=20),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get upcoming reminders for the logged-in user"""
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.scheduled_datetime >= datetime.utcnow(),
        models.Notification.is_read == False
    ).order_by(
        models.Notification.scheduled_datetime.asc()
    ).limit(limit).all()
    
    return notifications


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Mark a notification as read"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification


@router.patch("/mark-all-read")
def mark_all_as_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Mark all notifications as read for the logged-in user"""
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Delete a notification"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.post("/create", response_model=schemas.NotificationOut)
def create_notification(
    notification: schemas.NotificationCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a notification (for doctors/admins or system)"""
    # Only doctors and admins can create notifications for others
    if current_user.role not in ["doctor", "admin"]:
        # Patients can only create notifications for themselves
        if notification.user_id != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="Not authorized to create notifications for other users"
            )
    
    new_notification = models.Notification(
        user_id=notification.user_id,
        notification_type=notification.notification_type,
        title=notification.title,
        message=notification.message,
        scheduled_datetime=notification.scheduled_datetime,
        related_entity_id=notification.related_entity_id
    )
    
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)
    
    return new_notification
