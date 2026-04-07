from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import models, database, schemas, auth

router = APIRouter(
    prefix="/prescriptions",
    tags=["prescriptions"]
)

@router.post("/create", response_model=schemas.PrescriptionOut)
def create_prescription(
    prescription: schemas.PrescriptionCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Create a prescription (doctors only)"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    
    # Get doctor profile
    doctor = current_user.doctor_profile
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Parse start_date if it's a string (ISO format from frontend)
    start_date = prescription.start_date
    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    
    # Calculate end date
    end_date = start_date + timedelta(days=prescription.duration_days)
    
    new_prescription = models.Prescription(
        patient_id=prescription.patient_id,
        doctor_id=doctor.id,
        appointment_id=prescription.appointment_id,
        medicine_name=prescription.medicine_name,
        dosage=prescription.dosage,
        frequency=prescription.frequency,
        duration_days=prescription.duration_days,
        start_date=start_date,
        end_date=end_date,
        instructions=prescription.instructions
    )
    
    db.add(new_prescription)
    db.commit()
    db.refresh(new_prescription)
    
    # Create immediate notification for the patient about new prescription
    notification = models.Notification(
        user_id=patient.user_id,
        notification_type="medicine_reminder",
        title=f"💊 New Prescription: {prescription.medicine_name}",
        message=f"Dr. {current_user.full_name} has prescribed {prescription.medicine_name} ({prescription.dosage}). Take {prescription.frequency} for {prescription.duration_days} days. {prescription.instructions or ''}",
        scheduled_datetime=datetime.utcnow(),
        related_entity_id=new_prescription.id,
        status="pending",
        is_read=False
    )
    db.add(notification)
    db.commit()
    
    return new_prescription


@router.get("/me", response_model=List[schemas.PrescriptionOut])
def get_my_prescriptions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get prescriptions for the logged-in patient"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access this endpoint")
    
    patient = current_user.patient_profile
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient.id
    ).order_by(models.Prescription.created_at.desc()).all()
    
    return prescriptions


@router.get("/patient/{patient_id}", response_model=List[schemas.PrescriptionOut])
def get_patient_prescriptions(
    patient_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get prescriptions for a specific patient (doctors only)"""
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this endpoint")
    
    # Verify patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient_id
    ).order_by(models.Prescription.created_at.desc()).all()
    
    return prescriptions


@router.get("/{prescription_id}", response_model=schemas.PrescriptionOut)
def get_prescription_details(
    prescription_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get prescription details"""
    prescription = db.query(models.Prescription).filter(
        models.Prescription.id == prescription_id
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Authorization: Only the patient or doctor can view
    if current_user.role == "patient":
        if prescription.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user.role == "doctor":
        if prescription.doctor_id != current_user.doctor_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return prescription


@router.get("/active/me", response_model=List[schemas.PrescriptionOut])
def get_active_prescriptions(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """Get active prescriptions for the logged-in patient"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can access this endpoint")
    
    patient = current_user.patient_profile
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    now = datetime.utcnow()
    prescriptions = db.query(models.Prescription).filter(
        models.Prescription.patient_id == patient.id,
        models.Prescription.start_date <= now,
        models.Prescription.end_date >= now
    ).order_by(models.Prescription.created_at.desc()).all()
    
    return prescriptions
