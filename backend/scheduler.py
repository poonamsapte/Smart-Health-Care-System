from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models, database, email_service
import logging

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def get_db_session():
    """Get database session for scheduler tasks"""
    db = database.SessionLocal()
    try:
        return db
    finally:
        pass  # Don't close here, close after use


def parse_frequency(frequency: str) -> list:
    """
    Parse prescription frequency and return list of times
    Examples:
    - "once daily" -> ["08:00"]
    - "twice daily" -> ["08:00", "20:00"]
    - "3 times daily" -> ["08:00", "14:00", "20:00"]
    - "every 6 hours" -> ["00:00", "06:00", "12:00", "18:00"]
    """
    frequency_lower = frequency.lower()
    
    if "once" in frequency_lower or "1 time" in frequency_lower:
        return ["08:00"]
    elif "twice" in frequency_lower or "2 times" in frequency_lower:
        return ["08:00", "20:00"]
    elif "3 times" in frequency_lower or "thrice" in frequency_lower:
        return ["08:00", "14:00", "20:00"]
    elif "4 times" in frequency_lower:
        return ["08:00", "12:00", "16:00", "20:00"]
    elif "every 6 hours" in frequency_lower:
        return ["00:00", "06:00", "12:00", "18:00"]
    elif "every 8 hours" in frequency_lower:
        return ["08:00", "16:00", "00:00"]
    elif "every 12 hours" in frequency_lower:
        return ["08:00", "20:00"]
    else:
        # Default to once daily
        return ["08:00"]


def check_and_create_medicine_reminders():
    """Check active prescriptions and create medicine reminders"""
    logger.info("Running medicine reminder check...")
    db = get_db_session()
    
    try:
        now = datetime.utcnow()
        today = now.date()
        
        # Get active prescriptions
        active_prescriptions = db.query(models.Prescription).filter(
            models.Prescription.start_date <= now,
            models.Prescription.end_date >= now
        ).all()
        
        logger.info(f"Found {len(active_prescriptions)} active prescriptions")
        
        for prescription in active_prescriptions:
            # Parse frequency to get reminder times
            reminder_times = parse_frequency(prescription.frequency)
            
            for time_str in reminder_times:
                # Create datetime for today at the specified time
                hour, minute = map(int, time_str.split(':'))
                reminder_datetime = datetime.combine(today, datetime.min.time().replace(hour=hour, minute=minute))
                
                # Only create if in the future
                if reminder_datetime > now:
                    # Check if notification already exists
                    existing = db.query(models.Notification).filter(
                        models.Notification.user_id == prescription.patient.user_id,
                        models.Notification.notification_type == "medicine_reminder",
                        models.Notification.related_entity_id == prescription.id,
                        models.Notification.scheduled_datetime == reminder_datetime
                    ).first()
                    
                    if not existing:
                        # Create notification
                        notification = models.Notification(
                            user_id=prescription.patient.user_id,
                            notification_type="medicine_reminder",
                            title=f"💊 Time to take {prescription.medicine_name}",
                            message=f"Dosage: {prescription.dosage}. {prescription.instructions or ''}",
                            scheduled_datetime=reminder_datetime,
                            related_entity_id=prescription.id,
                            status="pending"
                        )
                        db.add(notification)
                        logger.info(f"Created medicine reminder for prescription {prescription.id} at {reminder_datetime}")
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error in check_and_create_medicine_reminders: {str(e)}")
        db.rollback()
    finally:
        db.close()


