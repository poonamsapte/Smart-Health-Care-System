from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "patient"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Patient Schemas
class PatientBase(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None

class PatientUpdate(PatientBase):
    pass

class PatientOut(PatientBase):
    id: int
    user_id: int
    
    user: Optional[UserOut] = None
    
    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorBase(BaseModel):
    specialization: str
    experience_years: int
    hospital_affiliation: Optional[str] = None
    consultation_fee: int
    license_number: Optional[str] = None
    availability: Optional[str] = "Mon-Fri 9am-5pm"

class DoctorUpdate(DoctorBase):
    pass

class DoctorOut(DoctorBase):
    id: int
    user_id: int
    is_verified: bool
    user: Optional[UserOut] = None # To return user details like name

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    doctor_id: int
    appointment_date: datetime
    reason: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    diagnosis_notes: Optional[str] = None

class AppointmentOut(AppointmentBase):
    id: int
    patient_id: int
    status: str
    diagnosis_notes: Optional[str] = None
    
    # We might want to include nested objects for comprehensive details
    # but let's keep it simple or use separate schemas
    
    class Config:
        from_attributes = True

# Enhanced Appointment Schemas for Dashboard
class PatientInfo(BaseModel):
    id: int
    full_name: str
    email: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    
    class Config:
        from_attributes = True

class DoctorInfo(BaseModel):
    id: int
    full_name: str
    email: str
    specialization: str
    experience_years: int
    hospital_affiliation: Optional[str] = None
    consultation_fee: int
    license_number: Optional[str] = None
    availability: Optional[str] = None
    
    class Config:
        from_attributes = True

class AppointmentWithDetails(BaseModel):
    id: int
    appointment_date: datetime
    status: str
    reason: Optional[str] = None
    diagnosis_notes: Optional[str] = None
    patient: Optional[PatientInfo] = None
    doctor: Optional[DoctorInfo] = None
    
    class Config:
        from_attributes = True

# Doctor Statistics Schema
class DoctorStats(BaseModel):
    total_appointments: int
    pending_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    today_appointments: int


# AI Schemas
class SymptomAnalysisRequest(BaseModel):
    symptoms: str
    age: Optional[int] = None
    gender: Optional[str] = None

class DiseasePrediction(BaseModel):
    name: str
    confidence: float

class MedicineSuggestion(BaseModel):
    name: str
    dosage: str
    advice: List[str]

class AIHealthReport(BaseModel):
    risk_level: str # Low, Medium, High
    detected_symptoms: List[str]
    predicted_diseases: List[DiseasePrediction]
    suggested_medicines: List[MedicineSuggestion] = []
    recommendations: List[str]
    disclaimer: str = "This is not a medical diagnosis. Please consult a doctor."


# Health Record Schemas
class HealthRecordBase(BaseModel):
    record_type: str
    details: str
    is_shared_with_doctor: bool = False

class HealthRecordCreate(HealthRecordBase):
    pass

class HealthRecordOut(HealthRecordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    notification_type: str
    title: str
    message: str
    scheduled_datetime: datetime

class NotificationCreate(NotificationBase):
    user_id: int
    related_entity_id: Optional[int] = None

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    status: Optional[str] = None

class NotificationOut(NotificationBase):
    id: int
    user_id: int
    status: str
    is_read: bool
    created_at: datetime
    related_entity_id: Optional[int] = None

    class Config:
        from_attributes = True

class NotificationStats(BaseModel):
    total_unread: int
    upcoming_reminders: int
    total_notifications: int


# Prescription Schemas
class PrescriptionBase(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration_days: int
    start_date: datetime | str
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    patient_id: int
    appointment_id: Optional[int] = None

class PrescriptionOut(PrescriptionBase):
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    end_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Feedback Schemas
class FeedbackBase(BaseModel):
    name: str
    email: EmailStr
    message: str

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackOut(FeedbackBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Admin Schemas
class AdminStats(BaseModel):
    total_users: int
    total_feedbacks: int
