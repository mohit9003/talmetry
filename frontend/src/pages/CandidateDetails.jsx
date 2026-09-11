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

  const [jobMatchScores, setJobMatchScores] = useState([]);

  // =========================================================
  // LOAD DATA
  // =========================================================

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
    fetchCandidateData(storedUser);
  }, [id, navigate]);

  // =========================================================
  // FETCH CANDIDATE DATA
  // =========================================================

  const fetchCandidateData = async (storedUser) => {
    setLoading(true);
    setError("");

    try {
      const token = storedUser.token;

      if (!token) {
        throw new Error(
          "Recruiter session expired. Please login again."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // =======================================================
      // 1. CANDIDATE PROFILE
      // =======================================================

      const profileResponse = await fetch(
        `http://localhost:8080/api/candidate/profile/${id}`,
        {
          method: "GET",
          headers,
        }
      );

      let profileData = {};

      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      } else if (profileResponse.status !== 404) {
        throw new Error(
          `Unable to load candidate profile (${profileResponse.status})`
        );
      }

      // =======================================================
      // 2. RECRUITER JOBS
      // =======================================================

      const jobsResponse = await fetch(
        `http://localhost:8080/api/jobs/recruiter/${storedUser.id}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!jobsResponse.ok) {
        throw new Error(
          `Unable to load recruiter jobs (${jobsResponse.status})`
        );
      }

      const recruiterJobs = await jobsResponse.json();

      // =======================================================
      // 3. FIND THIS CANDIDATE'S APPLICATIONS
      // =======================================================

      let candidateApplications = [];

      for (const job of recruiterJobs) {
        try {
          const applicationsResponse = await fetch(
            `http://localhost:8080/api/applications/job/${job.id}`,
            {
              method: "GET",
              headers,
            }
          );

          if (applicationsResponse.ok) {
            const jobApplications =
              await applicationsResponse.json();

            const matchingApplications =
              jobApplications.filter(
                (application) =>
                  application.user &&
                  String(application.user.id) === String(id)
              );

            candidateApplications.push(
              ...matchingApplications
            );
          }
        } catch (applicationError) {
          console.error(
            `Unable to fetch applications for job ${job.id}:`,
            applicationError
          );
        }
      }

      setApplications(candidateApplications);

      // =======================================================
      // 4. FETCH RESUME
      // =======================================================

      const resumeResponse = await fetch(
        `http://localhost:8080/api/candidate/resume/${id}`,
        {
          method: "GET",
          headers,
        }
      );

      let resumeData = null;

      if (resumeResponse.ok) {
        resumeData = await resumeResponse.json();

        setResume(resumeData);

        // =====================================================
        // 5. ATS ANALYSIS
        // =====================================================

        if (resumeData.id) {
          const analysisResponse = await fetch(
            `http://localhost:8080/api/candidate/resume-analysis/${resumeData.id}`,
            {
              method: "GET",
              headers,
            }
          );

          if (analysisResponse.ok) {
            const analysisData =
              await analysisResponse.json();

            setResumeAnalysis(analysisData);
          }
        }
      }

      // =======================================================
      // 6. USER DATA
      // =======================================================

      const applicationUser =
        candidateApplications.length > 0
          ? candidateApplications[0]?.user
          : null;

      // =======================================================
      // 7. MERGE USER + PROFILE
      // =======================================================

      const candidateData = {
        id: applicationUser?.id || Number(id),

        fullName:
          applicationUser?.fullName ||
          profileData?.user?.fullName ||
          "Candidate",

        email:
          applicationUser?.email ||
          profileData?.user?.email ||
          "Email not available",

        phone: profileData?.phone || "",

        location:
          profileData?.location || "",

        education:
          profileData?.education || "",

        experience:
          profileData?.experience || "",

        skills:
          profileData?.skills || "",

        github:
          profileData?.github || "",

        linkedin:
          profileData?.linkedin || "",
      };

      setCandidate(candidateData);

      // =======================================================
      // 8. JOB MATCH SCORE
      // =======================================================

      calculateJobMatchScores(
        candidateData.skills,
        candidateApplications
      );

    } catch (err) {
      console.error(
        "Candidate details error:",
        err
      );

      const errorMessage =
        err.message || "";

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("403") ||
        errorMessage
          .toLowerCase()
          .includes("session")
      ) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setError(
        errorMessage ||
          "Unable to load candidate details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // JOB MATCH SCORE
  // =========================================================

  const calculateJobMatchScores = (
    candidateSkills,
    candidateApplications
  ) => {
    if (
      !candidateSkills ||
      candidateApplications.length === 0
    ) {
      setJobMatchScores([]);
      return;
    }

    const candidateSkillList =
      candidateSkills
        .toLowerCase()
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const scores = candidateApplications.map(
      (application) => {
        const job = application.job;

        if (!job) {
          return {
            applicationId: application.id,
            jobTitle: "Job",
            company: "Company",
            score: 0,
            matchedSkills: [],
            requiredSkills: [],
          };
        }

        const requiredSkills =
          job.requiredSkills
            ? job.requiredSkills
                .toLowerCase()
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean)
            : [];

        if (requiredSkills.length === 0) {
          return {
            applicationId: application.id,
            jobTitle: job.title,
            company: job.company,
            score: 0,
            matchedSkills: [],
            requiredSkills: [],
          };
        }

        const matchedSkills =
          requiredSkills.filter((requiredSkill) =>
            candidateSkillList.some(
              (candidateSkill) =>
                candidateSkill.includes(requiredSkill) ||
                requiredSkill.includes(candidateSkill)
            )
          );

        const score = Math.round(
          (matchedSkills.length /
            requiredSkills.length) *
            100
        );

        return {
          applicationId: application.id,
          jobTitle: job.title,
          company: job.company,
          score,
          matchedSkills,
          requiredSkills,
        };
      }
    );

    setJobMatchScores(scores);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // =========================================================
  // SKILLS
  // =========================================================

  const skills = candidate?.skills
    ? candidate.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="candidate-details-loading">
        <div className="details-loader">
          ⏳
        </div>

        <h2>
          Loading candidate profile...
        </h2>

        <p>
          Please wait while we fetch the
          candidate information.
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="candidate-details-error-page">

        <div className="details-error-icon">
          ⚠️
        </div>

        <h2>
          Candidate details unavailable
        </h2>

        <p>
          {error}
        </p>

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

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="candidate-details-page">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="recruiter-sidebar">

        <div className="recruiter-logo">

          <div className="logo-mark">
            T
          </div>

          <div>
            <h2>
              Talmetry
            </h2>

            <span>
              Recruiter Panel
            </span>
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="candidate-details-main">

        {/* TOP BAR */}

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

        {/* =====================================================
            CANDIDATE HERO
        ====================================================== */}

        <section className="candidate-hero">

          <div className="candidate-big-avatar">
            {candidate?.fullName
              ?.charAt(0)
              ?.toUpperCase() || "C"}
          </div>

          <div className="candidate-hero-info">

            <p className="page-label">
              CANDIDATE PROFILE
            </p>

            <h1>
              {candidate?.fullName}
            </h1>

            <p className="candidate-email">
              ✉ {candidate?.email}
            </p>

            <p className="candidate-location">
              📍{" "}
              {candidate?.location ||
                "Location not provided"}
            </p>

          </div>

          <div className="candidate-profile-badge">

            <span>
              PROFILE
            </span>

            <strong>
              Candidate
            </strong>

          </div>

        </section>

        {/* =====================================================
            CONTENT GRID
        ====================================================== */}

        <div className="candidate-content-grid">

          {/* ===================================================
              LEFT COLUMN
          ==================================================== */}

          <div className="candidate-left">

            {/* =================================================
                ATS RESUME ANALYSIS
            ================================================== */}

            <div className="candidate-card ats-card">

              <div className="card-header">

                <div>

                  <h2>
                    AI Resume Analysis
                  </h2>

                  <p>
                    AI-powered candidate
                    resume evaluation
                  </p>

                </div>

                <div className="ats-header-actions">

                  {resume && (

                    <button
                      className="view-resume-btn"
                      onClick={async () => {

                        try {

                          if (!user?.token) {
                            alert(
                              "Recruiter session expired. Please login again."
                            );

                            navigate("/login");
                            return;
                          }

                          const response =
                            await fetch(
                              `http://localhost:8080/api/candidate/resume/download/${id}`,
                              {
                                method: "GET",
                                headers: {
                                  Authorization:
                                    `Bearer ${user.token}`,
                                },
                              }
                            );

                          if (!response.ok) {
                            throw new Error(
                              `Unable to open resume (${response.status})`
                            );
                          }

                          const blob =
                            await response.blob();

                          const fileUrl =
                            window.URL.createObjectURL(
                              blob
                            );

                          window.open(
                            fileUrl,
                            "_blank"
                          );

                          setTimeout(() => {
                            window.URL.revokeObjectURL(
                              fileUrl
                            );
                          }, 60000);

                        } catch (error) {

                          console.error(
                            "Resume view error:",
                            error
                          );

                          alert(
                            "Unable to open candidate resume."
                          );
                        }

                      }}
                    >
                      📄 View Resume
                    </button>

                  )}

                  <div className="card-icon">
                    🤖
                  </div>

                </div>

              </div>

              {/* ATS DATA */}

              {resumeAnalysis ? (

                <>

                  <div className="ats-score-section">

                    <div className="ats-score-circle">

                      <span>
                        {resumeAnalysis.atsScore ?? 0}
                      </span>

                      <small>
                        /100
                      </small>

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
                        Resume has been analyzed
                        using Talmetry AI.
                      </p>

                    </div>

                  </div>

                  <div className="ats-details">

                    <div className="ats-detail-box">

                      <h4>
                        Extracted Skills
                      </h4>

                      <p>
                        {resumeAnalysis.extractedSkills ||
                          "No skills detected"}
                      </p>

                    </div>

                    <div className="ats-detail-box">

                      <h4>
                        Strengths
                      </h4>

                      <p>
                        {resumeAnalysis.strengths ||
                          "No strengths available"}
                      </p>

                    </div>

                    <div className="ats-detail-box">

                      <h4>
                        Weaknesses
                      </h4>

                      <p>
                        {resumeAnalysis.weaknesses ||
                          "No weaknesses available"}
                      </p>

                    </div>

                    <div className="ats-detail-box">

                      <h4>
                        AI Suggestions
                      </h4>

                      <p>
                        {resumeAnalysis.suggestions ||
                          "No suggestions available"}
                      </p>

                    </div>

                  </div>

                </>

              ) : (

                <div className="no-analysis">

                  <span>
                    📄
                  </span>

                  <h3>
                    No ATS Analysis Available
                  </h3>

                  <p>
                    This candidate has not
                    analyzed their resume yet.
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                JOB MATCH SCORE
            ================================================== */}

            <section className="details-card">

              <div className="details-card-header">

                <div>

                  <h2>
                    🎯 Job Match Score
                  </h2>

                  <p>
                    Candidate skill compatibility
                    with applied jobs
                  </p>

                </div>

                <span className="card-icon">
                  🎯
                </span>

              </div>

              {jobMatchScores.length === 0 ? (

                <div className="not-available">
                  No job match data available.
                </div>

              ) : (

                <div className="job-match-list">

                  {jobMatchScores.map(
                    (match) => (

                      <div
                        className="job-match-card"
                        key={match.applicationId}
                      >

                        <div className="job-match-info">

                          <strong>
                            {match.jobTitle}
                          </strong>

                          <span>
                            {match.company}
                          </span>

                          <small>
                            {match.matchedSkills.length}
                            /
                            {match.requiredSkills.length}
                            {" "}skills matched
                          </small>

                        </div>

                        <div className="job-match-score">

                          <strong>
                            {match.score}%
                          </strong>

                          <span>
                            Match
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

            {/* =================================================
                PROFESSIONAL INFORMATION
            ================================================== */}

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

                  <span>
                    🎓 Education
                  </span>

                  <strong>
                    {candidate?.education ||
                      "Not provided"}
                  </strong>

                </div>

                <div className="info-item">

                  <span>
                    💼 Experience
                  </span>

                  <strong>
                    {candidate?.experience ||
                      "Not provided"}
                  </strong>

                </div>

                <div className="info-item">

                  <span>
                    📱 Phone
                  </span>

                  <strong>
                    {candidate?.phone ||
                      "Not provided"}
                  </strong>

                </div>

                <div className="info-item">

                  <span>
                    📍 Location
                  </span>

                  <strong>
                    {candidate?.location ||
                      "Not provided"}
                  </strong>

                </div>

              </div>

            </section>

            {/* =================================================
                SKILLS
            ================================================== */}

            <section className="details-card">

              <div className="details-card-header">

                <div>

                  <h2>
                    Skills
                  </h2>

                  <p>
                    Technical skills added
                    by candidate
                  </p>

                </div>

                <span className="card-icon">
                  🛠️
                </span>

              </div>

              {skills.length > 0 ? (

                <div className="candidate-skills">

                  {skills.map(
                    (skill, index) => (

                      <span
                        key={index}
                        className="skill-tag"
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <div className="not-available">
                  No skills added yet.
                </div>

              )}

            </section>

            {/* =================================================
                APPLICATIONS
            ================================================== */}

            <section className="details-card">

              <div className="details-card-header">

                <div>

                  <h2>
                    Applications
                  </h2>

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
                  No applications found
                  for your jobs.
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

                          <small>
                            Applied{" "}
                            {application.appliedAt
                              ? new Date(
                                  application.appliedAt
                                ).toLocaleDateString()
                              : ""}
                          </small>

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

          {/* ===================================================
              RIGHT COLUMN
          ==================================================== */}

          <div className="candidate-right">

            {/* =================================================
                CONTACT
            ================================================== */}

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

                {/* GITHUB */}

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

                {/* LINKEDIN */}

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

            {/* =================================================
                RECRUITMENT SUMMARY
            ================================================== */}

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

              <div className="summary-item">

                <span>
                  Average Job Match
                </span>

                <strong>
                  {jobMatchScores.length > 0
                    ? Math.round(
                        jobMatchScores.reduce(
                          (sum, item) =>
                            sum + item.score,
                          0
                        ) /
                          jobMatchScores.length
                      ) + "%"
                    : "N/A"}
                </strong>

              </div>

            </section>

            {/* =================================================
                BACK BUTTON
            ================================================== */}

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