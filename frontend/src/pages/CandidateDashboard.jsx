import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const menuItems = [
    "Dashboard",
    "My Profile",
    "Resume",
    "Recommended Jobs",
    "Applications",
    "AI Interview",
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item);

    if (item === "Dashboard") {
      navigate("/candidate-dashboard");
    }

    if (item === "My Profile") {
      navigate("/my-profile");
    }
    if (item === "Resume") navigate("/resume");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="dashboard-logo">
          <span>Talmetry</span>
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item}
              className={
                activeMenu === item
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => handleMenuClick(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <p className="dashboard-label">
              CANDIDATE DASHBOARD
            </p>

            <h1>
              Welcome back, {user?.fullName || "Candidate"} 👋
            </h1>

            <p>
              Track your profile, applications and AI interview
              progress.
            </p>
          </div>

          <div className="profile-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "C"}
          </div>

        </header>

        {/* Stats */}
        <section className="dashboard-stats">

          <div className="dashboard-stat-card">
            <span>Profile Completion</span>
            <strong>72%</strong>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "72%" }}
              ></div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <span>Jobs Matched</span>
            <strong>24</strong>
            <small>Based on your skills</small>
          </div>

          <div className="dashboard-stat-card">
            <span>Applications</span>
            <strong>8</strong>
            <small>2 interviews scheduled</small>
          </div>

          <div className="dashboard-stat-card">
            <span>AI Interview Score</span>
            <strong>86%</strong>
            <small>Excellent performance</small>
          </div>

        </section>

        {/* Recommended Jobs + Skills */}
        <section className="dashboard-grid">

          {/* Recommended Jobs */}
          <div className="dashboard-card jobs-card">

            <div className="card-heading">

              <div>
                <h2>Recommended Jobs</h2>
                <p>Jobs matching your profile</p>
              </div>

              <button>
                View All
              </button>

            </div>

            <div className="job-item">

              <div className="job-icon">
                J
              </div>

              <div className="job-info">
                <h3>Java Backend Developer</h3>
                <p>
                  TechNova Solutions • Remote
                </p>
              </div>

              <div className="match-score">
                <strong>94%</strong>
                <span>Match</span>
              </div>

            </div>

            <div className="job-item">

              <div className="job-icon">
                A
              </div>

              <div className="job-info">
                <h3>Full Stack Developer</h3>
                <p>
                  Innovate Labs • Bangalore
                </p>
              </div>

              <div className="match-score">
                <strong>89%</strong>
                <span>Match</span>
              </div>

            </div>

            <div className="job-item">

              <div className="job-icon">
                S
              </div>

              <div className="job-info">
                <h3>Software Engineer</h3>
                <p>
                  Smart Systems • Noida
                </p>
              </div>

              <div className="match-score">
                <strong>84%</strong>
                <span>Match</span>
              </div>

            </div>

          </div>

          {/* Skills */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>Your Skills</h2>
                <p>
                  Skills detected from your profile
                </p>
              </div>

            </div>

            <div className="skills-container">
              <span>Java</span>
              <span>JavaScript</span>
              <span>Python</span>
              <span>React</span>
              <span>Spring Boot</span>
              <span>SQL</span>
              <span>Git</span>
            </div>

            <button
              className="secondary-button"
              onClick={() => navigate("/my-profile")}
            >
              Update Skills
            </button>

          </div>

        </section>

        {/* Applications + AI Interview */}
        <section className="dashboard-grid">

          {/* Applications */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>Recent Applications</h2>
                <p>
                  Your latest job applications
                </p>
              </div>

            </div>

            <div className="application-row">

              <div>
                <h3>Backend Developer</h3>
                <p>TechNova Solutions</p>
              </div>

              <span className="status interview">
                Interview
              </span>

            </div>

            <div className="application-row">

              <div>
                <h3>Software Engineer</h3>
                <p>CloudWorks</p>
              </div>

              <span className="status review">
                Under Review
              </span>

            </div>

            <div className="application-row">

              <div>
                <h3>React Developer</h3>
                <p>Digital Labs</p>
              </div>

              <span className="status applied">
                Applied
              </span>

            </div>

          </div>

          {/* AI Interview */}
          <div className="dashboard-card ai-interview-card">

            <p className="dashboard-label">
              AI INTERVIEW
            </p>

            <h2>
              Ready for your next interview?
            </h2>

            <p>
              Practice with Talmetry AI and get instant
              feedback on your technical and communication
              skills.
            </p>

            <button className="primary-button">
              Start AI Interview →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CandidateDashboard;