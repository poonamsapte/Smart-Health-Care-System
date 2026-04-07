from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, auth

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

# Admin Authorization Dependency
def get_current_admin(current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access admin resources"
        )
    return current_user

@router.get("/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    """Get system statistics for admin dashboard."""
    total_users = db.query(models.User).filter(models.User.role != "admin").count()
    total_feedbacks = db.query(models.Feedback).count()
    return {"total_users": total_users, "total_feedbacks": total_feedbacks}

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    """Get all non-admin users."""
    users = db.query(models.User).filter(models.User.role != "admin").all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    """Delete a user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Delete associated profiles for cascade implicitly handled if defined, here we do it explicitly just in case
    # In models.py there are no cascade deletes so we clean up manually
    if user.role == "patient" and user.patient_profile:
         db.delete(user.patient_profile)
    elif user.role == "doctor" and user.doctor_profile:
         db.delete(user.doctor_profile)
         
    db.delete(user)
    db.commit()
    return

@router.get("/feedbacks", response_model=List[schemas.FeedbackOut])
def get_all_feedbacks(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    """Get all feedbacks."""
    feedbacks = db.query(models.Feedback).order_by(models.Feedback.created_at.desc()).all()
    return feedbacks

@router.delete("/feedbacks/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(feedback_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_admin)):
    """Delete a feedback entry."""
    feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    
    db.delete(feedback)
    db.commit()
    return
