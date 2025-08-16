import { useState } from 'react'
import './App.css'

interface SummaryData {
  text: string
  summary: string
  isEditing: boolean
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState('')
  const [prompt, setPrompt] = useState('Summarize in bullet points for executives')
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [recipients, setRecipients] = useState('')
  const [emailSubject, setEmailSubject] = useState('Meeting Summary Report')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (!uploadedFile) return
    setFile(uploadedFile)

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('http://localhost:8000/api/upload-transcript', {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        const data = await response.json()
        setTranscript(data.text)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript, prompt })
      })
      if (response.ok) {
        const data = await response.json()
        setSummaryData({ text: transcript, summary: data.summary, isEditing: false })
      }
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSummary = () => {
    if (summaryData) setSummaryData({ ...summaryData, isEditing: true })
  }

  const handleSaveSummary = () => {
    if (summaryData) setSummaryData({ ...summaryData, isEditing: false })
  }

  const handleSummaryChange = (value: string) => {
    if (summaryData) setSummaryData({ ...summaryData, summary: value })
  }

  const handleSendEmail = async () => {
    if (!summaryData || !recipients.trim()) return
    const recipientList = recipients.split(',').map(email => email.trim())
    try {
      const response = await fetch('http://localhost:8000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: summaryData.summary,
          recipients: recipientList,
          subject: emailSubject
        })
      })
      if (response.ok) {
        alert('Email sent successfully!')
        setRecipients('')
      } else {
        alert('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error sending email')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Meeting Notes Summarizer</h1>
        <p>Upload transcripts and generate executive-ready summaries</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Upload Transcript</h2>
          <input type="file" accept=".txt" onChange={handleFileUpload} className="file-input" />
          {file && <p className="file-name">Uploaded: {file.name}</p>}

          <label htmlFor="transcript">Or paste transcript directly:</label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            rows={6}
          />
        </section>

        <section className="card">
          <h2>Custom Instructions</h2>
          <label htmlFor="prompt">Enter your summarization preferences:</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Summarize in bullet points for executives"
          />
          <button
            onClick={handleGenerateSummary}
            disabled={!transcript.trim() || loading}
            className="primary-btn"
          >
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </section>

        {summaryData && (
          <section className="card">
            <div className="summary-header">
              <h2>Generated Summary</h2>
              {!summaryData.isEditing ? (
                <button onClick={handleEditSummary} className="secondary-btn">Edit Summary</button>
              ) : (
                <button onClick={handleSaveSummary} className="primary-btn">Save Changes</button>
              )}
            </div>

            {summaryData.isEditing ? (
              <textarea
                value={summaryData.summary}
                onChange={(e) => handleSummaryChange(e.target.value)}
                rows={12}
                className="summary-textarea"
              />
            ) : (
              <div className="summary-display">
                {summaryData.summary.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {summaryData && (
          <section className="card email-section">
            <h2>Share via Email</h2>
            <div>
              <label htmlFor="email-subject">Email Subject:</label>
              <input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Meeting Summary Report"
              />
            </div>
            <div>
              <label htmlFor="recipients">Recipients (comma-separated):</label>
              <input
                id="recipients"
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="john@company.com, sarah@company.com"
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={!recipients.trim()}
              className="primary-btn"
            >
              Send Email
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
