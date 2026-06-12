from fastapi import APIRouter
from pydantic import BaseModel
from google import genai
from config import settings

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Initialize the new Google GenAI client
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class ChatMessage(BaseModel):
    message: str

@router.post("/ask")
def chat_with_bot(payload: ChatMessage):
    user_msg = payload.message
    
    try:
        # Using the new API call structure
        prompt = f"""
        You are an expert AI Interview Coach for a premium Job Portal. 
        Your goal is to help candidates prepare for job interviews.
        Be professional, encouraging, and provide specific advice.
        If the user asks a question, answer it. If they want to practice, ask them a role-specific interview question.
        
        User Message: {user_msg}
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        reply = response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        reply = "I'm sorry, I'm having trouble thinking right now. Could you try again later?"
        
    return {"reply": reply}
