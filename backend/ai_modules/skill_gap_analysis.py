from utils.youtube_helper import get_youtube_links
from utils.skill_utils import is_skill_matched

def analyze_skill_gap(candidate_skills, required_skills):
    # Filter empty/whitespace from required skills and preserve original capitalization
    clean_required = []
    seen = set()
    for s in required_skills:
        if s and s.strip():
            stripped = s.strip()
            lower = stripped.lower()
            if lower not in seen:
                seen.add(lower)
                clean_required.append(stripped)

    # Compute matched and missing keeping original casing using smart match utility
    matched_skills = [s for s in clean_required if is_skill_matched(s, candidate_skills)]
    missing_skills = [s for s in clean_required if not is_skill_matched(s, candidate_skills)]
    
    # Improved learning resource suggestions using YouTube API
    resources = {}
    for skill in missing_skills:
        videos = get_youtube_links(f"{skill} tutorial for beginners")
        if videos:
            resources[skill] = videos
        else:
            # Fallback to direct search link
            resources[skill] = [
                {"title": f"Search for {skill} tutorials", "url": f"https://www.youtube.com/results?search_query={skill.replace(' ', '+')}+tutorial"}
            ]
        
    return {
        "required_skills": clean_required,
        "candidate_skills": candidate_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": resources
    }
