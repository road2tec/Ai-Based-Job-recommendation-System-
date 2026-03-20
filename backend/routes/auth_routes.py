from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from datetime import timedelta
import uuid

from models.user_model import UserCreate, UserLogin, UserResponse, OTPVerify
from database import users_collection, candidates_collection, companies_collection
from utils.auth_utils import hash_password, verify_password, create_access_token
from utils.email_utils import send_otp_email
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user.password)
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.utcnow()
    
    # Verification for employers
    if user.role == "employer":
        user_dict["is_verified"] = False
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        user_dict["otp"] = otp
        user_dict["otp_expiry"] = datetime.utcnow() + timedelta(minutes=10)
        # Send Email
        send_otp_email(user.email, otp)
    else:
        user_dict["is_verified"] = True
    
    users_collection.insert_one(user_dict)
    
    # Initialize appropriate profile
    if user.role == "candidate":
        candidates_collection.insert_one({"user_id": user_dict["id"], "skills": [], "education": [], "experience": []})
    elif user.role == "employer":
        companies_collection.insert_one({
            "user_id": user_dict["id"], 
            "company_name": user.organization_name or f"{user.name}'s Company", 
            "address": user.address or "",
            "contact_number": user.contact_number or "",
            "industry": "", 
            "description": ""
        })
        
    return user_dict

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    if db_user.get("role") == "employer" and not db_user.get("is_verified", True):
        # Check if OTP exists
        if db_user.get("otp"):
            raise HTTPException(status_code=403, detail="Please verify your email with the OTP sent during registration.")
        raise HTTPException(status_code=403, detail="Profile is under verification by Admin. Please wait for approval.")

        
    access_token = create_access_token(data={"sub": db_user["id"], "role": db_user["role"]})
    return {"access_token": access_token, "token_type": "bearer", "role": db_user["role"], "id": db_user["id"], "name": db_user["name"]}

@router.post("/verify-otp")
def verify_otp(data: OTPVerify):
    user = users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("is_verified"):
        return {"message": "User already verified"}
    
    if user.get("otp") != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.utcnow() > user.get("otp_expiry"):
        raise HTTPException(status_code=400, detail="OTP has expired")
    
    # Verify user
    users_collection.update_one(
        {"email": data.email},
        {"$set": {"is_verified": True}, "$unset": {"otp": "", "otp_expiry": ""}}
    )
    
    return {"message": "Email verified successfully. You can now log in."}

@router.post("/resend-otp")
def resend_otp(payload: dict):
    email = payload.get("email")
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("is_verified"):
        return {"message": "User already verified"}
    
    otp = str(random.randint(100000, 999999))
    expiry = datetime.utcnow() + timedelta(minutes=10)
    
    users_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "otp_expiry": expiry}}
    )
    
    send_otp_email(email, otp)
    return {"message": "OTP sent successfully"}
