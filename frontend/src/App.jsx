import { useState } from 'react'
import axios from 'axios'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import {
  Shield,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  BookOpen
} from 'lucide-react'
import AboutPage from './components/AboutPage'
import './App.css'

const MODEL_OPTIONS = [
  { label: '✨ Google Gemini 3.6 Flash (1M Context - Recommended)', provider: 'gemini', model: 'gemini-3.6-flash' },
  { label: '⚡ Google Gemini 3.5 Flash (1M Context - Fast)', provider: 'gemini', model: 'gemini-3.5-flash' },
  { label: '🚀 Groq: GPT OSS 120B (High Speed)', provider: 'groq', model: 'openai/gpt-oss-120b' },
  { label: '🪶 Groq: GPT OSS 20B (Lightweight)', provider: 'groq', model: 'openai/gpt-oss-20b' }
]

function AegisLogo() {
  return (
    <div className="aegis-brand-group">
      <div className="aegis-logo-mark">
        <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="aegisShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="aegisCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <filter id="aegisShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1d4ed8" floodOpacity="0.3" />
            </filter>
          </defs>
          {/* Main Shield Plate */}
          <path
            d="M18 3L4.5 8.5V17C4.5 25.2 10.3 32.5 18 34.5C25.7 32.5 31.5 25.2 31.5 17V8.5L18 3Z"
            fill="url(#aegisShieldGrad)"
            stroke="#93c5fd"
            strokeWidth="1.2"
            filter="url(#aegisShadow)"
          />
          {/* Geometric AI Diamond Core */}
          <path
            d="M18 9.5L24 16L18 22.5L12 16L18 9.5Z"
            fill="url(#aegisCoreGrad)"
          />
          <path
            d="M18 12.5L21.2 16L18 19.5L14.8 16L18 12.5Z"
            fill="#1e3a8a"
          />
          {/* Security Base Dot */}
          <circle cx="18" cy="27" r="1.6" fill="#ffffff" />
        </svg>
      </div>
      <div className="aegis-brand-titles">
        <div className="aegis-title-row">
          <span className="aegis-wordmark">AEGIS</span>
          <span className="aegis-badge-pill">AI GOVERNANCE</span>
        </div>
        <span className="aegis-subtext">Safety & Regulatory Compliance Auditor</span>
      </div>
    </div>
  )
}

