from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from pydantic import BaseModel
from database import candidates_collection, jobs_collection, applications_collection, users_collection
from utils.file_upload import save_upload_file
from ai_modules.resume_parser import parse_resume
from ai_modules.recommendation_engine import recommend_jobs_tfidf
from ai_modules.skill_gap_analysis import analyze_skill_gap
from bson import ObjectId
import uuid
import datetime

router = APIRouter(prefix="/api/candidate", tags=["candidate"])

@router.get("/profile/{user_id}")
def get_candidate_profile(user_id: str):
    candidate = candidates_collection.find_one({"user_id": user_id}, {"_id": 0})
    user = users_collection.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        user = users_collection.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
    res = {
        "name": user.get("name") if user else "",
        "email": user.get("email") if user else "",
        "contact_number": user.get("contact_number") if user else "",
        "bio": candidate.get("bio", "") if candidate else "",
        "resume_path": candidate.get("resume_path", "") if candidate else "",
        "alternate_email": candidate.get("alternate_email", "") if candidate else "",
        "skills": candidate.get("skills", []) if candidate else [],
        "education": candidate.get("education", []) if candidate else [],
        "experience": candidate.get("experience", []) if candidate else [],
        "certifications": candidate.get("certifications", []) if candidate else []
    }
    return res

class ProfileUpdate(BaseModel):
    name: str = None
    contact_number: str = None
    alternate_email: str = None
    bio: str = None
    skills: list[str] = None
    education: list[str] = None
    experience: list[str] = None
    certifications: list[str] = None

@router.put("/profile/{user_id}")
def update_candidate_profile(user_id: str, profile_data: ProfileUpdate):
    data = profile_data.dict()
    print(f"DEBUG: Updating profile for user_id: {user_id}")
    print(f"DEBUG: Data received: {data}")
    
    # Update user data (name, contact) in users_collection
    user_updates = {}
    if data.get("name") is not None: user_updates["name"] = data["name"]
    if data.get("contact_number") is not None: user_updates["contact_number"] = data["contact_number"]

    if user_updates:
        print(f"DEBUG: Updating users_collection with: {user_updates}")
        users_collection.update_many({"id": user_id}, {"$set": user_updates})
        users_collection.update_many({"user_id": user_id}, {"$set": user_updates})
        
    # Update candidate profile data
    candidate_updates = {k: v for k, v in data.items() if k not in ["name", "contact_number", "email"] and v is not None}
    
    if candidate_updates:
        print(f"DEBUG: Updating candidates_collection with: {candidate_updates}")
        res = candidates_collection.update_one(
            {"user_id": user_id},
            {"$set": candidate_updates},
            upsert=True
        )
        print(f"DEBUG: DB update result - matched: {res.matched_count}, modified: {res.modified_count}, upsert_id: {res.upserted_id}")
    
    return {"message": "Profile updated successfully"}

@router.post("/upload-resume/{user_id}")
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    file_path = save_upload_file(file)
    parsed_data = parse_resume(file_path)
    
    candidates_collection.update_one(
        {"user_id": user_id},
        {"$set": {
            "resume_path": file_path,
            "skills": parsed_data["skills"],
            "education": parsed_data["education"],
            "experience": parsed_data["experience"],
            "certifications": parsed_data["certifications"]
        }},
        upsert=True
    )
    return {"message": "Resume uploaded and parsed successfully", "data": parsed_data}

@router.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    candidate = candidates_collection.find_one({"user_id": user_id})
    if not candidate or not candidate.get("skills"):
        raise HTTPException(status_code=400, detail="Candidate skills not found. Please upload resume first.")
        
    jobs_cursor = jobs_collection.find()
    jobs = list(jobs_cursor)
    
    # Needs to adapt jobs for the recommendation engine
    formatted_jobs = [{"id": str(job["_id"]), "title": job["title"], "required_skills": job["required_skills"], "job_id": job.get("job_id", "")} for job in jobs]
    
    recommended = recommend_jobs_tfidf(candidate["skills"], formatted_jobs)
    
    # Retrieve full job details for recommendations
    full_recs = []
    for rec in recommended:
        job_full = jobs_collection.find_one({"_id": ObjectId(rec["id"])})
        if job_full:
            job_full["_id"] = str(job_full["_id"])
            job_full["ai_match_score"] = rec["ai_match_score"]
            job_full["match_percentage"] = rec["match_percentage"]
            full_recs.append(job_full)
        
    # Sort by literal match percentage in descending order
    full_recs = sorted(full_recs, key=lambda x: x.get("match_percentage", 0), reverse=True)
    return full_recs

@router.get("/skill-gap/{user_id}/{job_id}")
def get_skill_gap(user_id: str, job_id: str):
    candidate = candidates_collection.find_one({"user_id": user_id})
    job = jobs_collection.find_one({"job_id": job_id})
    
    if not candidate or not job:
        raise HTTPException(status_code=404, detail="Candidate or Job not found")
        
    gap_analysis = analyze_skill_gap(candidate.get("skills", []), job.get("required_skills", []))
    return gap_analysis

@router.post("/apply")
def apply_to_job(application: dict):
    # application format: {"job_id": "...", "candidate_id": "...", "match_score": 85.0}
    app_id = str(uuid.uuid4())
    app_data = {
        "application_id": app_id,
        "job_id": application["job_id"],
        "candidate_id": application["candidate_id"],
        "match_score": application.get("match_score", 0),
        "status": "Applied",
        "created_at": datetime.datetime.utcnow()
    }
    applications_collection.insert_one(app_data)
    return {"message": "Applied successfully", "application_id": app_id}

@router.get("/applications/{user_id}")
def get_my_applications(user_id: str):
    apps = list(applications_collection.find({"candidate_id": user_id}, {"_id": 0}))
    for app in apps:
        job = jobs_collection.find_one({"job_id": app["job_id"]})
        if job:
            app["job_title"] = job.get("title")
            app["company_name"] = job.get("company_name", "Unknown")
    return apps
