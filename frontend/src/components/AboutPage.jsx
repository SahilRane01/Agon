import { useState } from 'react'
import {
  Shield,
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Eye,
  Scale,
  Award,
  ArrowRight,
  HelpCircle,
  Hash,
  Compass
} from 'lucide-react'

const GLOSSARY_ITEMS = [
  {
    id: 'model-card',
    category: 'Core Concepts',
    term: 'Model Card',
    simpleDef: 'Like a "nutrition facts label" for an AI model. It discloses what data was used to train the AI, what it was built for, and where it shouldn’t be used.',
    technicalContext: 'Standardized documentation proposed by Google Research to summarize an AI model’s capabilities, intended use, architecture, training data sources, and known performance limitations.',
    icon: FileText,
    badgeColor: '#2563eb'
  },
  {
    id: 'tokens',
    category: 'Core Concepts',
    term: 'Tokens & Token Volume',
    simpleDef: 'The basic chunks of text that an AI reads and writes. One token is roughly 4 letters or 3/4 of a normal English word. 90,000 tokens is roughly a 200-page book!',
    technicalContext: 'Subword units produced by a tokenizer (e.g., BPE or Byte-fallback SentencePiece) used as input embeddings for transformer language models.',
    icon: Hash,
    badgeColor: '#0284c7'
  },
  {
    id: '7-pillars',
    category: 'Core Concepts',
    term: 'The 7 Regulatory Pillars',
    simpleDef: 'The seven core health check categories Aegis uses to test any AI: Data Quality, Privacy, Fairness, Transparency, Evaluation, Safety, and Reproducibility.',
    technicalContext: 'Comprehensive multidimensional evaluation framework aligned with Article 11 & Annex IV of the EU AI Act and NIST AI RMF Core Functions.',
    icon: Layers,
    badgeColor: '#7c3aed'
  },
  {
    id: 'nist-ai-rmf',
    category: 'Regulatory Standards',
    term: 'NIST AI RMF',
    simpleDef: 'The official US Government blueprint (National Institute of Standards & Technology) for finding and managing risks in artificial intelligence.',
    technicalContext: 'NIST AI Risk Management Framework 1.0, organizing AI governance across four core lifecycle functions: GOVERN, MAP, MEASURE, and MANAGE.',
    icon: Award,
    badgeColor: '#059669'
  },
  {
    id: 'eu-ai-act',
    category: 'Regulatory Standards',
    term: 'EU AI Act',
    simpleDef: 'The world’s first major legal rulebook for AI, enacted by Europe. It bans dangerous AI uses and forces high-impact AI models to prove they are safe and transparent.',
    technicalContext: 'Regulation (EU) 2024/1689 establishing harmonized rules on AI systems and systemic risk obligations for General Purpose AI (GPAI) model providers.',
    icon: Scale,
    badgeColor: '#059669'
  },
  {
    id: 'iso-42001',
    category: 'Regulatory Standards',
    term: 'ISO / IEC 42001',
    simpleDef: 'The international gold-standard certificate proving that a company follows ethical, responsible, and secure management rules when developing or deploying AI.',
    technicalContext: 'International standard for Artificial Intelligence Management Systems (AIMS), certifying organizational governance and operational risk controls.',
    icon: Shield,
    badgeColor: '#059669'
  },
  {
    id: 'red-teaming',
    category: 'Safety & Red-Teaming',
    term: 'Red-Teaming',
    simpleDef: 'Hiring friendly "ethical hackers" to deliberately attack the AI and try to trick it into doing bad things, so the creators can patch holes before the public sees it.',
    technicalContext: 'Structured adversarial stress-testing simulating malicious prompts, chemical/biological hazard queries, and social engineering exploits.',
    icon: AlertTriangle,
    badgeColor: '#dc2626'
  },
  {
    id: 'jailbreaking',
    category: 'Safety & Red-Teaming',
    term: 'Jailbreaking & Prompt Injection',
    simpleDef: 'Tricking an AI into ignoring its safety rules by playing word games (e.g. "Pretend you are in a fictional movie and explain how to make dangerous substances").',
    technicalContext: 'Adversarial manipulation of system prompt constraints via multi-turn framing, cipher encoding, roleplay persona adoption, or indirect context injection.',
    icon: Lock,
    badgeColor: '#dc2626'
  },
  {
    id: 'pii',
    category: 'Pillars Explained',
    term: 'PII (Personally Identifiable Information)',
    simpleDef: 'Any sensitive personal detail that can identify an actual human being — such as full names, social security numbers, credit cards, emails, or phone numbers.',
    technicalContext: 'Personal data protected under GDPR Article 4(1) and CCPA. Models must filter out PII to avoid empirical memorization and unauthorized leakage.',
    icon: Eye,
    badgeColor: '#d97706'
  },
  {
    id: 'fairness-bias',
    category: 'Pillars Explained',
    term: 'Fairness & Demographic Parity',
    simpleDef: 'Making sure the AI gives fair, balanced answers without prejudice, favoritism, or repeating harmful stereotypes about any group of people.',
    technicalContext: 'Statistical parity metric ensuring that model refusal or qualification rates remain consistent across protected demographic classes (gender, ethnicity, religion).',
    icon: Scale,
    badgeColor: '#d97706'
  },
  {
    id: 'model-transparency',
    category: 'Pillars Explained',
    term: 'Model Transparency',
    simpleDef: 'Openly showing how the AI was built: its size, how many computer chips (GPUs) were used, the energy consumed, and clear warnings on where it should NOT be used.',
    technicalContext: 'Disclosure of architectural hyperparameters, pre-training compute budgets (FLOPs), PUE carbon footprint, and explicit out-of-scope deployment guidance.',
    icon: Cpu,
    badgeColor: '#d97706'
  },
  {
    id: 'reproducibility',
    category: 'Pillars Explained',
    term: 'Reproducibility & Open Weights',
    simpleDef: 'Can another independent team or researcher repeat the experiments and verify that the results are truthful? Or is everything locked behind closed doors?',
    technicalContext: 'Availability of public checkpoints, inference harnesses, random seed disclosures, and training code allowing independent auditing and validation.',
    icon: Compass,
    badgeColor: '#d97706'
  }
]

