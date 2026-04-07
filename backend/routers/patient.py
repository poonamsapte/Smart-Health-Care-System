from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, schemas, auth

router = APIRouter(
    prefix="/patient",
    tags=["patient"]
)

@router.get("/me", response_model=schemas.PatientOut)
def get_current_patient_profile(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    patient = current_user.patient_profile
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Manually populate user info
    patient.user = current_user
    return patient

@router.put("/me", response_model=schemas.PatientOut)
def update_patient_profile(
    patient_update: schemas.PatientUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    patient = current_user.patient_profile
    if not patient:
         # Create if not exists (should have been created at register, but safe fallback)
         patient = models.Patient(user_id=current_user.id)
         db.add(patient)
    
    # Update fields
    if patient_update.date_of_birth:
        patient.date_of_birth = patient_update.date_of_birth
    if patient_update.gender:
        patient.gender = patient_update.gender
    if patient_update.blood_group:
        patient.blood_group = patient_update.blood_group
    
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/records", response_model=List[schemas.HealthRecordOut])
def get_health_records(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return current_user.patient_profile.health_records

@router.get("/{patient_id}/records", response_model=List[schemas.HealthRecordOut])
def get_patient_records_for_doctor(
    patient_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
         raise HTTPException(status_code=404, detail="Patient not found")

    # Access Control: Check if user allowed sharing
    # We filter records where is_shared_with_doctor is True
    records = db.query(models.HealthRecord).filter(
        models.HealthRecord.patient_id == patient_id,
        models.HealthRecord.is_shared_with_doctor == True
    ).all()
    
    return records


@router.post("/records", response_model=schemas.HealthRecordOut)
def create_health_record(
    record: schemas.HealthRecordCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_record = models.HealthRecord(
        patient_id=current_user.patient_profile.id,
        record_type=record.record_type,
        details=record.details,
        is_shared_with_doctor=record.is_shared_with_doctor
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record
