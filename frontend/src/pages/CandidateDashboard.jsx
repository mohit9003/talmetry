import { API_URL } from "../api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CandidateDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [applicationCount, setApplicationCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState([]);
  const [matchedJobsCount, setMatchedJobsCount] = useState(0);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [latestInterviewScore, setLatestInterviewScore] = useState(null);
  useEffect(() => {
  if (!user) {
    navigate("/login");
    return;
  }

  const token = user.token;

  // Fetch applications
  fetch(`${API_URL}/api/applications/user/${user.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      return response.json();
    })
    .then((data) => {
      setApplicationCount(data.length);

      const sortedApplications = [...data].sort((a, b) => {
        return (
          new Date(b.appliedAt || 0) -
          new Date(a.appliedAt || 0)
        );
      });

      setRecentApplications(sortedApplications.slice(0, 3));
    })
    .catch((error) => {
      console.error("Application fetch error:", error);
    });

  // Fetch recommended jobs
  fetch(`${API_URL}/api/jobs/recommended/${user.id}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch recommended jobs");
      }

      return response.json();
    })
   .then((data) => {
  setMatchedJobsCount(data.length);
  setRecommendedJobs(data);
    })
    .catch((error) => {
      console.error("Recommended jobs error:", error);
    });

      // Fetch candidate profile
  fetch(`${API_URL}/api/candidate/profile/${user.id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      return response.json();
    })
    .then((data) => {
  // Skills
  if (data.skills) {
    const skills = data.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    setProfileSkills(skills);
  } else {
    setProfileSkills([]);
  }

  // Profile completion
  const fields = [
    data.phone,
    data.location,
    data.education,
    data.experience,
    data.skills,
    data.github,
    data.linkedin,
  ];

  const completedFields = fields.filter(
    (field) => field && field.trim().length > 0
  ).length;

  const completion = Math.round(
    (completedFields / fields.length) * 100
  );

  setProfileCompletion(completion);
})
    .catch((error) => {
      console.error("Profile skills error:", error);
      setProfileSkills([]);
    });


    // Fetch interview history
    fetch(`${API_URL}/api/interviews/user/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch interview history");
        }

        return response.json();
      })
      .then((data) => {
        const interviews = Array.isArray(data) ? data : [];

        setInterviewCount(interviews.length);

        if (interviews.length > 0) {
          const latestInterview = [...interviews].sort((a, b) => {
            const dateA = new Date(
              a.createdAt || a.completedAt || a.date || 0
            ).getTime();

            const dateB = new Date(
              b.createdAt || b.completedAt || b.date || 0
            ).getTime();

            return dateB - dateA;
          })[0];

          // Read the actual overall interview score from the saved backend result.
          // Support the field names used by different interview-result versions.
          const rawScore =
            latestInterview?.score ??
            latestInterview?.overallScore ??
            latestInterview?.overall_score ??
            latestInterview?.finalScore ??
            latestInterview?.final_score;

          const parsedScore =
            rawScore === null || rawScore === undefined || rawScore === ""
              ? NaN
              : Number(rawScore);

          setLatestInterviewScore(
            Number.isFinite(parsedScore)
              ? Math.round(parsedScore)
              : null
          );
        } else {
          setLatestInterviewScore(null);
        }
      })
      .catch((error) => {
        console.error("Interview history error:", error);
        setInterviewCount(0);
        setLatestInterviewScore(null);
      });

}, [navigate, user?.id, user?.token]);
  const menuItems = [
    "Dashboard",
    "My Profile",
    "Resume",
    "Recommended Jobs",
    "Applications",
    "AI Interview",
    "Interview History",
    "Notifications",
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item);

    switch (item) {
      case "Dashboard":
        navigate("/candidate-dashboard");
        break;

      case "My Profile":
        navigate("/my-profile");
        break;

      case "Resume":
        navigate("/resume");
        break;

      case "Recommended Jobs":
        navigate("/recommended-jobs");
        break;

      case "Applications":
        navigate("/applications");
        break;

      case "AI Interview":
        navigate("/ai-interview");
        break;

        case "Interview History":
        navigate("/interview-history");
        break;
        
        case "Notifications":
        navigate("/notifications");
        break;

      default:
        break;
    }
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
              Welcome back, {user?.fullName || "Candidate"}!
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

            <strong>{profileCompletion}%</strong>

            <div className="progress-bar">
              <div
                  className="progress-fill"
                  style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <span>Jobs Matched</span>

            <strong>{matchedJobsCount}</strong>

            <small>
              Based on your skills
            </small>
          </div>

          <div className="dashboard-stat-card">
            <span>Applications</span>

            <strong>{applicationCount}</strong>

            <small>
              {interviewCount === 0
                ? "No interviews yet"
                : `${interviewCount} interview${interviewCount > 1 ? "s" : ""} completed`}
            </small>
          </div>

          <div className="dashboard-stat-card">
            <span>AI Interview Score</span>

            <strong>
              {latestInterviewScore !== null
                ? `${latestInterviewScore}%`
                : "—"}
            </strong>

            <small>
              {latestInterviewScore !== null
                ? "Latest interview performance"
                : "Complete an AI interview to get your score"}
            </small>
          </div>

        </section>

        {/* Recommended Jobs + Skills */}
        <section className="dashboard-grid">

          {/* Recommended Jobs */}
          <div className="dashboard-card jobs-card">

            <div className="card-heading">

              <div>
                <h2>
                  Recommended Jobs
                </h2>

                <p>
                  Jobs matching your profile
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/recommended-jobs")
                }
              >
                View All
              </button>

            </div>

            {recommendedJobs.length === 0 ? (
  <p>No matching jobs found.</p>
) : (
  recommendedJobs.slice(0, 3).map((job) => (
    <div className="job-item" key={job.id}>

      <div className="job-icon">
        {job.company?.charAt(0).toUpperCase() || "J"}
      </div>

      <div className="job-info">
        <h3>
          {job.title}
        </h3>

        <p>
          {job.company} • {job.location}
        </p>
      </div>

      <div className="match-score">
        <strong>
          {job.matchScore ?? 0}%
        </strong>

        <span>
          Match
        </span>
      </div>

    </div>
  ))
)}

            </div>

         

          {/* Skills */}
          <div className="dashboard-card">

            <div className="card-heading">

              <div>
                <h2>
                  Your Skills
                </h2>

                <p>
                  Skills detected from your profile
                </p>
              </div>

            </div>

           <div className="skills-container">

  {profileSkills.length === 0 ? (
    <span>No skills added yet</span>
  ) : (
    profileSkills.map((skill, index) => (
      <span key={index}>
        {skill}
      </span>
    ))
  )}

</div>
            <button
              className="secondary-button"
              onClick={() =>
                navigate("/my-profile")
              }
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
                <h2>
                  Recent Applications
                </h2>

                <p>
                  Your latest job applications
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/applications")
                }
              >
                View All
              </button>

            </div>

            {/* Real Applications */}
            {recentApplications.length === 0 ? (

              <p>
                No applications yet.
              </p>

            ) : (

              recentApplications.map((application) => (

                <div
                  className="application-row"
                  key={application.id}
                >

                  <div>

                    <h3>
                      {application.job?.title ||
                        "Job Position"}
                    </h3>

                    <p>
                      {application.job?.company ||
                        "Company"}
                    </p>

                  </div>

                  <span
                    className={`status ${
                      application.status?.toLowerCase() ||
                      "applied"
                    }`}
                  >
                    {application.status || "APPLIED"}
                  </span>

                </div>

              ))

            )}

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

            <button
              className="primary-button"
              onClick={() =>
                navigate("/ai-interview")
              }
            >
              Start AI Interview →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CandidateDashboard;

