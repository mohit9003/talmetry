import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./InterviewHistory.css";

function InterviewHistory() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/interviews/user/${user.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch interview history");
        }

        return response.json();
      })
      .then((data) => {
        setInterviews(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Interview history error:", error);
        setError("Unable to load interview history.");
        setLoading(false);
      });
  }, [navigate, user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div className="interview-history-page">

      <div className="history-header">

        <div>
          <p className="dashboard-label">
            TALMETRY AI
          </p>

          <h1>
            Interview History
          </h1>

          <p>
            View your previous interview performance and scores.
          </p>
        </div>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/candidate-dashboard")}
        >
          ← Dashboard
        </button>

      </div>

      {loading && (
        <div className="history-state">
          Loading interview history...
        </div>
      )}

      {error && (
        <div className="history-state error">
          {error}
        </div>
      )}

      {!loading && !error && interviews.length === 0 && (
        <div className="history-empty">

          <div className="empty-icon">
            🎯
          </div>

          <h2>
            No Interviews Yet
          </h2>

          <p>
            Complete your first AI interview to see your results here.
          </p>

          <button
            onClick={() => navigate("/ai-interview")}
          >
            Start AI Interview →
          </button>

        </div>
      )}

      {!loading && !error && interviews.length > 0 && (

        <div className="history-list">

          {interviews.map((interview) => (

            <div
              className="history-card"
              key={interview.id}
            >

              <div className="history-card-top">

                <div>
                  <span className="history-badge">
                    AI INTERVIEW
                  </span>

                  <h2>
                    {interview.role}
                  </h2>

                  <p>
                    Difficulty: {interview.difficulty}
                  </p>
                </div>

                <div className="history-score">
                  <strong>
                    {interview.score}
                  </strong>

                  <span>
                    /100
                  </span>
                </div>

              </div>

              <div className="history-stats">

                <div>
                  <span>
                    Technical
                  </span>

                  <strong>
                    {interview.technicalScore}%
                  </strong>
                </div>

                <div>
                  <span>
                    Communication
                  </span>

                  <strong>
                    {interview.communicationScore}%
                  </strong>
                </div>

                <div>
                  <span>
                    Problem Solving
                  </span>

                  <strong>
                    {interview.problemSolvingScore}%
                  </strong>
                </div>

                <div>
                  <span>
                    Completed
                  </span>

                  <strong>
                    {interview.completedAt
                      ? new Date(
                          interview.completedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default InterviewHistory;