export default function App() {
  const [file, setFile] = useState(null)
  const [modelName, setModelName] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].model)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null) // Initially null as requested
  const [error, setError] = useState('')
  const [pillarFilter, setPillarFilter] = useState('ALL')
  const [expandedDetails, setExpandedDetails] = useState({})
  const [activeTab, setActiveTab] = useState('auditor') // 'auditor' or 'about'

  const handleAudit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please upload a model documentation file (.pdf, .txt, .md).')
      return
    }

    setLoading(true)
    setError('')

    const currentOpt = MODEL_OPTIONS.find(o => o.model === selectedModel) || MODEL_OPTIONS[0]
    const formData = new FormData()
    formData.append('file', file)
    if (modelName) formData.append('modelName', modelName)
    formData.append('provider', currentOpt.provider)
    formData.append('selectedModel', currentOpt.model)

    try {
      const res = await axios.post('http://127.0.0.1:8080/api/audit', formData)
      setReport(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error running audit. Ensure backend is active.')
    } finally {
      setLoading(false)
    }
  }

  // Ensure metric counters read correctly from backend DTO (Never zero)
  const displayPages = report?.pageCount || 1
  const displayChars = report?.characterCount || report?.charCount || 0
  const displayTokens = Math.round(displayChars / 4)

  const chartData = report ? [
    { category: 'Training Data', score: report.trainingData?.score || 0 },
    { category: 'Privacy', score: report.privacy?.score || 0 },
    { category: 'Fairness', score: report.fairness?.score || 0 },
    { category: 'Transparency', score: report.modelTransparency?.score || 0 },
    { category: 'Evaluation', score: report.evaluation?.score || 0 },
    { category: 'Safety', score: report.safetySecurity?.score || 0 },
    { category: 'Reproducibility', score: report.reproducibility?.score || 0 }
  ] : []

  const getScoreColor = (score) => {
    if (score >= 75) return '#16a34a' // Green
    if (score >= 50) return '#d97706' // Amber
    return '#dc2626'                  // Red
  }

  const getStatusBadge = (status) => {
    const s = status || 'FAIL'
    if (s === 'PASS') return <span className="status-badge pass">PASS</span>
    if (s === 'REVIEW_REQUIRED') return <span className="status-badge review">REVIEW NEEDED</span>
    return <span className="status-badge fail">FAIL</span>
  }

  const rawPillars = report ? [
    report.trainingData,
    report.privacy,
    report.fairness,
    report.modelTransparency,
    report.evaluation,
    report.safetySecurity,
    report.reproducibility
  ].filter(Boolean) : []

  // Filter pillars based on selected category tab
  const filteredPillars = rawPillars.filter(p => {
    if (pillarFilter === 'ALL') return true
    return p.categoryName.toLowerCase().includes(pillarFilter.toLowerCase())
  })

  const toggleDetails = (idx) => {
    setExpandedDetails(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="aegis-app-wrapper">
      {/* ================================================================
          TOPBAR: AEGIS LOGO, TAB NAVIGATION & ENGINE STATUS
          ================================================================ */}
      <header className="aegis-header">
        <div className="header-inner">
          <AegisLogo />

          <nav className="header-nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'auditor' ? 'active' : ''}`}
              onClick={() => setActiveTab('auditor')}
            >
              <Shield size={15} />
              <span>Audit Dashboard</span>
            </button>
            <button
              className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <BookOpen size={15} />
              <span>How It Works & Glossary</span>
            </button>
          </nav>

          <div className="header-meta-group">
            <div className="regulatory-pills">
              <span className="framework-pill">NIST AI RMF</span>
              <span className="framework-pill">ISO 42001</span>
              <span className="framework-pill">EU AI ACT</span>
            </div>

            <div className="live-status-pill">
              <span className="live-dot"></span>
              <span className="live-text">Auditor Engine Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN VIEWPORT CONTAINER
          ================================================================ */}
      <main className="dashboard-content">
        {activeTab === 'about' ? (
          <AboutPage onGoToAudit={() => setActiveTab('auditor')} />
        ) : (
          <>
            {/* Compact Upload & Model Selector Bar */}
        <section className="audit-action-bar">
          <form onSubmit={handleAudit} className="audit-form-row">
            <input
              type="text"
              placeholder="Model / Paper Name (e.g., The Llama 3 Herd of Models)"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="text-input"
            />

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-input"
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.model} value={opt.model}>
                  {opt.label}
                </option>
              ))}
            </select>

            <label className="file-upload-btn">
              <UploadCloud size={16} color="#2563eb" />
              <span className="file-label-text">
                {file ? file.name : 'Choose Model Card (.pdf, .txt, .md)'}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0])
                    if (!modelName) {
                      setModelName(e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
                    }
                  }
                }}
                style={{ display: 'none' }}
              />
            </label>

            <button type="submit" className="run-audit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Auditing Documentation...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Run Governance Audit</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="error-callout">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="error-close-btn">
                <X size={14} />
              </button>
            </div>
          )}
        </section>

        {/* Loading State Banner */}
        {loading && (
          <div className="empty-state-card auditing">
            <div className="empty-icon-wrap spinning">
              <Sparkles size={36} color="#2563eb" className="animate-spin" />
            </div>
            <h3 className="empty-title">Auditing Model Documentation...</h3>
            <p className="empty-subtitle">
              Extracting text streams, validating governance disclosures, and grading regulatory compliance across all 7 pillars.
            </p>
          </div>
        )}

        {/* Empty State when no document has been audited yet */}
        {!loading && !report && (
          <div className="empty-state-card">
            <div className="empty-icon-wrap">
              <Shield size={38} color="#2563eb" strokeWidth={2} />
            </div>
            <h3 className="empty-title">Ready for Governance Audit</h3>
            <p className="empty-subtitle">
              Select an evaluation engine above, choose your model card (.pdf, .txt, .md), and click <strong>Run Governance Audit</strong> to generate the comprehensive 7-pillar compliance report.
            </p>
            <div className="empty-tags-row">
              <span className="empty-tag">📄 Automated Text Extraction</span>
              <span className="empty-tag">📊 7-Pillar Multi-Metric Scoring</span>
              <span className="empty-tag">🛡️ Red-Teaming & Safety Analysis</span>
              <span className="empty-tag">📑 Document-Backed Regulatory Evidence</span>
            </div>
          </div>
        )}

        {/* Render Full Report Workspace when an audit report exists */}
        {!loading && report && (
          <div className="report-body">
            {/* ==========================================================
                1. EXECUTIVE OVERVIEW BANNER
                ========================================================== */}
            <div className="executive-banner">
              <div className="banner-details">
                <div className="verdict-tag-row">
                  <span className="verdict-tag">{report.regulatoryVerdict}</span>
                </div>
                <h2 className="model-title">{report.modelName}</h2>
                <p className="summary-text">{report.summaryOverview}</p>
              </div>

              <div className="banner-score-card">
                <div className="score-circle" style={{ borderColor: getScoreColor(report.overallScore) }}>
                  <span className="score-val" style={{ color: getScoreColor(report.overallScore) }}>
                    {report.overallScore}
                  </span>
                  <span className="score-max">/ 100</span>
                </div>
                <div className="risk-tag" style={{ background: getScoreColor(report.overallScore) }}>
                  {report.riskLevel} Risk Level
                </div>
              </div>
            </div>

            {/* ==========================================================
                2. COMPACT STAT PILLS / METRIC COUNTERS (Never Zeros)
                ========================================================== */}
            <div className="metric-counters-grid">
              <div className="metric-card">
                <div className="metric-icon">📄</div>
                <div className="metric-info">
                  <span className="metric-label">Total Document Pages</span>
                  <span className="metric-value">{displayPages} {displayPages === 1 ? 'Page' : 'Pages'}</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🔤</div>
                <div className="metric-info">
                  <span className="metric-label">Extracted Characters</span>
                  <span className="metric-value">{displayChars.toLocaleString()} chars</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-info">
                  <span className="metric-label">Analyzed Token Volume</span>
                  <span className="metric-value">~{displayTokens.toLocaleString()} tokens</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">🛡️</div>
                <div className="metric-info">
                  <span className="metric-label">Regulatory Coverage</span>
                  <span className="metric-value text-green">7 Pillars Evaluated</span>
                </div>
              </div>
            </div>

            {/* ==========================================================
                3. FIXED SIDE-BY-SIDE CHARTS SECTION
                ========================================================== */}
            <div className="fixed-charts-grid">
              <div className="chart-panel">
                <div className="chart-title-bar">
                  <h3>7-Pillar Compliance Radar</h3>
                  <span className="chart-subtitle">Multidimensional regulatory coverage</span>
                </div>
                <ResponsiveContainer width="100%" height={290}>
                  <RadarChart data={chartData} margin={{ top: 12, right: 28, bottom: 12, left: 28 }}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11.5, fill: '#475569', fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 9.5 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      fillOpacity={0.42}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-panel">
                <div className="chart-title-bar">
                  <h3>Category Scores & Thresholds</h3>
                  <span className="chart-subtitle">Target compliance baseline: 75/100</span>
                </div>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 25, right: 25, top: 12, bottom: 12 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11.5, fill: '#475569', fontWeight: 600 }} width={120} />
                    <Tooltip formatter={(val) => [`${val} / 100`, 'Compliance Score']} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ==========================================================
                4. TABBED / DRILL-DOWN CONTROLS
                ========================================================== */}
            <div className="drilldown-header-bar">
              <div className="drilldown-title-wrap">
                <h3 className="section-title">Regulatory Pillar Findings</h3>
                <span className="section-count">{filteredPillars.length} of 7 Pillars</span>
              </div>

              <div className="tabs-pill-row">
                {['ALL', 'Data', 'Privacy', 'Fairness', 'Transparency', 'Evaluation', 'Safety', 'Reproducibility'].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-pill-btn ${pillarFilter === tab ? 'active' : ''}`}
                    onClick={() => setPillarFilter(tab)}
                  >
                    {tab === 'ALL' ? 'All Pillars' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* ==========================================================
                5. TWO-COLUMN / THREE-COLUMN RESPONSIVE PILLAR GRID
                ========================================================== */}
            <div className="pillar-grid-2col">
              {filteredPillars.map((p, idx) => {
                const isExpanded = !!expandedDetails[idx]
                return (
                  <div key={idx} className="pillar-card">
                    <div className="pillar-card-header">
                      <div>
                        <h4 className="pillar-name">{p.categoryName}</h4>
                        <span className="pillar-score" style={{ color: getScoreColor(p.score) }}>
                          Score: {p.score} / 100
                        </span>
                      </div>
                      {getStatusBadge(p.status)}
                    </div>

                    <p className="pillar-summary">{p.executiveSummary}</p>

                    {p.keyStrengths && p.keyStrengths.length > 0 && (
                      <div className="pillar-section">
                        <span className="sub-heading text-green">Strengths Disclosed:</span>
                        <ul>
                          {p.keyStrengths.slice(0, isExpanded ? undefined : 2).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {p.criticalGaps && p.criticalGaps.length > 0 && (
                      <div className="pillar-section">
                        <span className="sub-heading text-red">Critical Omissions / Risks:</span>
                        <ul>
                          {p.criticalGaps.slice(0, isExpanded ? undefined : 2).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {p.evidenceQuotes && p.evidenceQuotes.length > 0 && (
                      <div className="pillar-section evidence-quote-box">
                        <span className="sub-heading">Extracted Document Evidence:</span>
                        {p.evidenceQuotes.slice(0, isExpanded ? undefined : 1).map((q, i) => (
                          <blockquote key={i}>"{q}"</blockquote>
                        ))}
                      </div>
                    )}

                    {/* Drill-down toggle button */}
                    <button className="expand-card-btn" onClick={() => toggleDetails(idx)}>
                      <span>{isExpanded ? 'Collapse Details' : 'View Full Evidence'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* ==========================================================
                6. ACTION ITEMS: IDENTIFIED WEAKNESSES & REMEDIATIONS
                ========================================================== */}
            <div className="remediation-grid">
              <div className="remediation-panel warnings">
                <h4>
                  <AlertTriangle size={17} />
                  <span>Top Identified Weaknesses</span>
                </h4>
                <ul>
                  {report.identifiedWeaknesses?.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="remediation-panel recommendations">
                <h4>
                  <CheckCircle2 size={17} color="#16a34a" />
                  <span>Mandatory Remediation Steps</span>
                </h4>
                <ul>
                  {report.recommendations?.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
          </>
        )}

      </main>
    </div>
  )
}