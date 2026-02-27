import Link from 'next/link';

const features = [
  { icon: '📄', title: 'Resume Analysis', desc: 'Upload PDF/DOCX — AI extracts skills, experience, ATS score, and improvement tips.' },
  { icon: '🎯', title: 'Career Assessment', desc: '10-question quiz that maps your strengths to the best-fit career paths.' },
  { icon: '📊', title: 'Career Match %', desc: 'Get ranked career matches with exact percentage scores and skill gap analysis.' },
  { icon: '🗺️', title: '3-Month Roadmap', desc: 'AI-generated weekly learning plan to close your skill gaps fast.' },
  { icon: '🤖', title: 'AI Mock Interview', desc: 'Practice with our AI interviewer — 8 role-specific questions with instant feedback.' },
  { icon: '💬', title: 'CareerGuide Chat', desc: 'Conversational AI career advisor available throughout your journey.' },
];

const steps = [
  { num: '01', icon: '📤', title: 'Upload Resume', desc: 'PDF or DOCX — AI instantly extracts your skills and experience.' },
  { num: '02', icon: '🎯', title: 'Career Assessment', desc: 'Answer 10 quick questions to map your interests and strengths.' },
  { num: '03', icon: '📊', title: 'Get Your Report', desc: 'Career matches, skill gaps, and a 3-month learning roadmap.' },
];

export default function HomePage() {
  return (
    <div className="page-wrap">
      <div className="bg-blob" />

      {/* Nav */}
      <nav className="site-nav">
        <span className="brand">
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          PlacementPrep AI
        </span>
        <div className="nav-actions">
          <Link href="/career" className="btn btn-outline">Career Guidance</Link>
          <Link href="/dashboard" className="btn btn-primary">Mock Interview →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-badge animate-fadeIn">
          <span className="dot animate-pulse" />
          AI-Powered Career Guidance · Campus Placement Ready
        </div>

        <h1 className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          Your Complete{' '}
          <span className="gradient-text-cyan">Career Guidance</span>
          {' '}Platform
        </h1>

        <p className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          From resume analysis to career matching, skill gap detection, AI mock interviews,
          and personalised learning roadmaps — everything you need to land your dream job.
        </p>

        <div className="hero-actions animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <Link href="/career" className="btn btn-cyan btn-lg">🧭 Start Career Guidance</Link>
          <Link href="/dashboard" className="btn btn-outline btn-lg">🎤 Mock Interview</Link>
        </div>

        <div className="hero-tags animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          {['Groq AI', 'PDF + DOCX', 'Skill Gap Analysis', '3-Month Roadmap', 'ATS Score', 'Mock Interview'].map(t => (
            <span key={t} className="hero-tag">{t}</span>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="section">
        <div className="section-header">
          <h2>Choose Your Path</h2>
          <p>Two powerful AI tools to accelerate your career</p>
        </div>
        <div className="tools-grid">
          <Link href="/career" className="tool-card glass-card">
            <div className="tool-card-top">
              <span className="tool-card-icon">🧭</span>
              <span className="tool-badge tool-badge-cyan">New</span>
            </div>
            <h3>Career Guidance AI</h3>
            <p>Get career path recommendations, skill gap analysis, and a personalised 3-month roadmap.</p>
            <span className="btn btn-cyan" style={{ width: 'auto', display: 'inline-flex' }}>Get Started →</span>
          </Link>

          <Link href="/dashboard" className="tool-card glass-card">
            <div className="tool-card-top">
              <span className="tool-card-icon">🎤</span>
              <span className="tool-badge tool-badge-violet">Popular</span>
            </div>
            <h3>AI Mock Interview</h3>
            <p>Simulate a real campus interview with 8 tailored questions and a detailed score report.</p>
            <span className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>Get Started →</span>
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="section">
        <div className="section-header">
          <h2>How Career Guidance Works</h2>
          <p>Three steps to your personalised career plan</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={s.num} className="step-card glass-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div className="step-num gradient-text-cyan">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="section">
        <div className="section-header">
          <h2>Everything You Need</h2>
          <p>A complete AI-powered career toolset</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.title} className="feature-card glass-card animate-fadeIn" style={{ animationDelay: `${i * 0.07}s` }}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-block">
        <div className="cta-inner glass-card glow-cyan">
          <h2>Ready to Find Your Career?</h2>
          <p>Get your personalised career guidance report in under 5 minutes.</p>
          <Link href="/career" className="btn btn-cyan btn-lg">🚀 Start Free Career Assessment</Link>
        </div>
      </div>

      <footer className="site-footer">
        © {new Date().getFullYear()} PlacementPrep AI · Career Guidance + Mock Interviews
      </footer>
    </div>
  );
}
