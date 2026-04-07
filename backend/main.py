from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging

logging.basicConfig(
    filename='app.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Health Care System",
    description="Backend API for Smart Health Care System",
    version="0.1.0"
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:5174",  # Vite fallback port
    "http://localhost:3000",  # React default port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from . import auth
from .routers import patient, doctor, appointment, ai, notification, prescription, admin, feedback
from . import scheduler

app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(appointment.router)
app.include_router(ai.router)
app.include_router(notification.router)
app.include_router(prescription.router)
app.include_router(admin.router)
app.include_router(feedback.router)

@app.on_event("startup")
async def startup_event():
    """Start background scheduler on app startup"""
    logger.info("Starting application...")
    scheduler.start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    """Stop background scheduler on app shutdown"""
    logger.info("Shutting down application...")
    scheduler.stop_scheduler()

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Health Care System API"}
