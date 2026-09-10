import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageJobs.css";

function ManageJobs() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);

  // ================= INITIAL LOAD =================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "RECRUITER") {
        navigate("/candidate-dashboard");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.token && user?.id) {
      fetchJobs();
    }
  }, [user]);

  // ================= FETCH RECRUITER JOBS =================

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/jobs/recruiter/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();

      setJobs(data);
    } catch (error) {
      console.error("Jobs loading error:", error);
      setError("Unable to load your jobs.");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE JOB =================

  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(jobId);
      setMessage("");
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError("You are not authorized to delete this job.");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete job");
      }

      setJobs((previousJobs) =>
        previousJobs.filter((job) => job.id !== jobId)
      );

      setMessage("Job deleted successfully.");

    } catch (error) {
      console.error("Delete job error:", error);
      setError("Unable to delete job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ================= OPEN EDIT MODAL =================

  const handleEdit = (job) => {
    setMessage("");
    setError("");

    setEditingJob({
      ...job,
    });
  };

  // ================= EDIT INPUT =================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditingJob((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= UPDATE JOB =================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingJob) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/jobs/${editingJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            title: editingJob.title,
            company: editingJob.company,
            location: editingJob.location,
            jobType: editingJob.jobType,
            description: editingJob.description,
            requiredSkills: editingJob.requiredSkills,
            salary: editingJob.salary,
            experience: editingJob.experience,
            status: editingJob.status,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError("You are not authorized to update this job.");
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update job");
      }

      const updatedJob = await response.json();

      setJobs((previousJobs) =>
        previousJobs.map((job) =>
          job.id === updatedJob.id ? updatedJob : job
        )
      );

      setEditingJob(null);
      setMessage("Job updated successfully.");

    } catch (error) {
      console.error("Update job error:", error);
      setError("Unable to update job. Please try again.");
    } finally {
      setSaving(false);
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

  const openJobs = jobs.filter(
    (job) => job.status === "OPEN"
  );

  const closedJobs = jobs.filter(
    (job) => job.status !== "OPEN"
  );

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

        {/* ================= STATS ================= */}

        <div className="job-summary">

          <div className="summary-card">
            <span>Total Jobs</span>
            <strong>{jobs.length}</strong>
          </div>

          <div className="summary-card">
            <span>Open Jobs</span>
            <strong>{openJobs.length}</strong>
          </div>

          <div className="summary-card">
            <span>Closed Jobs</span>
            <strong>{closedJobs.length}</strong>
          </div>

        </div>

        {/* ================= MESSAGES ================= */}

        {message && (
          <div className="manage-message success-message">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="manage-message error-message">
            ⚠ {error}
          </div>
        )}

        {/* ================= JOB SECTION ================= */}

        <section className="jobs-section">

          <div className="jobs-section-header">

            <div>
              <h2>Your Job Postings</h2>

              <p>
                Manage your current job openings.
              </p>
            </div>

            <span className="job-count">
              {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"}
            </span>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="jobs-empty">

              <div className="loading-spinner">
                ⏳
              </div>

              <h3>
                Loading jobs...
              </h3>

              <p>
                Fetching your job postings.
              </p>

            </div>

          ) : jobs.length === 0 ? (

            /* EMPTY */

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

            /* JOB GRID */

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
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
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
                      👁 View
                    </button>

                    <button
                      className="edit-job-btn"
                      onClick={() =>
                        handleEdit(job)
                      }
                    >
                      ✏ Edit
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
                        : "🗑 Delete"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* ================= EDIT MODAL ================= */}

      {editingJob && (

        <div
          className="edit-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setEditingJob(null);
            }
          }}
        >

          <div className="edit-modal">

            <div className="edit-modal-header">

              <div>
                <p>RECRUITER PORTAL</p>
                <h2>Edit Job</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setEditingJob(null)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdate}>

              <div className="edit-form-grid">

                <div className="edit-field">
                  <label>Job Title</label>
                  <input
                    name="title"
                    value={editingJob.title || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Company</label>
                  <input
                    name="company"
                    value={editingJob.company || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Location</label>
                  <input
                    name="location"
                    value={editingJob.location || ""}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="edit-field">
                  <label>Job Type</label>

                  <select
                    name="jobType"
                    value={editingJob.jobType || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">
                      Select job type
                    </option>

                    <option value="Full Time">
                      Full Time
                    </option>

                    <option value="Part Time">
                      Part Time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>
                  </select>
                </div>

                <div className="edit-field">
                  <label>Salary</label>
                  <input
                    name="salary"
                    value={editingJob.salary || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. 6-10 LPA"
                  />
                </div>

                <div className="edit-field">
                  <label>Experience</label>
                  <input
                    name="experience"
                    value={editingJob.experience || ""}
                    onChange={handleEditChange}
                    placeholder="e.g. 0-2 Years"
                  />
                </div>

                <div className="edit-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={editingJob.status || "OPEN"}
                    onChange={handleEditChange}
                  >
                    <option value="OPEN">
                      OPEN
                    </option>

                    <option value="CLOSED">
                      CLOSED
                    </option>
                  </select>
                </div>

                <div className="edit-field full">
                  <label>Required Skills</label>

                  <input
                    name="requiredSkills"
                    value={
                      editingJob.requiredSkills || ""
                    }
                    onChange={handleEditChange}
                    placeholder="Java, Spring Boot, SQL, Git"
                  />
                </div>

                <div className="edit-field full">
                  <label>Job Description</label>

                  <textarea
                    name="description"
                    value={
                      editingJob.description || ""
                    }
                    onChange={handleEditChange}
                    rows="6"
                    required
                  />
                </div>

              </div>

              <div className="edit-modal-actions">

                <button
                  type="button"
                  className="cancel-edit-btn"
                  onClick={() =>
                    setEditingJob(null)
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-edit-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "✓ Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManageJobs;