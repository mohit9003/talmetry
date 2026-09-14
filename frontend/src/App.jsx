import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import MyProfile from "./pages/MyProfile";
import Resume from "./pages/Resume";
import RecommendedJobs from "./pages/RecommendedJobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import AIInterview from "./pages/AIInterview";
import InterviewHistory from "./pages/InterviewHistory";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateJob from "./pages/CreateJob";
import ManageJobs from "./pages/ManageJobs";
import Applicants from "./pages/Applicants";
import CandidateDetails from "./pages/CandidateDetails";
import Notifications from "./pages/Notifications";

function Home() {
  const features = [
    ["◈", "AI Resume Analysis", "Extract skills, experience and qualifications from resumes with intelligent AI-powered analysis."],
    ["⌁", "Smart Candidate Matching", "Match candidates with the right jobs using skills, experience and role requirements."],
    ["◎", "AI-Powered Interviews", "Evaluate candidates with structured AI interviews and meaningful performance insights."],
    ["◇", "ATS Score", "Measure resume compatibility against job requirements and identify areas to improve."],
    ["▣", "Recruiter Dashboard", "Manage jobs, applicants, interviews and candidate rankings from one centralized workspace."],
    ["↗", "Candidate Insights", "Track applications, recommendations, interview scores and career progress in one place."],
  ];

  const steps = [
    ["01", "Create Your Profile", "Candidates build their profile, add skills and upload their resume."],
    ["02", "AI Analyzes Talent", "Talmetry extracts relevant skills, experience and resume insights automatically."],
    ["03", "Match the Right Opportunity", "Our matching engine compares candidate capabilities with job requirements."],
    ["04", "Interview & Hire", "AI interviews help evaluate performance while recruiters shortlist the right talent."],
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo"><span>Tal</span>metry</Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-buttons">
          <Link to="/login"><button className="login-btn">Log in</button></Link>
          <Link to="/register"><button className="signup-btn">Get Started</button></Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="badge">AI-POWERED RECRUITMENT</div>
          <h1>Measure Talent.<br /><span>Hire Smarter.</span></h1>
          <p>Talmetry helps companies discover, evaluate and hire the right talent using intelligent AI-powered recruitment and interview technology.</p>
          <div className="hero-buttons">
            <Link to="/register"><button className="primary-btn">Start Hiring →</button></Link>
            <Link to="/login"><button className="secondary-btn">Find Opportunities</button></Link>
          </div>
          <div className="trust"><span>✓ AI Resume Analysis</span><span>✓ Smart Candidate Matching</span><span>✓ AI Interviews</span></div>
        </div>

        <div className="hero-card">
          <div className="card-header"><span>Candidate Match</span><span className="status">AI Analysis</span></div>
          <div className="score"><strong>92%</strong><span>Match Score</span></div>
          <div className="skills">
            <div><span>Java</span><b>98%</b></div>
            <div><span>Spring Boot</span><b>94%</b></div>
            <div><span>SQL</span><b>91%</b></div>
            <div><span>Problem Solving</span><b>89%</b></div>
          </div>
          <button className="view-btn">View Candidate</button>
        </div>
      </main>

      <section className="stats">
        <div><h2>AI</h2><p>Powered Screening</p></div>
        <div><h2>1:1</h2><p>Candidate Evaluation</p></div>
        <div><h2>24/7</h2><p>Recruitment Intelligence</p></div>
      </section>

      <section id="features" className="home-section features-section">
        <div className="section-heading">
          <span className="section-eyebrow">BUILT FOR MODERN HIRING</span>
          <h2>Everything you need to hire with confidence.</h2>
          <p>Talmetry brings resume intelligence, candidate matching and AI interviews together in one recruitment platform.</p>
        </div>
        <div className="feature-grid">
          {features.map(([icon, title, text]) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="feature-arrow">Explore capability →</span>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="home-section process-section">
        <div className="section-heading">
          <span className="section-eyebrow">HOW TALMETRY WORKS</span>
          <h2>From resume to recruitment, made smarter.</h2>
          <p>A simple workflow designed to reduce manual screening and help teams focus on the people who matter.</p>
        </div>
        <div className="process-grid">
          {steps.map(([number, title, text], index) => (
            <article className="process-card" key={number}>
              <div className="process-top"><span className="process-number">{number}</span>{index < 3 && <span className="process-line" />}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
        <div className="process-quote"><span>✦</span><strong>One platform. Smarter decisions at every hiring stage.</strong></div>
      </section>

      <section className="home-section why-section">
        <div className="section-heading">
          <span className="section-eyebrow">WHY TALMETRY</span>
          <h2>Less guesswork. More signal.</h2>
          <p>Turn scattered recruitment data into clear, actionable insights for both candidates and hiring teams.</p>
        </div>
        <div className="why-grid">
          <div className="why-card"><strong>AI-Driven</strong><span>Intelligent analysis across the hiring workflow.</span></div>
          <div className="why-card"><strong>Skill-Based</strong><span>Focus on what candidates can actually do.</span></div>
          <div className="why-card"><strong>Faster Hiring</strong><span>Reduce repetitive screening and manual shortlisting.</span></div>
          <div className="why-card"><strong>Data-Driven</strong><span>Use scores and insights to support better decisions.</span></div>
        </div>
      </section>

      <section id="about" className="home-section about-section">
        <div className="about-panel">
          <div className="about-copy">
            <span className="section-eyebrow">ABOUT TALMETRY</span>
            <h2>Built to make hiring more intelligent.</h2>
            <p>Talmetry is an AI-powered recruitment platform designed to bridge the gap between talented candidates and the right opportunities.</p>
            <p>By combining resume intelligence, skill-based matching and AI-powered interviews, Talmetry helps recruiters make faster, data-informed decisions while giving candidates a smarter way to showcase their potential.</p>
          </div>
          <div className="about-points">
            <div><span>01</span><div><h3>For Candidates</h3><p>Showcase your skills, discover relevant opportunities and improve interview performance.</p></div></div>
            <div><span>02</span><div><h3>For Recruiters</h3><p>Find qualified candidates faster with intelligent matching and AI-driven insights.</p></div></div>
            <div><span>03</span><div><h3>Our Vision</h3><p>Make recruitment more skill-focused, transparent and intelligent.</p></div></div>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div><span className="section-eyebrow">READY TO MOVE FORWARD?</span><h2>Meet better talent. Make better hires.</h2><p>Start using Talmetry to turn recruitment into a smarter, insight-driven process.</p></div>
        <div className="cta-buttons"><Link to="/register"><button className="primary-btn">Get Started →</button></Link><Link to="/login"><button className="secondary-btn">Log in</button></Link></div>
      </section>

      <footer className="home-footer">
        <div className="footer-logo"><span>Tal</span>metry</div>
        <p>Measure Talent. Hire Smarter.</p>
        <span>© 2026 Talmetry. Intelligent recruitment, reimagined.</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/recommended-jobs" element={<RecommendedJobs />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/ai-interview" element={<AIInterview />} />
        <Route path="/interview-history" element={<InterviewHistory />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/recruiter/create-job" element={<CreateJob />} />
        <Route path="/recruiter/jobs" element={<ManageJobs />} />
        <Route path="/recruiter/applicants" element={<Applicants />} />
        <Route path="/recruiter/candidate/:id" element={<CandidateDetails />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
