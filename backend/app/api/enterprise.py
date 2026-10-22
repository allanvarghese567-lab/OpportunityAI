"""Phase 6 – Enterprise API: orgs, members, audit, API keys, webhooks."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.enterprise import ApiKey, AuditLog, Membership, Organization, WebhookSubscription
from app.models.user import User
from app.schemas.enterprise import (
    ApiKeyCreate, ApiKeyRead, AuditLogRead, MembershipCreate, MembershipRead,
    OrganizationCreate, OrganizationRead, WebhookCreate, WebhookRead,
)
from app.services.audit import log_action

router = APIRouter(prefix="/enterprise", tags=["enterprise"])
ROLE_RANK = {"viewer": 1, "member": 2, "admin": 3, "owner": 4}


async def _require_membership(db: DbSession, org_id: int, user_id: int, min_role: str = "viewer") -> Membership:
    result = await db.execute(
        select(Membership).where(Membership.organization_id == org_id, Membership.user_id == user_id)
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    if ROLE_RANK.get(membership.role, 0) < ROLE_RANK.get(min_role, 0):
        raise HTTPException(status_code=403, detail=f"Requires at least {min_role} role")
    return membership


@router.post("/organizations", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
async def create_organization(body: OrganizationCreate, db: DbSession, current_user: CurrentUser, request: Request):
    result = await db.execute(select(Organization).where(Organization.slug == body.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already taken")
    org = Organization(name=body.name, slug=body.slug, plan="free")
    db.add(org)
    await db.flush()
    db.add(Membership(organization_id=org.id, user_id=current_user.id, role="owner"))
    await log_action(db, action="organization.created", resource_type="organization", resource_id=str(org.id),
                     user_id=current_user.id, organization_id=org.id, details={"name": body.name, "slug": body.slug},
                     ip_address=request.client.host if request.client else None)
    await db.refresh(org)
    return org


@router.get("/organizations", response_model=List[OrganizationRead])
async def list_my_organizations(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Organization).join(Membership).where(Membership.user_id == current_user.id)
        .order_by(Organization.created_at.desc())
    )
    return result.scalars().all()


@router.get("/organizations/{org_id}", response_model=OrganizationRead)
async def get_organization(org_id: int, db: DbSession, current_user: CurrentUser):
    await _require_membership(db, org_id, current_user.id)
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get("/organizations/{org_id}/members", response_model=List[MembershipRead])
async def list_members(org_id: int, db: DbSession, current_user: CurrentUser):
    await _require_membership(db, org_id, current_user.id)
    result = await db.execute(select(Membership).where(Membership.organization_id == org_id))
    members = result.scalars().all()
    out = []
    for m in members:
        user_result = await db.execute(select(User).where(User.id == m.user_id))
        user = user_result.scalar_one_or_none()
        out.append(MembershipRead(id=m.id, organization_id=m.organization_id, user_id=m.user_id,
                                  role=m.role, created_at=m.created_at, user_email=user.email if user else None))
    return out


@router.post("/organizations/{org_id}/members", response_model=MembershipRead, status_code=status.HTTP_201_CREATED)
async def invite_member(org_id: int, body: MembershipCreate, db: DbSession, current_user: CurrentUser, request: Request):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    result = await db.execute(select(User).where(User.email == body.user_email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. They must register first.")
    result = await db.execute(select(Membership).where(Membership.organization_id == org_id, Membership.user_id == user.id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User is already a member")
    membership = Membership(organization_id=org_id, user_id=user.id, role=body.role)
    db.add(membership)
    await log_action(db, action="membership.created", resource_type="membership", user_id=current_user.id,
                     organization_id=org_id, details={"invited_user_id": user.id, "role": body.role},
                     ip_address=request.client.host if request.client else None)
    await db.flush()
    await db.refresh(membership)
    return MembershipRead(id=membership.id, organization_id=membership.organization_id, user_id=membership.user_id,
                          role=membership.role, created_at=membership.created_at, user_email=user.email)


@router.get("/organizations/{org_id}/audit", response_model=List[AuditLogRead])
async def list_audit_logs(org_id: int, db: DbSession, current_user: CurrentUser, limit: int = 50):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    result = await db.execute(
        select(AuditLog).where(AuditLog.organization_id == org_id).order_by(AuditLog.created_at.desc()).limit(min(limit, 200))
    )
    return result.scalars().all()


@router.post("/organizations/{org_id}/api-keys", response_model=ApiKeyRead, status_code=status.HTTP_201_CREATED)
async def create_api_key(org_id: int, body: ApiKeyCreate, db: DbSession, current_user: CurrentUser, request: Request):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    raw_key = f"oai_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=body.expires_days) if body.expires_days else None
    api_key = ApiKey(organization_id=org_id, created_by=current_user.id, name=body.name,
                     key_prefix=raw_key[:12], key_hash=key_hash, scopes=body.scopes, expires_at=expires_at)
    db.add(api_key)
    await log_action(db, action="api_key.created", resource_type="api_key", user_id=current_user.id,
                     organization_id=org_id, details={"name": body.name, "scopes": body.scopes},
                     ip_address=request.client.host if request.client else None)
    await db.flush()
    await db.refresh(api_key)
    return ApiKeyRead(id=api_key.id, organization_id=api_key.organization_id, name=api_key.name,
                      key_prefix=api_key.key_prefix, scopes=api_key.scopes if isinstance(api_key.scopes, list) else [],
                      is_active=api_key.is_active, last_used_at=api_key.last_used_at, expires_at=api_key.expires_at,
                      created_at=api_key.created_at, raw_key=raw_key)


@router.get("/organizations/{org_id}/api-keys", response_model=List[ApiKeyRead])
async def list_api_keys(org_id: int, db: DbSession, current_user: CurrentUser):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    result = await db.execute(select(ApiKey).where(ApiKey.organization_id == org_id).order_by(ApiKey.created_at.desc()))
    return [ApiKeyRead(id=k.id, organization_id=k.organization_id, name=k.name, key_prefix=k.key_prefix,
                       scopes=k.scopes if isinstance(k.scopes, list) else [], is_active=k.is_active,
                       last_used_at=k.last_used_at, expires_at=k.expires_at, created_at=k.created_at)
            for k in result.scalars().all()]


@router.delete("/organizations/{org_id}/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(org_id: int, key_id: int, db: DbSession, current_user: CurrentUser, request: Request):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    result = await db.execute(select(ApiKey).where(ApiKey.id == key_id, ApiKey.organization_id == org_id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    key.is_active = False
    await log_action(db, action="api_key.revoked", resource_type="api_key", resource_id=str(key_id),
                     user_id=current_user.id, organization_id=org_id,
                     ip_address=request.client.host if request.client else None)


@router.post("/organizations/{org_id}/webhooks", response_model=WebhookRead, status_code=status.HTTP_201_CREATED)
async def create_webhook(org_id: int, body: WebhookCreate, db: DbSession, current_user: CurrentUser, request: Request):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    sub = WebhookSubscription(organization_id=org_id, url=body.url, secret=secrets.token_urlsafe(24), events=body.events)
    db.add(sub)
    await log_action(db, action="webhook.created", resource_type="webhook", user_id=current_user.id,
                     organization_id=org_id, details={"url": body.url, "events": body.events},
                     ip_address=request.client.host if request.client else None)
    await db.flush()
    await db.refresh(sub)
    return WebhookRead(id=sub.id, organization_id=sub.organization_id, url=sub.url,
                       events=sub.events if isinstance(sub.events, list) else [], is_active=sub.is_active, created_at=sub.created_at)


@router.get("/organizations/{org_id}/webhooks", response_model=List[WebhookRead])
async def list_webhooks(org_id: int, db: DbSession, current_user: CurrentUser):
    await _require_membership(db, org_id, current_user.id, min_role="admin")
    result = await db.execute(
        select(WebhookSubscription).where(WebhookSubscription.organization_id == org_id)
        .order_by(WebhookSubscription.created_at.desc())
    )
    return [WebhookRead(id=s.id, organization_id=s.organization_id, url=s.url,
                        events=s.events if isinstance(s.events, list) else [], is_active=s.is_active, created_at=s.created_at)
            for s in result.scalars().all()]
