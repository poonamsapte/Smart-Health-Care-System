"""
Test script to create sample notifications and prescriptions
Run this after starting the backend server to test the notification system
"""
import requests
from datetime import datetime, timedelta
import json

BASE_URL = "http://localhost:8000"

# You'll need to replace these with actual tokens after logging in
# For testing, first login as a doctor and patient to get their tokens

def test_create_prescription(doctor_token, patient_id):
    """Test creating a prescription (requires doctor login)"""
    headers = {"Authorization": f"Bearer {doctor_token}"}
    
    prescription_data = {
        "patient_id": patient_id,
        "medicine_name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration_days": 7,
        "start_date": datetime.utcnow().isoformat(),
        "instructions": "Take after meals with water"
    }
    
    response = requests.post(
        f"{BASE_URL}/prescriptions/create",
        headers=headers,
        json=prescription_data
    )
    
    print("Create Prescription Response:")
    print(json.dumps(response.json(), indent=2))
    return response.json()


def test_create_notification(user_token, user_id):
    """Test creating a manual notification"""
    headers = {"Authorization": f"Bearer {user_token}"}
    
    notification_data = {
        "user_id": user_id,
        "notification_type": "health_check_reminder",
        "title": "Monthly Health Checkup",
        "message": "It's time for your monthly health checkup. Please schedule an appointment.",
        "scheduled_datetime": (datetime.utcnow() + timedelta(hours=1)).isoformat()
    }
    
    response = requests.post(
        f"{BASE_URL}/notifications/create",
        headers=headers,
        json=notification_data
    )
    
    print("\nCreate Notification Response:")
    print(json.dumps(response.json(), indent=2))
    return response.json()


def test_get_notifications(patient_token):
    """Test fetching notifications"""
    headers = {"Authorization": f"Bearer {patient_token}"}
    
    response = requests.get(
        f"{BASE_URL}/notifications/me",
        headers=headers
    )
    
    print("\nGet Notifications Response:")
    print(json.dumps(response.json(), indent=2))
    return response.json()


def test_get_notification_stats(patient_token):
    """Test fetching notification statistics"""
    headers = {"Authorization": f"Bearer {patient_token}"}
    
    response = requests.get(
        f"{BASE_URL}/notifications/stats",
        headers=headers
    )
    
    print("\nNotification Stats Response:")
    print(json.dumps(response.json(), indent=2))
    return response.json()


def test_get_upcoming_reminders(patient_token):
    """Test fetching upcoming reminders"""
    headers = {"Authorization": f"Bearer {patient_token}"}
    
    response = requests.get(
        f"{BASE_URL}/notifications/upcoming?limit=5",
        headers=headers
    )
    
    print("\nUpcoming Reminders Response:")
    print(json.dumps(response.json(), indent=2))
    return response.json()


if __name__ == "__main__":
    print("=" * 50)
    print("Notification Module Test Script")
    print("=" * 50)
    
    print("\nInstructions:")
    print("1. Start the backend server: uvicorn backend.main:app --reload")
    print("2. Login as a patient and doctor to get access tokens")
    print("3. Update the tokens below and run this script")
    print("\nNote: You can get tokens by logging in via the frontend or using:")
    print("POST /auth/login with email and password")
    print("\n" + "=" * 50)
    
    # Replace these with actual values after logging in
    PATIENT_TOKEN = "your-patient-token-here"
    DOCTOR_TOKEN = "your-doctor-token-here"
    PATIENT_ID = 1  # Replace with actual patient ID
    PATIENT_USER_ID = 1  # Replace with actual user ID
    
    # Uncomment and run tests after adding tokens
    # test_create_prescription(DOCTOR_TOKEN, PATIENT_ID)
    # test_create_notification(PATIENT_TOKEN, PATIENT_USER_ID)
    # test_get_notifications(PATIENT_TOKEN)
    # test_get_notification_stats(PATIENT_TOKEN)
    # test_get_upcoming_reminders(PATIENT_TOKEN)
    
    print("\n✅ Test script ready! Update tokens and uncomment test functions to run.")
