from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from .enums import Role

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique identifier for the user (CUID)")
    email: EmailStr = Field(..., description="User's email address")
    hashed_password: Optional[str] = Field(None, alias="hashedPassword", description="Hashed password for authentication")
    email_verified: bool = Field(False, alias="emailVerified", description="Whether the email has been verified")
    email_verified_at: Optional[datetime] = Field(None, alias="emailVerifiedAt", description="Timestamp of email verification")
    created_at: datetime = Field(..., alias="createdAt", description="Record creation timestamp")
    updated_at: datetime = Field(..., alias="updatedAt", description="Record last update timestamp")
    last_login_at: Optional[datetime] = Field(None, alias="lastLoginAt", description="Last login timestamp")
    
    is_banned: bool = Field(False, alias="isBanned", description="Whether the user is banned")
    banned_at: Optional[datetime] = Field(None, alias="bannedAt", description="Timestamp when the user was banned")
    banned_reason: Optional[str] = Field(None, alias="bannedReason", description="Reason for the ban")
