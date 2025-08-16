# AI Meeting Notes Summarizer

A full-stack application that uses AI to summarize meeting transcripts and allows sharing via email.

## Features

- Upload text transcripts or paste directly
- Custom AI prompts for different summary styles
- Editable AI-generated summaries
- Email sharing functionality
- Clean, responsive UI

## Tech Stack

- **Backend**: Python with FastAPI, Google Gemini API
- **Frontend**: React with TypeScript and Vite
- **Styling**: Custom CSS with modern design

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- UV (Python package manager)
- Google Gemini API key
- Email credentials (for sharing feature)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies with UV:
```bash
uv sync
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

5. Run the backend server:
```bash
uv run python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Upload Transcript**: Upload a `.txt` file or paste your meeting transcript directly
2. **Set Custom Prompt**: Modify the instruction to customize how the AI summarizes (e.g., "Summarize in bullet points for executives", "Highlight only action items")
3. **Generate Summary**: Click "Generate Summary" to get an AI-powered summary
4. **Edit Summary**: Click "Edit" to modify the generated summary
5. **Share via Email**: Enter recipient emails (comma-separated) and send the summary

## API Endpoints

- `POST /api/upload-transcript` - Upload transcript file
- `POST /api/summarize` - Generate AI summary
- `POST /api/send-email` - Send summary via email
- `GET /` - Health check

## Email Configuration

For Gmail users:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in the `EMAIL_PASSWORD` field

## Development

To run both frontend and backend simultaneously:

```bash
# Terminal 1 - Backend
cd backend && uv run python main.py

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## Security Notes

- Never commit your `.env` file
- Use app-specific passwords for email
- Keep your OpenAI API key secure
- Configure CORS origins appropriately for production