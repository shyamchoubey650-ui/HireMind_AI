"""
Small internal helper for creating in-app notifications from any router.
Kept dependency-free (no email/SMTP) for the prototype — swap in an
SMTP/SendGrid call inside create_notification() to add real email delivery
without touching any call sites.
"""
from sqlalchemy.orm import Session
from . import models


def create_notification(
    db: Session,
    user_id: int,
    message: str,
    type: str = "info",
    link_type: str = "",
    link_id: int = None,
) -> models.Notification:
    note = models.Notification(
        user_id=user_id,
        message=message,
        type=type,
        link_type=link_type,
        link_id=link_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
