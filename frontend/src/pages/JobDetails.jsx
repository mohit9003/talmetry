import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    // Load job details
    fetch(`http://localhost:8080/api/jobs/${id}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Unable to load job");
        }

        return response.json();
      })
      .then((data) => {
        setJob(data);
      })
      .catch((error) => {
        console.error("Job details error:", error);

        setMessage(error.message || "Unable to load job details.");
        setMessageType("error");
      })
      .finally(() => {
        setLoading(false);
      });

    // Check whether candidate already applied
    fetch(`http://localhost:8080/api/applications/user/${user.id}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Unable to check application");
        }

        return response.json();
      })
      .then((applications) => {
        const hasApplied = applications.some(
          (application) =>
            application.job && String(application.job.id) === String(id)
        );

        setAlreadyApplied(hasApplied);
      })
      .catch((error) => {
        console.error("Application check error:", error);
      });
  }, [id, navigate]);

  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    // UI level duplicate protection
    if (alreadyApplied) {
      setMessage("You have already applied for this job.");
      setMessageType("warning");
      return;
    }

    setApplying(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/applications/apply?userId=${user.id}&jobId=${id}`,
        {
          method: "POST",
        }
      );

      // Try to read JSON response
      let data = null;
      const responseText = await response.text();

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }

      // Backend error
      if (!response.ok) {
        let backendMessage = "Unable to submit application.";

        if (data?.message) {
          backendMessage = data.message;
        } else if (responseText) {
          backendMessage = responseText;
        } else if (response.status === 403) {
          backendMessage =
            "You are not authorized to apply. Please login again.";
        } else if (response.status === 404) {
          backendMessage = "Job or candidate was not found.";
        }

        throw new Error(backendMessage);
      }

      // Success
      setAlreadyApplied(true);

      setMessage(
        "Application submitted successfully! 🎉"
      );

      setMessageType("success");

    } catch (error) {
      console.error("Apply error:", error);

      const errorMessage = error.message || "";

      if (
        errorMessage.toLowerCase().includes("already applied")
      ) {
        setAlreadyApplied(true);

        setMessage(
          "You have already applied for this job."
        );

        setMessageType("warning");
      } else {
        setMessage(errorMessage || "Unable to submit application.");
        setMessageType("error");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">
          <div className="job-details-card">
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <div className="job-details-container">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/recommended-jobs")}
          >
            ← Back to Jobs
          </button>

          <div className="job-details-card">
            <div className="application-message error">
              {message || "Job not found."}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">

      <div className="job-details-container">

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/recommended-jobs")}
        >
          ← Back to Jobs
        </button>

        <div className="job-details-card">

          {/* HEADER */}

          <div className="job-details-header">

            <div>
              <p className="page-eyebrow">
                JOB DETAILS
              </p>

              <h1>{job.title}</h1>

              <p className="job-details-company">
                {job.company}
              </p>
            </div>

            <span className="job-status">
              {job.status}
            </span>

          </div>


          {/* JOB INFO */}

          <div className="job-details-info">

            <span>📍 {job.location}</span>

            <span>💼 {job.jobType}</span>

            <span>💰 {job.salary}</span>

            <span>🎓 {job.experience}</span>

          </div>


          {/* DESCRIPTION */}

          <div className="job-details-section">

            <h2>
              Job Description
            </h2>

            <p>
              {job.description}
            </p>

          </div>


          {/* SKILLS */}

          <div className="job-details-section">

            <h2>
              Required Skills
            </h2>

            <div className="job-details-skills">

              {job.requiredSkills
                ?.split(",")
                .map((skill, index) => (
                  <span key={index}>
                    {skill.trim()}
                  </span>
                ))}

            </div>

          </div>


          {/* MESSAGE */}

          {message && (
            <div
              className={`application-message ${messageType}`}
            >
              {message}
            </div>
          )}


          {/* ACTIONS */}

          <div className="job-details-actions">

            <button
              className={`job-apply-button ${
                alreadyApplied ? "already-applied" : ""
              }`}
              onClick={handleApply}
              disabled={applying || alreadyApplied}
            >

              {applying
                ? "Applying..."
                : alreadyApplied
                ? "✓ Already Applied"
                : "Apply Now"}

            </button>


            <button
              className="back-dashboard-button"
              onClick={() =>
                navigate("/candidate-dashboard")
              }
            >
              Dashboard
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default JobDetails;