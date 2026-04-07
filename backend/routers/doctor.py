from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, schemas, auth

router = APIRouter(
    prefix="/doctors",
    tags=["doctors"]
)

@router.get("/", response_model=List[schemas.DoctorOut])
def get_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Doctor)
    if specialization:
        query = query.filter(models.Doctor.specialization.contains(specialization))
    
    doctors = query.offset(skip).limit(limit).all()
    return doctors

    doctors = query.offset(skip).limit(limit).all()
    return doctors

@router.get("/me", response_model=schemas.DoctorOut)
def get_current_doctor_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doctor = current_user.doctor_profile
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Manually populate user info
    doctor.user = current_user
    return doctor

@router.put("/me", response_model=schemas.DoctorOut)
def update_doctor_profile(
    doctor_update: schemas.DoctorUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doctor = current_user.doctor_profile
    if not doctor:
         # Create if not exists
         doctor = models.Doctor(user_id=current_user.id)
         db.add(doctor)
    
    # Update fields
    doctor.specialization = doctor_update.specialization
    doctor.experience_years = doctor_update.experience_years
    doctor.hospital_affiliation = doctor_update.hospital_affiliation
    doctor.consultation_fee = doctor_update.consultation_fee
    
    # New fields
    if doctor_update.license_number:
        doctor.license_number = doctor_update.license_number
    if doctor_update.availability:
        doctor.availability = doctor_update.availability

    
    db.commit()
    db.refresh(doctor)
    # Manually populate user info to ensure response is correct
    doctor.user = current_user
    return doctor

@router.get("/me/stats", response_model=schemas.DoctorStats)
def get_doctor_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    from datetime import date
    
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    doctor = current_user.doctor_profile
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Calculate statistics
    all_appointments = doctor.appointments
    total = len(all_appointments)
    pending = len([a for a in all_appointments if a.status == "scheduled"])
    completed = len([a for a in all_appointments if a.status == "completed"])
    cancelled = len([a for a in all_appointments if a.status == "cancelled"])
    
    # Today's appointments
    today = date.today()
    today_count = len([a for a in all_appointments if a.appointment_date.date() == today])
    
    return schemas.DoctorStats(
        total_appointments=total,
        pending_appointments=pending,
        completed_appointments=completed,
        cancelled_appointments=cancelled,
        today_appointments=today_count
    )

@router.get("/{doctor_id}", response_model=schemas.DoctorOut)

def get_doctor(doctor_id: int, db: Session = Depends(database.get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor


