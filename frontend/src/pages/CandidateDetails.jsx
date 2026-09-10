import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CandidateDetails.css";

function CandidateDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resume, setResume] = useState(null);
const [resumeAnalysis, setResumeAnalysis] = useState(null);
const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      navigate("/login");
      return;
    }

    if (storedUser.role !== "RECRUITER") {
      navigate("/candidate-dashboard");
      return;
    }

    setUser(storedUser);
    fetchCandidateData();
  }, [id, navigate]);

  const fetchCandidateData = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Fetch candidate profile
      const profileResponse = await fetch(
        `http://localhost:8080/api/candidate/profile/${id}`
      );

      let profileData = {};

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      // 2. Fetch candidate applications
      const applicationsResponse = await fetch(
        `http://localhost:8080/api/applications/user/${id}`
      );

      if (!applicationsResponse.ok) {
        throw new Error("Unable to load candidate applications");
      }

      const applicationsData = await applicationsResponse.json();

      setApplications(applicationsData);

      // 3. Fetch candidate resume
const resumeResponse = await fetch(
  `http://localhost:8080/api/candidate/resume/${id}`,
  {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  }
);

if (resumeResponse.ok) {
  const resumeData = await resumeResponse.json();
  setResume(resumeData);

  // 4. Fetch ATS analysis
  const analysisResponse = await fetch(
  `http://localhost:8080/api/candidate/resume-analysis/${resumeData.id}`,
  {
    headers: {
      Authorization: `Bearer ${storedUser.token}`,
    },
  }
);

  if (analysisResponse.ok) {
    const analysisData = await analysisResponse.json();
    setResumeAnalysis(analysisData);
  }
}

      // 3. Get candidate's actual User data
      const applicationUser =
        applicationsData.length > 0
          ? applicationsData[0]?.user
          : null;

      // 4. Merge User + Profile data
      setCandidate({
        id: applicationUser?.id || Number(id),
        fullName: applicationUser?.fullName || "Candidate",
        email: applicationUser?.email || "Email not available",

        phone: profileData?.phone || "",
        location: profileData?.location || "",
        education: profileData?.education || "",
        experience: profileData?.experience || "",
        skills: profileData?.skills || "",
        github: profileData?.github || "",
        linkedin: profileData?.linkedin || "",
      });

    } catch (err) {
      console.error("Candidate details error:", err);
      setError("Unable to load candidate details.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const skills = candidate?.skills
    ? candidate.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="candidate-details-loading">
        <div className="details-loader">⏳</div>

        <h2>Loading candidate profile...</h2>

        <p>
          Please wait while we fetch the candidate information.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidate-details-error-page">

        <div className="details-error-icon">
          ⚠️
        </div>

        <h2>Candidate details unavailable</h2>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate("/recruiter/applicants")
          }
        >
          ← Back to Applicants
        </button>

      </div>
    );
  }

  return (
    <div className="candidate-details-page">

      {/* Sidebar */}
      <aside className="recruiter-sidebar">

        <div className="recruiter-logo">

          <div className="logo-mark">
            T
          </div>

          <div>
            <h2>Talmetry</h2>
            <span>Recruiter Panel</span>
          </div>

        </div>

        <nav className="recruiter-nav">

          <button
            onClick={() =>
              navigate("/recruiter-dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/recruiter/jobs")
            }
          >
            💼 Manage Jobs
          </button>

          <button
            onClick={() =>
              navigate("/recruiter/create-job")
            }
          >
            ➕ Create Job
          </button>

          <button
            className="active"
            onClick={() =>
              navigate("/recruiter/applicants")
            }
          >
            👥 Applicants
          </button>

        </nav>

        <button
          className="recruiter-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* Main */}
      <main className="candidate-details-main">

        {/* Top */}
        <div className="candidate-details-top">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/recruiter/applicants")
            }
          >
            ← Back to Applicants
          </button>

          <div className="recruiter-user">

            <div className="recruiter-avatar">
              {user?.fullName
                ?.charAt(0)
                ?.toUpperCase() || "R"}
            </div>

            <div>
              <strong>
                {user?.fullName || "Recruiter"}
              </strong>

              <span>
                {user?.email}
              </span>
            </div>

          </div>

        </div>

        {/* Candidate Hero */}
        <section className="candidate-hero">

          <div className="candidate-big-avatar">
            {candidate?.fullName
              ?.charAt(0)
              ?.toUpperCase() || "C"}
          </div>

          <div className="candidate-hero-info">

            <p className="page-label">
              Candidate Profile
            </p>

            <h1>
              {candidate?.fullName}
            </h1>

            <p className="candidate-email">
              ✉ {candidate?.email}
            </p>

            <p className="candidate-location">
              📍 {candidate?.location || "Location not provided"}
            </p>

          </div>

          <div className="candidate-profile-badge">

            <span>PROFILE</span>

            <strong>
              Candidate
            </strong>

          </div>

        </section>

        {/* Content */}
        <div className="candidate-content-grid">

          {/* LEFT */}
          <div className="candidate-left">

            {/* ATS RESUME ANALYSIS */}
  <div className="candidate-card ats-card">
    <div className="card-header">
      <div>
        <h2>AI Resume Analysis</h2>
        <p>AI-powered candidate resume evaluation</p>
      </div>

      <div className="ats-header-actions">
        {resume && (
          <button
            className="view-resume-btn"
            onClick={async () => {
              try {
                if (!user?.token) {
                  alert("Recruiter session expired. Please login again.");
                  navigate("/login");
                  return;
                }

                const response = await fetch(
                  `http://localhost:8080/api/candidate/resume/download/${id}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${user.token}`,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error(
                    `Unable to open resume (${response.status})`
                  );
                }

                const blob = await response.blob();
                const fileUrl = window.URL.createObjectURL(blob);

                window.open(fileUrl, "_blank");

                setTimeout(() => {
                  window.URL.revokeObjectURL(fileUrl);
                }, 60000);
              } catch (error) {
                console.error("Resume view error:", error);
                alert("Unable to open candidate resume.");
              }
            }}
          >
            📄 View Resume
          </button>
        )}

        <div className="card-icon"></div>
      </div>
    </div>

  {resumeAnalysis ? (
    <>
      <div className="ats-score-section">
        <div className="ats-score-circle">
          <span>{resumeAnalysis.atsScore ?? 0}</span>
          <small>/100</small>
        </div>

        <div className="ats-score-info">
          <h3>
            {(resumeAnalysis.atsScore ?? 0) >= 80
              ? "Excellent Match"
              : (resumeAnalysis.atsScore ?? 0) >= 60
              ? "Good Match"
              : "Needs Improvement"}
          </h3>

          <p>
            Resume has been analyzed using Talmetry AI.
          </p>
        </div>
      </div>

      <div className="ats-details">

        <div className="ats-detail-box">
          <h4>Extracted Skills</h4>
          <p>
            {resumeAnalysis.extractedSkills || "No skills detected"}
          </p>
        </div>

        <div className="ats-detail-box">
          <h4>Strengths</h4>
          <p>
            {resumeAnalysis.strengths || "No strengths available"}
          </p>
        </div>

        <div className="ats-detail-box">
          <h4>Weaknesses</h4>
          <p>
            {resumeAnalysis.weaknesses || "No weaknesses available"}
          </p>
        </div>

        <div className="ats-detail-box">
          <h4>AI Suggestions</h4>
          <p>
            {resumeAnalysis.suggestions || "No suggestions available"}
          </p>
        </div>

      </div>
    </>
  ) : (
    <div className="no-analysis">
      <span>📄</span>
      <h3>No ATS Analysis Available</h3>
      <p>
        This candidate has not analyzed their resume yet.
      </p>
    </div>
  )}
