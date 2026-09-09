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
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/job/${jobId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }

      const data = await response.json();
      setApplicants(data);
    } catch (err) {
      setError("Unable to load applicants.");
      setApplicants([]);
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
                      : ""} found
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

                  {applicants.map((application) => {

                    const candidate = application.user;

                    const status =
                      application.status || "APPLIED";

                    return (
                      <div
                        className="applicant-card"
                        key={application.id}
                      >

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

                        {/* Status */}
                        <div className="application-details">

                          <span
                            className={`application-status ${status.toLowerCase()}`}
                          >
                            {status}
                          </span>

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