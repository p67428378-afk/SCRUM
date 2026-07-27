import logging
import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import get_db
from server.models.banking import WebhookSubscription
from server.models.user import User
from server.routers.banking import get_current_user
from server.schemas.banking import (
    WebhookSubscriptionResponse,
    WebhookSubscriptionCreateRequest,
)

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])
logger = logging.getLogger("webhooks")

# In-memory list to store dispatched webhooks for testing/verification
dispatched_webhooks = []


def clear_dispatched_webhooks():
    dispatched_webhooks.clear()


def dispatch_webhook(user_id: UUID, event_type: str, payload: dict, db: Session):
    """
    Simulates dispatching a webhook payload to registered subscribers.
    """
    subscriptions = (
        db.query(WebhookSubscription)
        .filter(
            WebhookSubscription.user_id == user_id,
            WebhookSubscription.is_active == True,
            WebhookSubscription.event_type.in_([event_type, "all"]),
        )
        .all()
    )

    for sub in subscriptions:
        logger.info(
            f"Dispatching webhook to {sub.url} | Event: {event_type} | Payload: {payload}"
        )
        dispatched_webhooks.append(
            {
                "subscription_id": str(sub.id),
                "url": sub.url,
                "event_type": event_type,
                "payload": payload,
            }
        )


@router.post("", response_model=WebhookSubscriptionResponse)
def subscribe_webhook(
    payload: WebhookSubscriptionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = WebhookSubscription(
        id=uuid.uuid4(),
        user_id=current_user.id,
        url=payload.url,
        event_type=payload.event_type,
        secret=payload.secret,
        is_active=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("", response_model=list[WebhookSubscriptionResponse])
def list_webhook_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subs = (
        db.query(WebhookSubscription)
        .filter(WebhookSubscription.user_id == current_user.id)
        .all()
    )
    return subs


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe_webhook(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = (
        db.query(WebhookSubscription)
        .filter(
            WebhookSubscription.id == id, WebhookSubscription.user_id == current_user.id
        )
        .first()
    )
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook subscription not found",
        )
    db.delete(sub)
    db.commit()
