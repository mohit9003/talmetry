import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Applications.css";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/applications/user/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch applications");
      }

      const data = await response.json();

      setApplications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  return (
    <div className="applications-page">

      <div className="applications-header">
        <div>
          <h1>My Applications</h1>
          <p>Track all the jobs you have applied for.</p>
        </div>

        <button
          className="browse-jobs-btn"
          onClick={() => navigate("/recommended-jobs")}
        >
          Browse Jobs
        </button>
      </div>

      {loading && (
        <div className="applications-state">
          <h3>Loading applications...</h3>
        </div>
      )}

      {!loading && error && (
        <div className="applications-state error-state">
          <h3>{error}</h3>
          <button onClick={fetchApplications}>Try Again</button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="applications-state">
          <div className="empty-icon">📄</div>
          <h2>No applications yet</h2>
          <p>
            You haven't applied for any jobs yet. Explore recommended jobs
            and start applying.
          </p>

          <button
            className="browse-jobs-btn"
            onClick={() => navigate("/recommended-jobs")}
          >
            Find Jobs
          </button>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="applications-list">

          {applications.map((application) => (
            <div className="application-card" key={application.id}>

              <div className="application-main">

                <div className="company-logo">
                  {application.job?.company
                    ? application.job.company.charAt(0).toUpperCase()
                    : "C"}
                </div>

                <div className="application-info">
                  <h2>{application.job?.title || "Job Position"}</h2>

                  <p className="company-name">
                    {application.job?.company || "Company"}
                  </p>

                  <div className="job-meta">
                    {application.job?.location && (
                      <span>📍 {application.job.location}</span>
                    )}

                    {application.job?.jobType && (
                      <span>💼 {application.job.jobType}</span>
                    )}
                  </div>
                </div>

              </div>

              <div className="application-side">

                <span
                  className={`application-status ${
                    application.status?.toLowerCase() || "applied"
                  }`}
                >
                  {application.status || "APPLIED"}
                </span>

                <p className="applied-date">
                  Applied{" "}
                  {application.appliedAt
                    ? new Date(application.appliedAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Recently"}
                </p>

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
          ))}

        </div>
      )}

    </div>
  );
}

export default Applications;