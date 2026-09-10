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

    if (user.role !== "CANDIDATE") {
      navigate("/candidate-dashboard");
      return;
    }

    fetchApplications();
  }, []);

  // ================= FETCH APPLICATIONS =================

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/applications/user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        throw new Error("Unable to fetch applications");
      }

      const data = await response.json();

      setApplications(data);
    } catch (err) {
      console.error("Applications error:", err);

      setError(
        err.message || "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW JOB =================

  const handleViewJob = (jobId) => {
    if (jobId) {
      navigate(`/job/${jobId}`);
    } else {
      alert("Job details not available");
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ================= UI =================

  return (
    <div className="applications-page">

      {/* ================= HEADER ================= */}

      <div className="applications-header">

        <div>
          <h1>My Applications</h1>

          <p>
            Track all the jobs you have applied for.
          </p>
        </div>

        <button
          className="browse-jobs-btn"
          onClick={() => navigate("/recommended-jobs")}
        >
          Browse Jobs
        </button>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="applications-state">
          <h3>Loading applications...</h3>
        </div>
      )}

      {/* ================= ERROR ================= */}

      {!loading && error && (
        <div className="applications-state error-state">

          <h3>{error}</h3>

          <button onClick={fetchApplications}>
            Try Again
          </button>

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading &&
        !error &&
        applications.length === 0 && (

          <div className="applications-state">

            <div className="empty-icon">
              📄
            </div>

            <h2>
              No applications yet
            </h2>

            <p>
              You haven't applied for any jobs yet.
              Explore recommended jobs and start applying.
            </p>

            <button
              className="browse-jobs-btn"
              onClick={() =>
                navigate("/recommended-jobs")
              }
            >
              Find Jobs
            </button>

          </div>
        )}

      {/* ================= APPLICATION LIST ================= */}

      {!loading &&
        !error &&
        applications.length > 0 && (

          <div className="applications-list">

            {applications.map((application) => (

              <div
                className="application-card"
                key={application.id}
              >

                {/* ================= JOB INFO ================= */}

                <div className="application-main">

                  <div className="company-logo">
                    {application.job?.company
                      ? application.job.company
                          .charAt(0)
                          .toUpperCase()
                      : "C"}
                  </div>

                  <div className="application-info">

                    <h2>
                      {application.job?.title ||
                        "Job Position"}
                    </h2>

                    <p className="company-name">
                      {application.job?.company ||
                        "Company"}
                    </p>

                    <div className="job-meta">

                      {application.job?.location && (
                        <span>
                          📍 {application.job.location}
                        </span>
                      )}

                      {application.job?.jobType && (
                        <span>
                          💼 {application.job.jobType}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* ================= APPLICATION STATUS ================= */}

                <div className="application-side">

                  <span
                    className={`application-status ${
                      application.status?.toLowerCase() ||
                      "applied"
                    }`}
                  >
                    {application.status || "APPLIED"}
                  </span>

                  <p className="applied-date">
                    Applied{" "}
                    {application.appliedAt
                      ? new Date(
                          application.appliedAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Recently"}
                  </p>

                  {/* VIEW JOB */}

                  <button
                    className="view-candidate-btn"
                    onClick={() =>
                      handleViewJob(
                        application.job?.id
                      )
                    }
                  >
                    View Job
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