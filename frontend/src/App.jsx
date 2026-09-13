import { useState } from 'react'
import axios from 'axios'
import './App.css'

export default function App() {
  const [file, setFile] = useState(null)
  const [modelName, setModelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  const handleAudit = async (e) => {
    e.preventDefault()
    if (!file) return alert('Please upload a file (.pdf, .txt, .md).')

    setLoading(true)
    setError('')
    setReport(null)

    const formData = new FormData()
    formData.append('file', file)
    if (modelName) formData.append('modelName', modelName)

    try {
      const res = await axios.post('http://localhost:8080/api/audit', formData)
      setReport(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error running audit. Ensure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>🛡️ Aegis: AI Governance & Safety Auditor</h2>
      <p style={{ color: '#666' }}>Upload model documentation to evaluate safety and regulatory compliance.</p>

      <form onSubmit={handleAudit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Model Name (e.g., LLaMA-3-8B)"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            style={{ width: '95%', marginBottom: '12px' }}
          />
          <br />
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Auditing Documentation with Groq...' : 'Run Audit'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}

      {report && (
        <div className="report-card">
          <h3>Audit Results: {report.modelName}</h3>
          <p>
            <strong>Overall Score:</strong> {report.overallScore}/100 &nbsp;|&nbsp;
            <strong> Risk Level:</strong> <span className="badge">{report.riskLevel}</span>
          </p>

          <div className="grid">
            <div className="box">
              <h4>🔒 Privacy: {report.privacy?.score}/100</h4>
              <p>{report.privacy?.findings}</p>
            </div>
            <div className="box">
              <h4>⚖️ Fairness: {report.fairness?.score}/100</h4>
              <p>{report.fairness?.findings}</p>
            </div>
            <div className="box">
              <h4>🛡️ Safety: {report.safety?.score}/100</h4>
              <p>{report.safety?.findings}</p>
            </div>
            <div className="box">
              <h4>📊 Training Data: {report.trainingData?.score}/100</h4>
              <p>{report.trainingData?.findings}</p>
            </div>
          </div>

          <h4>Identified Weaknesses</h4>
          <ul>
            {report.identifiedWeaknesses?.map((item, idx) => (
              <li key={idx}>⚠️ {item}</li>
            ))}
          </ul>

          <h4>Recommendations</h4>
          <ul>
            {report.recommendations?.map((item, idx) => (
              <li key={idx}>✅ {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}