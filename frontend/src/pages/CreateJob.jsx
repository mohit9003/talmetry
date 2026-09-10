import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJob.css";

function CreateJob() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full Time",
    description: "",
    requiredSkills: "",
    salary: "",
    experience: "0-2 Years",
    status: "OPEN",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= AUTH CHECK =================

  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.role !== "RECRUITER") {
    navigate("/candidate-dashboard");
    return null;
  }

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================= CREATE JOB =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
  `http://localhost:8080/api/jobs?recruiterId=${user.id}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify(formData),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create job"
        );
      }

      console.log("Job created successfully:", data);

      setMessage(
        "Job created successfully! Redirecting..."
      );

      // Clear form
      setFormData({
        title: "",
        company: "",
        location: "",
        jobType: "Full Time",
        description: "",
        requiredSkills: "",
        salary: "",
        experience: "0-2 Years",
        status: "OPEN",
      });

      // Redirect to recruiter jobs after short delay
      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 800);

    } catch (error) {
      console.error("Create job error:", error);

      setMessage(
        error.message ||
          "Unable to create job. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="create-job-page">

      {/* ================= HEADER ================= */}

      <div className="create-job-header">

        <div>
          <p className="dashboard-label">
            RECRUITER PORTAL
          </p>

          <h1>
            Create New Job
          </h1>

          <p>
            Create a job opening and start finding
            the right talent.
          </p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() =>
            navigate("/recruiter-dashboard")
          }
        >
          ← Dashboard
        </button>

      </div>


      {/* ================= FORM CARD ================= */}

      <div className="create-job-card">

        <div className="form-heading">

          <div className="form-icon">
            💼
          </div>

          <div>
            <h2>
              Job Details
            </h2>

            <p>
              Enter the details of the position you
              want to hire for.
            </p>
          </div>

        </div>


        <form onSubmit={handleSubmit}>

          {/* ROW 1 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Job Title *
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Java Backend Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Company Name *
              </label>

              <input
                type="text"
                name="company"
                placeholder="e.g. TechNova Solutions"
                value={formData.company}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* ROW 2 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Location *
              </label>

              <input
                type="text"
                name="location"
                placeholder="e.g. Noida"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Job Type *
              </label>

              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
              >

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

          </div>


          {/* ROW 3 */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Salary
              </label>

              <input
                type="text"
                name="salary"
                placeholder="e.g. 6-10 LPA"
                value={formData.salary}
                onChange={handleChange}
              />

            </div>


            <div className="form-group">

              <label>
                Experience
              </label>

              <select
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              >

                <option value="0-2 Years">
                  0-2 Years
                </option>

                <option value="2-4 Years">
                  2-4 Years
                </option>

                <option value="4-6 Years">
                  4-6 Years
                </option>

                <option value="6+ Years">
                  6+ Years
                </option>

              </select>

            </div>

          </div>


          {/* REQUIRED SKILLS */}

          <div className="form-group">

            <label>
              Required Skills *
            </label>

            <input
              type="text"
              name="requiredSkills"
              placeholder="Java, Spring Boot, SQL, PostgreSQL, Git"
              value={formData.requiredSkills}
              onChange={handleChange}
              required
            />

            <small>
              Separate multiple skills using commas.
            </small>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Job Description *
            </label>

            <textarea
              name="description"
              rows="7"
              placeholder="Describe the role, responsibilities and requirements..."
              value={formData.description}
              onChange={handleChange}
              required
            />

          </div>


          {/* STATUS */}

          <div className="form-group">

            <label>
              Job Status
            </label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >

              <option value="OPEN">
                Open
              </option>

              <option value="CLOSED">
                Closed
              </option>

            </select>

          </div>


          {/* MESSAGE */}

          {message && (
            <div
              className={
                message.includes("successfully")
                  ? "form-message success"
                  : "form-message error"
              }
            >
              {message}
            </div>
          )}


          {/* ACTIONS */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                navigate("/recruiter-dashboard")
              }
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-job-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Job..."
                : "Create Job →"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateJob;