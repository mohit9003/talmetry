import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageJobs.css";

function ManageJobs() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "RECRUITER") {
      navigate("/candidate-dashboard");
      return;
    }

    setUser(parsedUser);
    fetchJobs();
  }, [navigate]);

  // ================= FETCH JOBS =================

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/jobs"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error("Jobs loading error:", error);
      setMessage("Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE JOB =================

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(jobId);
      setMessage("");

      const response = await fetch(
        `http://localhost:8080/api/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      setJobs((previousJobs) =>
        previousJobs.filter(
          (job) => job.id !== jobId
        )
      );

      setMessage("Job deleted successfully.");

    } catch (error) {
      console.error("Delete job error:", error);
      setMessage(
        "Unable to delete job. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="manage-jobs-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="manage-sidebar">

        <div className="manage-logo">

          <div className="manage-logo-mark">
            T
          </div>

          <div>
            <h2>Talmetry</h2>
            <span>Recruiter Portal</span>
          </div>

        </div>


        <nav className="manage-nav">

          <button
            onClick={() =>
              navigate("/recruiter-dashboard")
            }
          >
            <span>▦</span>
            Dashboard
          </button>

          <button className="active">
            <span>💼</span>
            Manage Jobs
          </button>

          <button
            onClick={() =>
              navigate("/recruiter/create-job")
            }
          >
            <span>＋</span>
            Create Job
          </button>

          <button
            onClick={() =>
              navigate("/recruiter/applicants")
            }
          >
            <span>👥</span>
            Applicants
          </button>

        </nav>


        <button
          className="manage-logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="manage-main">

        {/* HEADER */}

        <div className="manage-header">

          <div>

            <p className="dashboard-label">
              RECRUITER PORTAL
            </p>

            <h1>
              Manage Jobs
            </h1>

            <p>
              Create, manage and track your job openings.
            </p>

          </div>


          <div className="manage-header-actions">

            <button
              className="back-btn"
              onClick={() =>
                navigate("/recruiter-dashboard")
              }
            >
              ← Dashboard
            </button>

            <button
              className="new-job-btn"
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              + Create Job
            </button>

          </div>

        </div>


        {/* STATS */}

        <div className="job-summary">

          <div className="summary-card">

            <span>
              Total Jobs
            </span>

            <strong>
              {jobs.length}
            </strong>

          </div>


          <div className="summary-card">

            <span>
              Open Jobs
            </span>

            <strong>
              {
                jobs.filter(
                  (job) => job.status === "OPEN"
                ).length
              }
            </strong>

          </div>


          <div className="summary-card">

            <span>
              Closed Jobs
            </span>

            <strong>
              {
                jobs.filter(
                  (job) => job.status !== "OPEN"
                ).length
              }
            </strong>

          </div>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="manage-message">
            {message}
          </div>
        )}


        {/* JOBS */}

        <section className="jobs-section">

          <div className="jobs-section-header">

            <div>
              <h2>
                Your Job Postings
              </h2>

              <p>
                Manage your current job openings.
              </p>
            </div>

          </div>


          {loading ? (

            <div className="jobs-empty">
              <div className="loading-spinner">
                ⏳
              </div>

              <h3>
                Loading jobs...
              </h3>
            </div>

          ) : jobs.length === 0 ? (

            <div className="jobs-empty">

              <div className="empty-job-icon">
                💼
              </div>

              <h3>
                No jobs posted yet
              </h3>

              <p>
                Create your first job opening to start
                receiving applications.
              </p>

              <button
                onClick={() =>
                  navigate("/recruiter/create-job")
                }
              >
                Create New Job
              </button>

            </div>

          ) : (

            <div className="jobs-grid">

              {jobs.map((job) => (

                <div
                  className="manage-job-card"
                  key={job.id}
                >

                  {/* CARD TOP */}

                  <div className="manage-job-top">

                    <div className="manage-job-title">

                      <div className="manage-job-icon">
                        💼
                      </div>

                      <div>

                        <h3>
                          {job.title}
                        </h3>

                        <p>
                          {job.company}
                        </p>

                      </div>

                    </div>


                    <span
                      className={
                        job.status === "OPEN"
                          ? "manage-status open"
                          : "manage-status closed"
                      }
                    >
                      {job.status}
                    </span>

                  </div>


                  {/* LOCATION */}

                  <div className="job-location">
                    📍 {job.location}
                    <span>•</span>
                    {job.jobType}
                  </div>


                  {/* DESCRIPTION */}

                  <p className="manage-job-description">
                    {job.description}
                  </p>


                  {/* DETAILS */}

                  <div className="manage-job-details">

                    <div>
                      <span>Salary</span>
                      <strong>
                        {job.salary || "Not specified"}
                      </strong>
                    </div>

                    <div>
                      <span>Experience</span>
                      <strong>
                        {job.experience || "Not specified"}
                      </strong>
                    </div>

                  </div>


                  {/* SKILLS */}

                  <div className="manage-skills">

                    <span className="skills-label">
                      Required Skills
                    </span>

                    <div className="skill-list">

                      {job.requiredSkills
                        ? job.requiredSkills
                            .split(",")
                            .map((skill, index) => (
                              <span key={index}>
                                {skill.trim()}
                              </span>
                            ))
                        : (
                          <span>
                            No skills specified
                          </span>
                        )}

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="manage-job-actions">

                    <button
                      className="view-job-btn"
                      onClick={() =>
                        navigate(`/job/${job.id}`)
                      }
                    >
                      View Job
                    </button>

                    <button
                      className="delete-job-btn"
                      onClick={() =>
                        handleDelete(job.id)
                      }
                      disabled={
                        deletingId === job.id
                      }
                    >
                      {deletingId === job.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default ManageJobs;