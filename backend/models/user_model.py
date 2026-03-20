from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., description="Role must be 'admin', 'employer', or 'candidate'")
    organization_name: Optional[str] = None
    address: Optional[str] = None
    contact_number: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateProfile(BaseModel):
    user_id: str
    skills: List[str] = []
    education: List[str] = []
    experience: List[str] = []
    resume_path: Optional[str] = None

class CompanyProfile(BaseModel):
    user_id: str
    company_name: str
    industry: str
    description: str

class OTPVerify(BaseModel):
    email: str
    otp: str
