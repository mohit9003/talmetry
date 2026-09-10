import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Applicants.css";

function Applicants() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [matchScores, setMatchScores] = useState({});
  const [atsScores, setAtsScores] = useState({});

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
    fetchJobs();
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/jobs");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError("Unable to load jobs.");
    }
  };

  const fetchApplicants = async (jobId) => {
    if (!jobId) {
      setApplicants([]);
      setMatchScores({});
      setAtsScores({});
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
  `http://localhost:8080/api/applications/job/${jobId}`,
  {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }

      const data = await response.json();
      setApplicants(data);

      // Fetch AI skill-match + ATS scores for these candidates.
      const scoreEntries = await Promise.all(
        data.map(async (application) => {
          const candidateId = application?.user?.id;

          if (!candidateId) {
            return [application.id, { matchScore: null, atsScore: null }];
          }

          try {
            const matchResponse = await fetch(
              `http://localhost:8080/api/jobs/recommended/${candidateId}`
            );

            let matchScore = null;

            if (matchResponse.ok) {
              const recommendations = await matchResponse.json();

              const matchedJob = recommendations.find((item) => {
                const recommendedJobId = item?.job?.id ?? item?.id;
                return Number(recommendedJobId) === Number(jobId);
              });

              matchScore = matchedJob?.matchScore ?? null;
            }

            let atsScore = null;

            const analysisResponse = await fetch(
              `http://localhost:8080/api/candidate/resume-analysis/candidate/${candidateId}`
            );

            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              const source =
                analysisData?.analysis ||
                analysisData?.result ||
                analysisData ||
                {};

              atsScore =
                source.atsScore ??
                source.ats_score ??
                source.score ??
                null;
            }

            return [application.id, { matchScore, atsScore }];
          } catch {
            return [application.id, { matchScore: null, atsScore: null }];
          }
        })
      );

      const matchScoreMap = {};
      const atsScoreMap = {};

      scoreEntries.forEach(([applicationId, scores]) => {
        matchScoreMap[applicationId] = scores.matchScore;
        atsScoreMap[applicationId] = scores.atsScore;
      });

      setMatchScores(matchScoreMap);
      setAtsScores(atsScoreMap);
    } catch (err) {
      setError("Unable to load applicants.");
      setApplicants([]);
      setMatchScores({});
      setAtsScores({});
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (e) => {
    const jobId = e.target.value;

    setSelectedJob(jobId);
    fetchApplicants(jobId);
  };

  // Update candidate application status
  const updateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError("");

    try {
      const response = await fetch(
  `http://localhost:8080/api/applications/${applicationId}/status?status=${status}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  }
);

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedApplication = await response.json();

      setApplicants((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? updatedApplication
            : application
        )
      );
    } catch (err) {
      setError("Unable to update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getFinalScore = (application) => {
    const match = Number(matchScores[application.id]);
    const ats = Number(atsScores[application.id]);

    if (Number.isNaN(match) && Number.isNaN(ats)) return null;
    if (Number.isNaN(match)) return Math.round(ats);
    if (Number.isNaN(ats)) return Math.round(match);

    return Math.round(match * 0.6 + ats * 0.4);
  };

  const rankedApplicants = [...applicants].sort((a, b) => {
    const scoreA = getFinalScore(a);
    const scoreB = getFinalScore(b);

    if (scoreA == null && scoreB == null) return 0;
    if (scoreA == null) return 1;
    if (scoreB == null) return -1;

    return scoreB - scoreA;
  });

  return (
    <div className="applicants-page">

      {/* Sidebar */}
      <aside className="recruiter-sidebar">

        <div className="recruiter-logo">
          <div className="logo-mark">T</div>

          <div>
            <h2>Talmetry</h2>
            <span>Recruiter Panel</span>
          </div>
        </div>

        <nav className="recruiter-nav">

          <button onClick={() => navigate("/recruiter-dashboard")}>
            📊 Dashboard
          </button>

          <button onClick={() => navigate("/recruiter/jobs")}>
            💼 Manage Jobs
          </button>

          <button onClick={() => navigate("/recruiter/create-job")}>
            ➕ Create Job
          </button>

          <button className="active">
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
      <main className="applicants-main">

        <div className="applicants-header">

          <div>
            <p className="page-label">
              Recruitment Management
            </p>

            <h1>Applicants</h1>

            <p>
              Review candidates who have applied for your job postings.
            </p>
          </div>

          <div className="recruiter-user">

            <div className="recruiter-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "R"}
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

        {/* Job Selector */}
        <section className="applicant-selector">

          <div>
            <h2>Select a Job</h2>

            <p>
              Choose a job posting to view its applicants.
            </p>
          </div>

          <select
            value={selectedJob}
            onChange={handleJobChange}
          >
            <option value="">
              Select Job Posting
            </option>

            {jobs.map((job) => (
              <option
                key={job.id}
                value={job.id}
              >
                {job.title} — {job.company}
              </option>
            ))}
          </select>

        </section>

        {/* Error */}
        {error && (
          <div className="applicant-error">
            {error}
          </div>
        )}

        {/* Nothing Selected */}
        {!selectedJob && !error && (
          <div className="applicants-empty">

            <div className="empty-icon">
              👥
            </div>

            <h2>
              Select a job to view applicants
            </h2>

            <p>
              Choose one of your job postings from the dropdown above.
            </p>

          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="applicants-empty">

            <div className="empty-icon">
              ⏳
            </div>

            <h2>
              Loading applicants...
            </h2>

          </div>
        )}

        {/* Applicants */}
        {selectedJob &&
          !loading &&
          !error && (
            <section className="applicants-section">

              <div className="applicants-section-header">

                <div>
                  <h2>
                    Candidate Applications
                  </h2>

                  <p>
                    {applicants.length} applicant
                    {applicants.length !== 1
                      ? "s"
                      : ""} found • Candidates are ranked by AI skill match
                  </p>
                </div>

                <div className="applicant-count">
                  {applicants.length}
                </div>

              </div>

              {applicants.length === 0 ? (

                <div className="applicants-empty small">

                  <div className="empty-icon">
                    📭
                  </div>

                  <h2>
                    No applicants yet
                  </h2>

                  <p>
                    Candidates who apply for this job
                    will appear here.
                  </p>

                </div>

              ) : (

                <div className="applicant-list">

                  {rankedApplicants.map((application, index) => {

                    const candidate = application.user;

                    const status =
                      application.status || "APPLIED";

                    return (
                      <div
                        className="applicant-card"
                        key={application.id}
                        style={{ position: "relative" }}
                      >

                        {/* AI Ranking */}
                        {getFinalScore(application) !== null && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              padding: "6px 10px",
                              borderRadius: "999px",
                              background:
                                index === 0
                                  ? "#ecfdf3"
                                  : index === 1
                                  ? "#eff6ff"
                                  : "#f8fafc",
                              color:
                                index === 0
                                  ? "#047857"
                                  : index === 1
                                  ? "#2563eb"
                                  : "#475467",
                              fontSize: "11px",
                              fontWeight: "800",
                            }}
                          >
                            #{index + 1} • {getFinalScore(application)}%{" "}
                            {index === 0 ? "Top Candidate" : "Score"}
                          </div>
                        )}

                        {/* Avatar */}
                        <div className="candidate-avatar">
                          {candidate?.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        {/* Candidate Info */}
                        <div className="candidate-info">

                          <h3>
                            {candidate?.fullName ||
                              "Candidate"}
                          </h3>

                          <p>
                            {candidate?.email ||
                              "Email not available"}
                          </p>

                        </div>

                        {/* Status + AI Match Score */}
                        <div className="application-details">

                          <span
                            className={`application-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              marginTop: "8px",
                            }}
                          >
                            {matchScores[application.id] !== null &&
                              matchScores[application.id] !== undefined && (
                                <span
                                  style={{
                                    padding: "5px 9px",
                                    borderRadius: "999px",
                                    background: "#eef2ff",
                                    color: "#4f46e5",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                  }}
                                >
                                  🎯 Match {matchScores[application.id]}%
                                </span>
                              )}

                            {atsScores[application.id] !== null &&
                              atsScores[application.id] !== undefined && (
                                <span
                                  style={{
                                    padding: "5px 9px",
                                    borderRadius: "999px",
                                    background: "#f0fdf4",
                                    color: "#15803d",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                  }}
                                >
                                  📄 ATS {atsScores[application.id]}%
                                </span>
                              )}

                            {getFinalScore(application) !== null && (
                              <span
                                style={{
                                  padding: "5px 9px",
                                  borderRadius: "999px",
                                  background: "#111827",
                                  color: "#ffffff",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                }}
                              >
                                ⭐ Final {getFinalScore(application)}%
                              </span>
                            )}
                          </div>

                          <span className="application-date">
                            Applied:{" "}
                            {application.appliedAt
                              ? new Date(
                                  application.appliedAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>

                        </div>

                        {/* Actions */}
                        <div className="applicant-actions">

                          {status !== "SHORTLISTED" && (
                            <button
                              className="shortlist-btn"
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onClick={() =>
                                updateStatus(
                                  application.id,
                                  "SHORTLISTED"
                                )
                              }
                            >
                              {updatingId ===
                              application.id
                                ? "Updating..."
                                : "✓ Shortlist"}
                            </button>
                          )}

                          {status !== "REJECTED" && (
                            <button
                              className="reject-btn"
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onClick={() =>
                                updateStatus(
                                  application.id,
                                  "REJECTED"
                                )
                              }
                            >
                              {updatingId ===
                              application.id
                                ? "Updating..."
                                : "✕ Reject"}
                            </button>
                          )}

                          <button
  className="view-candidate-btn"
  onClick={() => {
    if (candidate?.id) {
      navigate(`/recruiter/candidate/${candidate.id}`);
    } else {
      alert("Candidate ID not available");
    }
  }}
>
  View Candidate
</button>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

            </section>
          )}

      </main>

    </div>
  );
}

export default Applicants;