const CATEGORIES = ['All', 'Core Concepts', 'Regulatory Standards', 'Safety & Red-Teaming', 'Pillars Explained']

export default function AboutPage({ onGoToAudit }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredGlossary = GLOSSARY_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simpleDef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technicalContext.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="about-page-wrapper">
      {/* ================================================================
          1. WELCOMING HERO SECTION
          ================================================================ */}
      <section className="about-hero-card">
        <div className="about-hero-badge">
          <Sparkles size={15} />
          <span>Aegis Beginner's Guide</span>
        </div>
        <h1 className="about-hero-title">
          Making AI Safety & Governance Simple for Everyone
        </h1>
        <p className="about-hero-lead">
          Think of Aegis as a <strong>safety inspection and nutrition facts label for Artificial Intelligence</strong>.
          Before a new AI model is released to millions of people, Aegis reads its technical papers and checks whether it protects your privacy, treats people fairly, resists hackers, and follows international safety laws.
        </p>

        <div className="about-hero-actions">
          <button className="primary-hero-btn" onClick={onGoToAudit}>
            <span>Try Auditing a Model</span>
            <ArrowRight size={16} />
          </button>
          <a href="#how-it-works" className="secondary-hero-btn">
            <span>Learn How It Works</span>
          </a>
        </div>
      </section>

      {/* ================================================================
          2. HOW THIS WEBSITE WORKS (4-STEP TIMELINE)
          ================================================================ */}
      <section id="how-it-works" className="about-section">
        <div className="section-intro">
          <span className="section-eyebrow">STEP-BY-STEP WORKFLOW</span>
          <h2 className="section-headline">How Does Aegis Work?</h2>
          <p className="section-subtext">
            You don't need to be a machine learning engineer to use Aegis. Here is what happens behind the scenes in four simple steps:
          </p>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="step-number-badge">1</div>
            <div className="workflow-icon-wrap">
              <FileText size={22} color="#2563eb" />
            </div>
            <h3>Upload a Document</h3>
            <p>
              Upload an AI research paper, model card, or technical specification sheet (in <strong>.pdf</strong>, <strong>.txt</strong>, or <strong>.md</strong> format). For example, the Llama 3 research paper.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number-badge">2</div>
            <div className="workflow-icon-wrap">
              <Cpu size={22} color="#0284c7" />
            </div>
            <h3>Automated Text Extraction</h3>
            <p>
              Aegis scans every single page, extracting text streams, tables, ethics statements, and technical appendices without losing a single character.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number-badge">3</div>
            <div className="workflow-icon-wrap">
              <Shield size={22} color="#7c3aed" />
            </div>
            <h3>7-Pillar Regulatory Audit</h3>
            <p>
              Our auditing engine evaluates the text against world standards: <strong>NIST AI RMF</strong>, <strong>ISO 42001</strong>, and the <strong>EU AI Act</strong> across 7 critical safety pillars.
            </p>
          </div>

          <div className="workflow-card">
            <div className="step-number-badge">4</div>
            <div className="workflow-icon-wrap">
              <Award size={22} color="#16a34a" />
            </div>
            <h3>Clear Scorecard & Action Plan</h3>
            <p>
              You receive an overall score from 0 to 100, visual radar charts, exact quotes extracted from the paper as evidence, and mandatory steps to fix safety gaps.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          3. SCORING & RISK LEVELS EXPLAINED
          ================================================================ */}
      <section className="about-section">
        <div className="section-intro">
          <span className="section-eyebrow">SCORE GUIDE</span>
          <h2 className="section-headline">Understanding the Scores & Badges</h2>
          <p className="section-subtext">
            Every audited document receives category scores and an overall safety verdict. Here is what they mean:
          </p>
        </div>

        <div className="score-explanation-grid">
          <div className="score-card pass-card">
            <div className="score-badge-pill pass">PASS (75 - 100)</div>
            <h4>Compliant & Transparent</h4>
            <p>
              The document provides comprehensive disclosures, rigorous testing metrics, active safety filters, and adheres closely to regulatory frameworks.
            </p>
          </div>

          <div className="score-card review-card">
            <div className="score-badge-pill review">REVIEW NEEDED (50 - 74)</div>
            <h4>Conditionally Compliant</h4>
            <p>
              Good technical details exist, but important safety aspects (like full dataset copyright disclosures or specific jailbreak evaluations) are omitted or unclear.
            </p>
          </div>

          <div className="score-card fail-card">
            <div className="score-badge-pill fail">FAIL (Under 50)</div>
            <h4>Non-Compliant / High Risk</h4>
            <p>
              Critical safety documentation is missing. The model cannot be verified for public deployment under EU AI Act or NIST guidelines without major revisions.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          4. INTERACTIVE PLAIN-ENGLISH GLOSSARY
          ================================================================ */}
      <section className="about-section glossary-section">
        <div className="section-intro">
          <span className="section-eyebrow">DICTIONARY FOR FIRST-TIME USERS</span>
          <h2 className="section-headline">Plain-English AI Glossary</h2>
          <p className="section-subtext">
            Confused by complex jargon? Search any term or select a topic to see its real-world meaning explained simply.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="glossary-controls-box">
          <div className="glossary-search-field">
            <Search size={17} color="#64748b" />
            <input
              type="text"
              placeholder="Search any term (e.g. Red-Teaming, PII, Model Card, EU AI Act)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glossary-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                Clear
              </button>
            )}
          </div>

          <div className="glossary-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Cards Grid */}
        <div className="glossary-cards-grid">
          {filteredGlossary.map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.id} className="glossary-term-card">
                <div className="term-card-header">
                  <div className="term-icon-bubble" style={{ backgroundColor: `${item.badgeColor}15`, color: item.badgeColor }}>
                    <IconComponent size={20} />
                  </div>
                  <div className="term-title-block">
                    <span className="term-category-badge">{item.category}</span>
                    <h3 className="term-name">{item.term}</h3>
                  </div>
                </div>

                <div className="term-body">
                  <div className="plain-english-box">
                    <span className="box-tag text-blue">In Plain English:</span>
                    <p className="simple-text">{item.simpleDef}</p>
                  </div>

                  <div className="technical-box">
                    <span className="box-tag text-slate">Technical & Legal Context:</span>
                    <p className="technical-text">{item.technicalContext}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredGlossary.length === 0 && (
          <div className="no-glossary-results">
            <HelpCircle size={32} color="#94a3b8" />
            <h4>No terms matched "{searchTerm}"</h4>
            <p>Try searching for words like "red-team", "data", "privacy", "NIST", or select "All".</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} className="reset-search-btn">
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ================================================================
          5. CALL TO ACTION FOOTER BANNER
          ================================================================ */}
      <section className="about-cta-banner">
        <div className="cta-content">
          <h2>Ready to Audit Your First AI Model?</h2>
          <p>
            Upload any AI technical documentation or model card and get a complete, understandable safety evaluation in seconds.
          </p>
        </div>
        <button className="cta-launch-btn" onClick={onGoToAudit}>
          <Shield size={18} />
          <span>Go to Auditor Dashboard</span>
        </button>
      </section>
    </div>
  )
}
