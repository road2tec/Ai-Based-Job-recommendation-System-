import re

def clean_alphanumeric(s: str) -> str:
    # Keep only letters and numbers, lowercase
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

def is_skill_matched(req_skill: str, candidate_skills: list) -> bool:
    req_clean = req_skill.strip().lower()
    if not req_clean:
        return False
        
    req_norm = clean_alphanumeric(req_clean)
    if not req_norm:
        return False
        
    for cand_skill in candidate_skills:
        cand_clean = cand_skill.strip().lower()
        if not cand_clean:
            continue
            
        cand_norm = clean_alphanumeric(cand_clean)
        if not cand_norm:
            continue
            
        # 1. Exact match on normalized strings (e.g., "spring boot" vs "springboot")
        if req_norm == cand_norm:
            return True
            
        # 2. Substring match on normalized strings for longer words (length > 2)
        # This allows matching "mysql" with "sql" or "jiratools" with "jira"
        if len(req_norm) > 2 and len(cand_norm) > 2:
            if req_norm in cand_norm or cand_norm in req_norm:
                return True
                
        # 3. Structural aliases where character changes entirely
        # JavaScript -> JS
        js_aliases = {"js", "javascript"}
        if req_clean in js_aliases and cand_clean in js_aliases:
            return True
            
        # C++ -> cpp
        cpp_aliases = {"c++", "cpp"}
        if req_clean in cpp_aliases and cand_clean in cpp_aliases:
            return True

    return False