</div>

            {/* Professional Information */}
            <section className="details-card">

              <div className="details-card-header">

                <div>
                  <h2>
                    Professional Information
                  </h2>

                  <p>
                    Candidate's career details
                  </p>
                </div>

                <span className="card-icon">
                  💼
                </span>

              </div>

              <div className="details-info-grid">

                <div className="info-item">
                  <span>Education</span>

                  <strong>
                    {candidate?.education ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Experience</span>

                  <strong>
                    {candidate?.experience ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Phone</span>

                  <strong>
                    {candidate?.phone ||
                      "Not provided"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Location</span>

                  <strong>
                    {candidate?.location ||
                      "Not provided"}
                  </strong>
                </div>

              </div>

            </section>

            {/* Skills */}
            <section className="details-card">

              <div className="details-card-header">

                <div>
                  <h2>Skills</h2>

                  <p>
                    Technical skills added by candidate
                  </p>
                </div>

                <span className="card-icon">
                  🛠️
                </span>

              </div>

              {skills.length > 0 ? (

                <div className="candidate-skills">

                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="skill-tag"
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              ) : (

                <div className="not-available">
                  No skills added yet.
                </div>

              )}

            </section>

            {/* Applications */}
            <section className="details-card">

              <div className="details-card-header">

                <div>
                  <h2>Applications</h2>

                  <p>
                    Jobs applied by this candidate
                  </p>
                </div>

                <span className="card-icon">
                  📋
                </span>

              </div>

              {applications.length === 0 ? (

                <div className="not-available">
                  No applications found.
                </div>

              ) : (

                <div className="candidate-applications">

                  {applications.map(
                    (application) => (

                      <div
                        className="candidate-application"
                        key={application.id}
                      >

                        <div>

                          <strong>
                            {application.job?.title ||
                              "Job Application"}
                          </strong>

                          <span>
                            {application.job?.company ||
                              "Company"}
                          </span>

                        </div>

                        <span
                          className={`candidate-status ${
                            application.status?.toLowerCase() ||
                            "applied"
                          }`}
                        >
                          {application.status ||
                            "APPLIED"}
                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </div>

          {/* RIGHT */}
          <div className="candidate-right">

            {/* Contact */}
            <section className="details-card">

              <div className="details-card-header">

                <div>
                  <h2>
                    Contact & Links
                  </h2>

                  <p>
                    Professional profiles
                  </p>
                </div>

                <span className="card-icon">
                  🔗
                </span>

              </div>

              <div className="profile-links">

                <div className="profile-link-item">

                  <span className="link-icon">
                    💻
                  </span>

                  <div>

                    <span>
                      GitHub
                    </span>

                    {candidate?.github ? (

                      <a
                        href={candidate.github}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View GitHub Profile ↗
                      </a>

                    ) : (

                      <strong>
                        Not provided
                      </strong>

                    )}

                  </div>

                </div>

                <div className="profile-link-item">

                  <span className="link-icon">
                    💼
                  </span>

                  <div>

                    <span>
                      LinkedIn
                    </span>

                    {candidate?.linkedin ? (

                      <a
                        href={candidate.linkedin}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View LinkedIn Profile ↗
                      </a>

                    ) : (

                      <strong>
                        Not provided
                      </strong>

                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* Recruitment Summary */}
            <section className="details-card recruitment-summary">

              <div className="details-card-header">

                <div>
                  <h2>
                    Recruitment Summary
                  </h2>

                  <p>
                    Quick candidate overview
                  </p>
                </div>

                <span className="card-icon">
                  📊
                </span>

              </div>

              <div className="summary-item">
                <span>
                  Total Applications
                </span>

                <strong>
                  {applications.length}
                </strong>
              </div>

              <div className="summary-item">
                <span>
                  Shortlisted
                </span>

                <strong>
                  {
                    applications.filter(
                      (app) =>
                        app.status ===
                        "SHORTLISTED"
                    ).length
                  }
                </strong>
              </div>

              <div className="summary-item">
                <span>
                  Rejected
                </span>

                <strong>
                  {
                    applications.filter(
                      (app) =>
                        app.status ===
                        "REJECTED"
                    ).length
                  }
                </strong>
              </div>

            </section>

            <button
              className="candidate-back-action"
              onClick={() =>
                navigate("/recruiter/applicants")
              }
            >
              ← Back to Applicant List
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CandidateDetails;