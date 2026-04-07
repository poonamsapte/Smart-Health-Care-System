import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

# 1. Register a doctor
print("1. Registering doctor...")
doctor_data = {
    "email": "doctor1@example.com",
    "password": "password123",
    "full_name": "Dr. Sarah Johnson",
    "role": "doctor"
}

response = requests.post(f"{BASE_URL}/auth/register", json=doctor_data)
print(f"Doctor registration: {response.status_code}")
if response.status_code != 200:
    print(f"Error: {response.text}")

# 2. Login as doctor
print("\n2. Logging in as doctor...")
login_data = {
    "username": "doctor1@example.com",
    "password": "password123"
}

response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
if response.status_code == 200:
    doctor_token = response.json()["access_token"]
    print(f"Doctor login successful")
else:
    print(f"Login failed: {response.text}")
    exit()

# 3. Update doctor profile
print("\n3. Updating doctor profile...")
profile_data = {
    "specialization": "Cardiology",
    "experience_years": 10,
    "hospital_affiliation": "City General Hospital",
    "consultation_fee": 150
}

headers = {"Authorization": f"Bearer {doctor_token}"}
response = requests.put(f"{BASE_URL}/doctors/me", json=profile_data, headers=headers)
print(f"Profile update: {response.status_code}")

# 4. Register a patient
print("\n4. Registering patient...")
patient_data = {
    "email": "patient1@example.com",
    "password": "password123",
    "full_name": "John Smith",
    "role": "patient"
}

response = requests.post(f"{BASE_URL}/auth/register", json=patient_data)
print(f"Patient registration: {response.status_code}")

# 5. Login as patient
print("\n5. Logging in as patient...")
patient_login = {
    "username": "patient1@example.com",
    "password": "password123"
}

response = requests.post(f"{BASE_URL}/auth/token", data=patient_login)
if response.status_code == 200:
    patient_token = response.json()["access_token"]
    print(f"Patient login successful")
else:
    print(f"Login failed: {response.text}")
    exit()

# 6. Create appointments
print("\n6. Creating appointments...")
patient_headers = {"Authorization": f"Bearer {patient_token}"}

# Get doctor ID first
response = requests.get(f"{BASE_URL}/doctors/", headers=patient_headers)
doctors = response.json()
if doctors:
    doctor_id = doctors[0]["id"]
    
    # Create 3 appointments
    appointments = [
        {
            "doctor_id": doctor_id,
            "appointment_date": (datetime.now() + timedelta(hours=2)).isoformat(),
            "reason": "Regular checkup and blood pressure monitoring"
        },
        {
            "doctor_id": doctor_id,
            "appointment_date": (datetime.now() + timedelta(days=1)).isoformat(),
            "reason": "Follow-up consultation for chest pain"
        },
        {
            "doctor_id": doctor_id,
            "appointment_date": (datetime.now() - timedelta(days=1)).isoformat(),
            "reason": "ECG test results review"
        }
    ]
    
    for appt in appointments:
        response = requests.post(f"{BASE_URL}/appointments/", json=appt, headers=patient_headers)
        print(f"Appointment created: {response.status_code}")

print("\n✅ Test data created successfully!")
print(f"\nDoctor credentials:")
print(f"  Email: doctor1@example.com")
print(f"  Password: password123")
print(f"\nPatient credentials:")
print(f"  Email: patient1@example.com")
print(f"  Password: password123")
