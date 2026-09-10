import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    selectionRate: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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
    fetchAnalytics(parsedUser.token);
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

  const fetchAnalytics = async (token) => {
    try {
      setAnalyticsLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/recruiter/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      const data = await response.json();

      setAnalytics({
        totalJobs: Number(data.totalJobs ?? 0),
        activeJobs: Number(data.activeJobs ?? 0),
        totalApplicants: Number(data.totalApplicants ?? 0),
        applied: Number(data.applied ?? 0),
        shortlisted: Number(data.shortlisted ?? 0),
        rejected: Number(data.rejected ?? 0),
        selectionRate: Number(data.selectionRate ?? 0),
      });
    } catch (error) {
      console.error("Analytics loading error:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

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
                {analyticsLoading ? "—" : analytics.totalJobs}
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
                {analyticsLoading ? "—" : analytics.activeJobs}
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
                {analyticsLoading ? "—" : analytics.totalApplicants}
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
                {analyticsLoading ? "—" : analytics.shortlisted}
              </strong>
            </div>

          </div>

        </div>


        {/* ================= HIRING OVERVIEW ================= */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Hiring Overview</h2>
              <p>Real-time application status from your recruitment pipeline.</p>
            </div>

            <span
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "#eef2ff",
                color: "#4f46e5",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {analyticsLoading ? "Updating..." : "Live Analytics"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {[
              ["Applied", analytics.applied, "#6366f1"],
              ["Shortlisted", analytics.shortlisted, "#10b981"],
              ["Rejected", analytics.rejected, "#ef4444"],
            ].map(([label, value, barColor]) => (
              <div
                key={label}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                  {label}
                </span>
                <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "8px" }}>
                  {analyticsLoading ? "—" : value}
                </div>
                <div
                  style={{
                    height: "7px",
                    borderRadius: "999px",
                    background: "#e2e8f0",
                    marginTop: "12px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: analytics.totalApplicants
                        ? `${Math.min((value / analytics.totalApplicants) * 100, 100)}%`
                        : "0%",
                      height: "100%",
                      background: barColor,
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "18px 20px",
              borderRadius: "16px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>
                Selection Rate
              </span>
              <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
                {analyticsLoading ? "—" : `${analytics.selectionRate.toFixed(2)}%`}
              </div>
            </div>

            <button
              onClick={() => navigate("/recruiter/applicants")}
              style={{
                border: "none",
                padding: "10px 16px",
                borderRadius: "10px",
                background: "#111827",
                color: "#ffffff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Review Applicants →
            </button>
          </div>
        </section>


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