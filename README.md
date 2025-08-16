# 🎯 AI Meeting Notes Summarizer

<div align="center">

An intelligent meeting notes application that transforms lengthy transcripts into actionable summaries using Google's Gemini AI.

[Live Demo](https://meeting-notes-summarizer-lime.vercel.app) 

</div>

---

## Features

### Smart Transcript Processing
- **Multiple Input Methods**: Upload `.txt` files or paste transcripts directly
- **Flexible Summarization**: Customize AI prompts for different summary styles
- **Real-time Processing**: Fast AI-powered summarization using Gemini 2.0

### Intuitive User Interface
- **Modern Design**: Clean, gradient-based UI with smooth animations
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Live Editing**: Edit generated summaries before sharing

### Professional Sharing
- **Email Integration**: Send summaries to multiple recipients
- **Custom Templates**: Professional email formatting
- **Bulk Recipients**: Support for comma-separated email lists

### Developer Friendly
- **RESTful API**: Well-documented endpoints
- **Type Safety**: Full TypeScript support
- **Easy Deployment**: Ready for cloud deployment

---

## Quick Start

### Prerequisites

Ensure you have the following installed:
- **Python** 3.8 or higher
- **Node.js** 18 or higher
- **Git** for version control

### 1 Clone the Repository

```bash
git clone https://github.com/aman0603/Meeting-Notes-Summarizer.git
cd Meeting-Notes-Summarizer
```

### 2 Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (choose one)
pip install -r requirements.txt  # Using pip
# OR
uv sync  # Using uv (recommended)

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the server
python main.py  # Runs on http://localhost:8000
```

### 3 Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev  # Runs on http://localhost:5173
```

---

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

## Usage Guide

### Basic Workflow

1. **Upload or Paste Transcript**
   - Click "Choose File" to upload a `.txt` file
   - Or paste your transcript in the text area

2. **Customize Summary Style**
   - Use preset prompts or create custom ones:
     - "Summarize in bullet points for executives"
     - "Extract only action items"
     - "Key updates and risks"
     - "Brief summary with decisions"

3. **Generate and Edit**
   - Click "Generate Summary" to process
   - Edit the generated summary if needed
   - Save your changes

4. **Share via Email**
   - Enter recipient emails (comma-separated)
   - Customize the email subject
   - Click "Send Email" to share

### Advanced Features

#### Custom Prompts
The AI responds intelligently to specific instructions:
- **"Action items only"** → Returns formatted action items with due dates
- **"Key risks"** → Highlights potential issues and blockers
- **"Executive summary"** → Provides high-level overview with sections

#### Batch Processing
- Process multiple transcripts sequentially
- Maintain consistent formatting across summaries
- Export summaries for documentation

---

## Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   React Frontend│────▶│  FastAPI Backend│────▶│   Gemini AI    │
│   (TypeScript)  │     │    (Python)     │     │     API         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Vercel CDN    │     │   SMTP Server   │
│   (Frontend)    │     │    (Email)      │
└─────────────────┘     └─────────────────┘
```

### Tech Stack Details

#### Backend
- **FastAPI**: High-performance async web framework
- **Uvicorn**: Lightning-fast ASGI server
- **Google Generative AI**: Gemini 2.0 Flash for summarization
- **Python-Multipart**: File upload handling
- **Python-Dotenv**: Environment management

#### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Next-generation frontend tooling
- **CSS3**: Custom styling with gradients and animations

---

## API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: `https://meeting-notes-summarizer.onrender.com`

### Endpoints

#### Upload Transcript
```http
POST /api/upload-transcript
Content-Type: multipart/form-data

file: transcript.txt
```

**Response:**
```json
{
  "text": "Meeting transcript content...",
  "filename": "transcript.txt"
}
```

#### Generate Summary
```http
POST /api/summarize
Content-Type: application/json

{
  "text": "Meeting transcript...",
  "prompt": "Summarize in bullet points"
}
```

**Response:**
```json
{
  "summary": "Generated summary..."
}
```

#### Send Email
```http
POST /api/send-email
Content-Type: application/json

{
  "summary": "Meeting summary...",
  "recipients": ["email1@example.com", "email2@example.com"],
  "subject": "Meeting Summary Report"
}
```

**Response:**
```json
{
  "message": "Email sent successfully"
}
```

---

## Deployment

### Option 1: Vercel + Render (Recommended)

#### Deploy Backend to Render
1. Fork this repository
2. Create account at [Render](https://render.com)
3. New Web Service → Connect GitHub repo
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

#### Deploy Frontend to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `cd frontend && vercel`
3. Follow prompts to deploy

### Option 2: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000 (frontend) and http://localhost:8000 (backend)
```


## Testing

### Run Backend Tests
```bash
cd backend
pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



<div align="center">
Made with ❤️ by <a href="https://github.com/aman0603">Aman Paswan</a>
</div>