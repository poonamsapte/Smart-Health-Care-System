from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, schemas, auth

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"]
)

@router.post("/", response_model=schemas.AppointmentOut)
def book_appointment(
    appointment: schemas.AppointmentCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    # Check doctor exists
    doctor = db.query(models.Doctor).filter(models.Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    new_appointment = models.Appointment(
        patient_id=current_user.patient_profile.id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        reason=appointment.reason,
        status="scheduled"
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment

@router.get("/", response_model=List[schemas.AppointmentWithDetails])
def get_appointments(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    appointments = []
    
    if current_user.role == "patient":
        appointments = current_user.patient_profile.appointments
    elif current_user.role == "doctor":
        appointments = current_user.doctor_profile.appointments
    else:
        return []
    
    # Convert to detailed appointments with nested patient/doctor info
    detailed_appointments = []
    for appt in appointments:
        # Get patient info
        patient_data = None
        if appt.patient:
            patient_data = schemas.PatientInfo(
                id=appt.patient.id,
                full_name=appt.patient.user.full_name,
                email=appt.patient.user.email,
                date_of_birth=appt.patient.date_of_birth,
                gender=appt.patient.gender,
                blood_group=appt.patient.blood_group
            )
        
        # Get doctor info
        doctor_data = None
        if appt.doctor:
            doctor_data = schemas.DoctorInfo(
                id=appt.doctor.id,
                full_name=appt.doctor.user.full_name,
                email=appt.doctor.user.email,
                specialization=appt.doctor.specialization,
                experience_years=appt.doctor.experience_years,
                hospital_affiliation=appt.doctor.hospital_affiliation,
                consultation_fee=appt.doctor.consultation_fee
            )
        
        detailed_appt = schemas.AppointmentWithDetails(
            id=appt.id,
            appointment_date=appt.appointment_date,
            status=appt.status,
            reason=appt.reason,
            diagnosis_notes=appt.diagnosis_notes,
            patient=patient_data,
            doctor=doctor_data
        )
        detailed_appointments.append(detailed_appt)
    
    return detailed_appointments

@router.put("/{appointment_id}", response_model=schemas.AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    update_data: schemas.AppointmentUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Authorization: Only doctor associated or maybe patient can cancel?
    # For MVP, let's say doctor can update status/diagnosis, patient can maybe cancel
    
    if current_user.role == "doctor":
        if appointment.doctor_id != current_user.doctor_profile.id:
             raise HTTPException(status_code=403, detail="Not authorized")
        
        if update_data.status:
            appointment.status = update_data.status
        if update_data.diagnosis_notes:
            appointment.diagnosis_notes = update_data.diagnosis_notes
            
    elif current_user.role == "patient":
        if appointment.patient_id != current_user.patient_profile.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        if update_data.status == "cancelled":
             appointment.status = "cancelled"
        else:
             raise HTTPException(status_code=403, detail="Patients can only cancel appointments")
    
    db.commit()
    db.refresh(appointment)
    return appointment
