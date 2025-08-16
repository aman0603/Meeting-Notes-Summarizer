from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List

load_dotenv()

app = FastAPI(title="Meeting Notes Summarizer API")

# Configure CORS - simplified for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class SummaryRequest(BaseModel):
    text: str
    prompt: str

class EmailRequest(BaseModel):
    summary: str
    recipients: List[str]
    subject: str = "Meeting Summary Report"

@app.post("/api/summarize")
async def summarize_text(request: SummaryRequest):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
You are an expert executive assistant. Follow the user's instruction exactly: "{request.prompt}"

Rules:
- Follow the user's instruction precisely and provide appropriate detail level
- If they ask for "executive summary" or "bullet points for executives", provide comprehensive executive-level information with proper sections
- If they ask for specific items only (like "action items only"), provide ONLY those items
- If they ask for "brief" or "short", keep it concise
- Format in plain text (no asterisks or markdown symbols)
- Use numbered lists instead of bullet points
- Include relevant sections like Discussion Points, Decisions, Action Items, Next Steps when doing full summaries
- For action items, format as: "Person: Task description (Due: Date)" - always include the due date in parentheses
- If no specific deadline is mentioned, use "Due: TBD"

Transcript:
{request.text}
"""
        
        response = model.generate_content(prompt)
        summary = response.text
        
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/api/upload-transcript")
async def upload_transcript(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode('utf-8')
        return {"text": text, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    try:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASSWORD")
        
        print(f"Attempting to send email from: {email_user}")
        print(f"SMTP server: {smtp_server}:{smtp_port}")
        print(f"Recipients: {request.recipients}")
        
        if not email_user or not email_password:
            raise HTTPException(status_code=500, detail="Email credentials not configured")
        
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = ", ".join(request.recipients)
        msg['Subject'] = request.subject

        # 🔹 Dynamic intro line based on prompt
        # We pull a hint from subject if provided, else default to "meeting summary"
        prompt_hint = request.subject.replace("Meeting Summary Report", "").strip()
        if not prompt_hint:
            prompt_hint = "meeting summary"

        body = f"""Dear Team,

Please find below the {prompt_hint.lower()}:

{request.summary}

Best regards,
AI Meeting Notes Summarizer

---
This summary was automatically generated using AI technology."""

        msg.attach(MIMEText(body, 'plain'))
        
        print("Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        print("Starting TLS...")
        server.starttls()
        print("Attempting login...")
        server.login(email_user, email_password)
        print("Sending email...")
        text = msg.as_string()
        server.sendmail(email_user, request.recipients, text)
        server.quit()
        
        print("Email sent successfully!")
        return {"message": "Email sent successfully"}
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email authentication failed. Please check your app password: {str(e)}")
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SMTP error: {str(e)}")
    except Exception as e:
        print(f"General Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Meeting Notes Summarizer API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
