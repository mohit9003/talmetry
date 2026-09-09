import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/jobs"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error("Job loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const activeJobs = jobs.filter(
    (job) => job.status === "OPEN"
  );

  return (
    <div className="dashboard-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          <div className="logo-mark">
            T
          </div>

          <div>
            <h2>Talmetry</h2>
            <span>Recruiter Portal</span>
          </div>
        </div>


        <nav className="sidebar-nav">

          <button className="active">
            <span>▦</span>
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/recruiter/jobs")
            }
          >
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


        <div className="sidebar-bottom">

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* Header */}

        <div className="dashboard-header">

          <div>

            <p className="dashboard-label">
              RECRUITER DASHBOARD
            </p>

            <h1>
              Welcome back, {user.fullName} 👋
            </h1>

            <p>
              Manage your hiring process and find the
              right talent with Talmetry AI.
            </p>

          </div>


          <div className="dashboard-user">

            <div className="user-avatar">
              {user.fullName
                ? user.fullName
                    .charAt(0)
                    .toUpperCase()
                : "R"}
            </div>

            <div>
              <strong>
                {user.fullName}
              </strong>

              <span>
                Recruiter
              </span>
            </div>

          </div>

        </div>


        {/* ================= STATS ================= */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              💼
            </div>

            <div>
              <span>
                Total Jobs
              </span>

              <strong>
                {jobs.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🟢
            </div>

            <div>
              <span>
                Active Jobs
              </span>

              <strong>
                {activeJobs.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>
              <span>
                Applicants
              </span>

              <strong>
                0
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              ⭐
            </div>

            <div>
              <span>
                Shortlisted
              </span>

              <strong>
                0
              </strong>
            </div>

          </div>

        </div>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>
              <h2>
                Quick Actions
              </h2>

              <p>
                Start managing your recruitment process.
              </p>
            </div>

          </div>


          <div className="quick-actions">

            <button
              onClick={() =>
                navigate("/recruiter/create-job")
              }
            >
              <span className="action-icon">
                ＋
              </span>

              <div>
                <strong>
                  Create New Job
                </strong>

                <span>
                  Post a new job opening
                </span>
              </div>

              <b>
                →
              </b>
            </button>


            <button
              onClick={() =>
                navigate("/recruiter/jobs")
              }
            >
              <span className="action-icon">
                💼
              </span>

              <div>
                <strong>
                  Manage Jobs
                </strong>

                <span>
                  View and manage job postings
                </span>
              </div>

              <b>
                →
              </b>
            </button>


            <button
              onClick={() =>
                navigate("/recruiter/applicants")
              }
            >
              <span className="action-icon">
                👥
              </span>

              <div>
                <strong>
                  View Applicants
                </strong>

                <span>
                  Review candidates and applications
                </span>
              </div>

              <b>
                →
              </b>
            </button>

          </div>

        </section>


        {/* ================= RECENT JOBS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <h2>
                Recent Job Postings
              </h2>

              <p>
                Your latest job openings.
              </p>

            </div>


            <button
              className="view-all-btn"
              onClick={() =>
                navigate("/recruiter/jobs")
              }
            >
              View All →
            </button>

          </div>


          {loading ? (

            <div className="empty-dashboard-card">
              Loading jobs...
            </div>

          ) : jobs.length === 0 ? (

            <div className="empty-dashboard-card">

              <div className="empty-icon">
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
                Create Your First Job
              </button>

            </div>

          ) : (

            <div className="recruiter-jobs-list">

              {jobs.slice(0, 3).map((job) => (

                <div
                  className="recruiter-job-card"
                  key={job.id}
                >

                  <div className="job-main-info">

                    <div className="job-icon">
                      💼
                    </div>

                    <div>

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.company}
                        {" • "}
                        {job.location}
                      </p>

                    </div>

                  </div>


                  <div className="job-meta">

                    <span className="job-type">
                      {job.jobType}
                    </span>

                    <span
                      className={
                        job.status === "OPEN"
                          ? "job-status open"
                          : "job-status"
                      }
                    >
                      {job.status}
                    </span>

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

export default RecruiterDashboard;