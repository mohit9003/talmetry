import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RecommendedJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/jobs/recommended/${user.id}`)
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to load jobs");
        }

        return response.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Recommended jobs error:", err);
        setError("Unable to load recommended jobs.");
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="recommended-jobs-page">

      <div className="recommended-jobs-header">
        <div>
          <p className="page-eyebrow">AI POWERED</p>
          <h1>Recommended Jobs</h1>
          <p>
            Jobs matched with your resume skills.
          </p>
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/candidate-dashboard")}
        >
          ← Dashboard
        </button>
      </div>

      {loading && (
        <div className="jobs-message">
          Finding the best jobs for you...
        </div>
      )}

      {error && (
        <div className="jobs-message error">
          {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="jobs-message">
          No matching jobs found yet.
        </div>
      )}

      <div className="recommended-jobs-grid">

        {jobs.map((job) => (

          <div className="job-card" key={job.id}>

            <div className="job-card-top">

              <div>
                <h2>{job.title}</h2>
                <p className="job-company">
                  {job.company}
                </p>
              </div>

              <div className="match-score">
                <strong>{job.matchScore}%</strong>
                <span>Match</span>
              </div>

            </div>

            <div className="job-info">

              <span>📍 {job.location}</span>
              <span>💼 {job.jobType}</span>
              <span>💰 {job.salary}</span>

            </div>

            <p className="job-description">
              {job.description}
            </p>

            <div className="job-skills">

              {job.requiredSkills
                ?.split(",")
                .map((skill, index) => (
                  <span key={index}>
                    {skill.trim()}
                  </span>
                ))}

            </div>

            <div className="job-match-info">
              <span>
                {job.matchedSkills} of {job.totalRequiredSkills} skills matched
              </span>

              <span>
                Experience: {job.experience}
              </span>
            </div>

            <button
  className="apply-job-button"
  onClick={() => navigate(`/job/${job.id}`)}
>
  View Job
</button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RecommendedJobs;