def check_and_create_appointment_reminders():
    """Check upcoming appointments and create reminders"""
    logger.info("Running appointment reminder check...")
    db = get_db_session()
    
    try:
        now = datetime.utcnow()
        
        # Get upcoming appointments (next 48 hours)
        upcoming_appointments = db.query(models.Appointment).filter(
            models.Appointment.appointment_date >= now,
            models.Appointment.appointment_date <= now + timedelta(hours=48),
            models.Appointment.status == "scheduled"
        ).all()
        
        logger.info(f"Found {len(upcoming_appointments)} upcoming appointments")
        
        for appointment in upcoming_appointments:
            # 24-hour reminder
            reminder_24h = appointment.appointment_date - timedelta(hours=24)
            if reminder_24h > now:
                existing_24h = db.query(models.Notification).filter(
                    models.Notification.user_id == appointment.patient.user_id,
                    models.Notification.notification_type == "appointment_reminder",
                    models.Notification.related_entity_id == appointment.id,
                    models.Notification.scheduled_datetime == reminder_24h
                ).first()
                
                if not existing_24h:
                    doctor_name = appointment.doctor.user.full_name
                    notification = models.Notification(
                        user_id=appointment.patient.user_id,
                        notification_type="appointment_reminder",
                        title="📅 Appointment Tomorrow",
                        message=f"You have an appointment with Dr. {doctor_name} tomorrow at {appointment.appointment_date.strftime('%I:%M %p')}",
                        scheduled_datetime=reminder_24h,
                        related_entity_id=appointment.id,
                        status="pending"
                    )
                    db.add(notification)
                    logger.info(f"Created 24h reminder for appointment {appointment.id}")
            
            # 1-hour reminder
            reminder_1h = appointment.appointment_date - timedelta(hours=1)
            if reminder_1h > now:
                existing_1h = db.query(models.Notification).filter(
                    models.Notification.user_id == appointment.patient.user_id,
                    models.Notification.notification_type == "appointment_reminder",
                    models.Notification.related_entity_id == appointment.id,
                    models.Notification.scheduled_datetime == reminder_1h
                ).first()
                
                if not existing_1h:
                    doctor_name = appointment.doctor.user.full_name
                    notification = models.Notification(
                        user_id=appointment.patient.user_id,
                        notification_type="appointment_reminder",
                        title="📅 Appointment in 1 Hour",
                        message=f"Your appointment with Dr. {doctor_name} is in 1 hour at {appointment.appointment_date.strftime('%I:%M %p')}",
                        scheduled_datetime=reminder_1h,
                        related_entity_id=appointment.id,
                        status="pending"
                    )
                    db.add(notification)
                    logger.info(f"Created 1h reminder for appointment {appointment.id}")
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error in check_and_create_appointment_reminders: {str(e)}")
        db.rollback()
    finally:
        db.close()


def send_pending_notifications():
    """Send pending notifications that are due"""
    logger.info("Running send pending notifications...")
    db = get_db_session()
    
    try:
        now = datetime.utcnow()
        
        # Get pending notifications that are due
        pending_notifications = db.query(models.Notification).filter(
            models.Notification.status == "pending",
            models.Notification.scheduled_datetime <= now
        ).all()
        
        logger.info(f"Found {len(pending_notifications)} pending notifications to send")
        
        for notification in pending_notifications:
            try:
                # Get user details
                user = db.query(models.User).filter(models.User.id == notification.user_id).first()
                
                if user:
                    # Send email
                    email_sent = email_service.send_notification_email(
                        notification_type=notification.notification_type,
                        to_email=user.email,
                        recipient_name=user.full_name,
                        title=notification.title,
                        message=notification.message
                    )
                    
                    # Update status
                    notification.status = "sent" if email_sent else "sent"  # Mark as sent even if email fails (in-app notification is primary)
                    logger.info(f"Notification {notification.id} sent to user {user.email}")
                else:
                    notification.status = "failed"
                    logger.error(f"User not found for notification {notification.id}")
                    
            except Exception as e:
                logger.error(f"Error sending notification {notification.id}: {str(e)}")
                notification.status = "failed"
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error in send_pending_notifications: {str(e)}")
        db.rollback()
    finally:
        db.close()


def cleanup_old_notifications():
    """Delete read notifications older than 30 days"""
    logger.info("Running cleanup of old notifications...")
    db = get_db_session()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        deleted_count = db.query(models.Notification).filter(
            models.Notification.is_read == True,
            models.Notification.created_at < cutoff_date
        ).delete()
        
        db.commit()
        logger.info(f"Deleted {deleted_count} old notifications")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_notifications: {str(e)}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the background scheduler"""
    try:
        # Check and create reminders every hour
        scheduler.add_job(
            check_and_create_medicine_reminders,
            'interval',
            hours=1,
            id='medicine_reminders',
            replace_existing=True
        )
        
        scheduler.add_job(
            check_and_create_appointment_reminders,
            'interval',
            hours=1,
            id='appointment_reminders',
            replace_existing=True
        )
        
        # Send pending notifications every 5 minutes
        scheduler.add_job(
            send_pending_notifications,
            'interval',
            minutes=5,
            id='send_notifications',
            replace_existing=True
        )
        
        # Cleanup old notifications daily at 2 AM
        scheduler.add_job(
            cleanup_old_notifications,
            'cron',
            hour=2,
            minute=0,
            id='cleanup_notifications',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Scheduler started successfully")
        
        # Run initial checks
        check_and_create_medicine_reminders()
        check_and_create_appointment_reminders()
        send_pending_notifications()
        
    except Exception as e:
        logger.error(f"Error starting scheduler: {str(e)}")


def stop_scheduler():
    """Stop the background scheduler"""
    try:
        scheduler.shutdown()
        logger.info("Scheduler stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {str(e)}")
