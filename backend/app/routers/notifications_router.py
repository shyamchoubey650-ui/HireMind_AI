from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("/mine", response_model=List[schemas.NotificationOut])
def my_notifications(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.Notification).filter(
        models.Notification.user_id == user.id
    ).order_by(models.Notification.created_at.desc()).limit(50).all()


@router.get("/mine/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    count = db.query(models.Notification).filter(
        models.Notification.user_id == user.id, models.Notification.is_read == False  # noqa: E712
    ).count()
    return {"unread": count}


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    note = db.query(models.Notification).filter(
        models.Notification.id == notification_id, models.Notification.user_id == user.id
    ).first()
    if not note:
        raise HTTPException(404, "Notification not found")
    note.is_read = True
    db.commit()
    db.refresh(note)
    return note


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user),
):
    db.query(models.Notification).filter(
        models.Notification.user_id == user.id, models.Notification.is_read == False  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return {"status": "ok"}





@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(404, "Notification not found")
    
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted successfully"}
