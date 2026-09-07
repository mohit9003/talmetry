import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import MyProfile from "./pages/MyProfile";
import Resume from "./pages/Resume";

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span>Tal</span>metry
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login">
            <button className="login-btn">Log in</button>
          </Link>

          <Link to="/register">
            <button className="signup-btn">Get Started</button>
          </Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="badge">
            AI-POWERED RECRUITMENT
          </div>

          <h1>
            Measure Talent.
            <br />
            <span>Hire Smarter.</span>
          </h1>

          <p>
            Talmetry helps companies discover, evaluate and hire
            the right talent using intelligent AI-powered recruitment
            and interview technology.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button className="primary-btn">
                Start Hiring →
              </button>
            </Link>

            <Link to="/login">
              <button className="secondary-btn">
                Find Opportunities
              </button>
            </Link>
          </div>

          <div className="trust">
            <span>✓ AI Resume Analysis</span>
            <span>✓ Smart Candidate Matching</span>
            <span>✓ AI Interviews</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-header">
            <span>Candidate Match</span>
            <span className="status">AI Analysis</span>
          </div>

          <div className="score">
            <strong>92%</strong>
            <span>Match Score</span>
          </div>

          <div className="skills">
            <div>
              <span>Java</span>
              <b>98%</b>
            </div>

            <div>
              <span>Spring Boot</span>
              <b>94%</b>
            </div>

            <div>
              <span>SQL</span>
              <b>91%</b>
            </div>

            <div>
              <span>Problem Solving</span>
              <b>89%</b>
            </div>
          </div>

          <button className="view-btn">
            View Candidate
          </button>
        </div>
      </main>

      <section className="stats">
        <div>
          <h2>AI</h2>
          <p>Powered Screening</p>
        </div>

        <div>
          <h2>1:1</h2>
          <p>Candidate Evaluation</p>
        </div>

        <div>
          <h2>24/7</h2>
          <p>Recruitment Intelligence</p>
        </div>
      </section>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;