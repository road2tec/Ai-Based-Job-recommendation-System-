from fastapi import APIRouter, HTTPException, Depends
from database import users_collection, jobs_collection, companies_collection, applications_collection

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/dashboard")
def get_dashboard_stats():
    total_users = users_collection.count_documents({})
    total_jobs = jobs_collection.count_documents({})
    total_companies = companies_collection.count_documents({})
    total_applications = applications_collection.count_documents({})
    total_shortlisted = applications_collection.count_documents({"status": "Shortlisted"})
    
    # Generate recent activity dynamically
    recent_activity = []
    
    # recent users
    latest_users = list(users_collection.find({}, {"_id": 0, "name": 1, "created_at": 1}).sort("created_at", -1).limit(3))
    for u in latest_users:
        if "created_at" in u:
            time_diff = __import__("datetime").datetime.utcnow() - u["created_at"]
            if time_diff.days > 0:
                time_str = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                time_str = f"{time_diff.seconds // 3600} hours ago"
            else:
                time_str = f"{time_diff.seconds // 60} min ago"
            recent_activity.append({"title": f"New user signup: {u.get('name', 'User')}", "time": time_str, "timestamp": u["created_at"]})
            
    # recent jobs
    latest_jobs = list(jobs_collection.find({}, {"title": 1}).sort("_id", -1).limit(3))
    for j in latest_jobs:
        if "_id" in j:
            # mock time based on objectid since jobs don't implicitly have created_at
            created_at = j["_id"].generation_time.replace(tzinfo=None)
            time_diff = __import__("datetime").datetime.utcnow() - created_at
            if time_diff.days > 0:
                time_str = f"{time_diff.days} days ago"
            elif time_diff.seconds > 3600:
                time_str = f"{time_diff.seconds // 3600} hours ago"
            else:
                time_str = f"{time_diff.seconds // 60} min ago"
            recent_activity.append({"title": f"New Job: {j.get('title', 'Job')}", "time": time_str, "timestamp": created_at})
            
    recent_activity = sorted(recent_activity, key=lambda x: x["timestamp"], reverse=True)[:5]
    for act in recent_activity:
        del act["timestamp"]

    return {
        "total_ کاربران": total_users, # keeping keys simple
        "total_users": total_users,
        "total_jobs": total_jobs,
        "total_companies": total_companies,
        "total_applications": total_applications,
        "total_shortlisted": total_shortlisted,
        "recent_activity": recent_activity
    }

@router.get("/jobs")
def get_all_jobs():
    jobs = list(jobs_collection.find({}, {"_id": 0}))
    return jobs

@router.get("/jobs/{job_id}")
def get_job_by_id(job_id: str):
    job = jobs_collection.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.delete("/jobs/{job_id}")
def delete_spam_job(job_id: str):
    res = jobs_collection.delete_one({"job_id": job_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

@router.get("/users")
def get_users():
    users = list(users_collection.find({}, {"_id": 0, "password": 0}))
    return users

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    res = users_collection.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.put("/users/{user_id}/verify")
def verify_user(user_id: str):
    res = users_collection.update_one({"id": user_id}, {"$set": {"is_verified": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User verified successfully"}

@router.get("/shortlisted")
def get_all_shortlisted():
    apps = list(applications_collection.find({"status": "Shortlisted"}, {"_id": 0}))
    for app in apps:
        user = users_collection.find_one({"id": app["candidate_id"]}, {"_id": 0, "password": 0})
        job = jobs_collection.find_one({"job_id": app["job_id"]}, {"_id": 0})
        app["user"] = user
        app["job"] = job
    return apps
