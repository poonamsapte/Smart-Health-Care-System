from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="patient") # patient, doctor, admin

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    
    user = relationship("User", back_populates="patient_profile")
    health_records = relationship("HealthRecord", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    specialization = Column(String, default="General")
    experience_years = Column(Integer, default=0)
    hospital_affiliation = Column(String, nullable=True)
    consultation_fee = Column(Integer, default=0)
    license_number = Column(String, nullable=True)
    availability = Column(String, default="Mon-Fri 9am-5pm")
    is_verified = Column(Boolean, default=False)

    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    appointment_date = Column(DateTime)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    reason = Column(Text, nullable=True)
    diagnosis_notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    record_type = Column(String) # symptom_report, lab_result, prescription
    details = Column(Text) # JSON or text data
    created_at = Column(DateTime, default=datetime.utcnow)
    is_shared_with_doctor = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="health_records")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    notification_type = Column(String, index=True) # medicine_reminder, appointment_reminder, follow_up_reminder, health_check_reminder
    title = Column(String(200))
    message = Column(Text)
    scheduled_datetime = Column(DateTime, index=True)
    status = Column(String(20), default="pending", index=True) # pending, sent, failed
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    related_entity_id = Column(Integer, nullable=True) # ID of related appointment, prescription, etc.

    user = relationship("User")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    medicine_name = Column(String(200))
    dosage = Column(String(100))
    frequency = Column(String(100)) # e.g., "3 times daily", "twice daily", "once daily"
    duration_days = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
    doctor = relationship("Doctor")
    appointment = relationship("Appointment")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200))
    email = Column(String, index=True)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
