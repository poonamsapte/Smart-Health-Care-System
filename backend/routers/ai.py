from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from .. import schemas, auth

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)

@router.post("/analyze", response_model=schemas.AIHealthReport)
def analyze_symptoms(
    request: schemas.SymptomAnalysisRequest,
    current_user: Optional[schemas.UserOut] = Depends(auth.get_current_user) # Optional auth for demo? Let's require auth
):
    symptoms_text = request.symptoms.lower()
    
    # Simple Rule-Based Logic (Mock AI)
    risk_level = "Low"
    detected_symptoms = []
    predicted_diseases = []
    suggested_medicines = []
    recommendations = ["Maintain a healthy lifestyle.", "Drink plenty of water."]
    
    # Symptom Detection
    common_symptoms = ["headache", "fever", "cough", "nausea", "chest pain", "shortness of breath", "fatigue"]
    for symptom in common_symptoms:
        if symptom in symptoms_text:
            detected_symptoms.append(symptom.capitalize())

    # Logic
    if "chest pain" in symptoms_text or "shortness of breath" in symptoms_text:
        risk_level = "High"
        predicted_diseases.append(schemas.DiseasePrediction(name="Angina", confidence=0.85))
        predicted_diseases.append(schemas.DiseasePrediction(name="Heart Attack", confidence=0.70))
        recommendations = ["Seek immediate medical attention.", "Do not drive yourself to the hospital."]
        suggested_medicines.append(schemas.MedicineSuggestion(
            name="Aspirin (300mg)",
            dosage="One tablet immediately (chewed)",
            advice=["Call emergency services immediately", "Sit down and rest"]
        ))
        
    elif "fever" in symptoms_text and "cough" in symptoms_text:
        risk_level = "Medium"
        predicted_diseases.append(schemas.DiseasePrediction(name="Flu (Influenza)", confidence=0.90))
        predicted_diseases.append(schemas.DiseasePrediction(name="Common Cold", confidence=0.60))
        recommendations.append("Rest and stay hydrated.")
        suggested_medicines.append(schemas.MedicineSuggestion(
            name="Paracetamol (500mg)",
            dosage="1 tablet every 4-6 hours",
            advice=["Do not exceed 4g in 24 hours", "Drink plenty of water"]
        ))
        suggested_medicines.append(schemas.MedicineSuggestion(
             name="Cough Syrup",
             dosage="10ml every 8 hours",
             advice=["May cause drowsiness"]
        ))
        
    elif "headache" in symptoms_text:
        risk_level = "Low"
        predicted_diseases.append(schemas.DiseasePrediction(name="Tension Headache", confidence=0.80))
        predicted_diseases.append(schemas.DiseasePrediction(name="Migraine", confidence=0.50))
        recommendations.append("Reduce screen time.")
        suggested_medicines.append(schemas.MedicineSuggestion(
            name="Ibuprofen (400mg)",
            dosage="1 tablet with food",
            advice=["Take with food to avoid stomach upset"]
        ))
    
    elif "nausea" in symptoms_text:
        risk_level = "Low"
        predicted_diseases.append(schemas.DiseasePrediction(name="Food Poisoning", confidence=0.40))
        suggested_medicines.append(schemas.MedicineSuggestion(
            name="Pepto-Bismol",
            dosage="30ml every hour as needed",
            advice=["Sipping clear fluids", "Eating bland foods (crackers, bananas)", "Avoid strong smells"]
        ))

    else:
        predicted_diseases.append(schemas.DiseasePrediction(name="General Fatigue", confidence=0.40))

    return schemas.AIHealthReport(
        risk_level=risk_level,
        detected_symptoms=detected_symptoms,
        predicted_diseases=predicted_diseases[:3], # Top 3
        suggested_medicines=suggested_medicines,
        recommendations=recommendations,
        disclaimer="This is an AI-generated insight and NOT a medical diagnosis. Please consult a doctor."
    )

