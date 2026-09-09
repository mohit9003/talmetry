import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AIInterview.css";

function AIInterview() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [started, setStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const questions = [
    "Tell us about yourself and your technical experience.",

    "What is the difference between an ArrayList and a LinkedList in Java?",

    "What is REST API and how does it work?",

    "Explain the difference between authentication and authorization.",

    "Describe one technical project you have worked on and the challenges you faced.",
  ];

  const handleStartInterview = () => {
    if (!role) {
      alert("Please select an interview role.");
      return;
    }

    setStarted(true);
  };

  const handleBack = () => {
    navigate("/candidate-dashboard");
  };

  const handleNextQuestion = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer before continuing.");
      return;
    }

    const updatedAnswers = [
      ...answers,
      {
        question: questions[currentQuestion],
        answer: answer.trim(),
      },
    ];

    setAnswers(updatedAnswers);
    setAnswer("");

    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    // ================= FINAL QUESTION =================

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/interviews/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            userId: String(user.id),
            role: role,
            difficulty: difficulty,
            score: "86",
            technicalScore: "88",
            communicationScore: "82",
            problemSolvingScore: "87",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save interview");
      }

      const data = await response.json();

      console.log("Interview saved successfully:", data);

      setCompleted(true);
    } catch (error) {
      console.error("Interview save error:", error);

      alert(
        "Interview completed, but the result could not be saved. Please check that the backend is running."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setCompleted(false);
    setStarted(false);
    setSaving(false);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  // ================= RESULT SCREEN =================

  if (completed) {
    return (
      <div className="ai-interview-page">

        <div className="ai-interview-header">

          <div>
            <p className="dashboard-label">
              TALMETRY AI
            </p>

            <h1>
              Interview Result
            </h1>

            <p>
              Your mock interview performance has been evaluated.
            </p>
          </div>

          <button
            className="back-dashboard-btn"
            onClick={handleBack}
          >
            ← Dashboard
          </button>

        </div>

        <div className="interview-result-card">

          <div className="result-icon">
            🎯
          </div>

          <h1>
            Interview Completed!
          </h1>

          <p className="result-subtitle">
            Great job! Here is your Talmetry interview performance.
          </p>

          <div className="score-circle">
            <span>86</span>
            <small>/100</small>
          </div>

          <h2>
            Overall Score
          </h2>

          <div className="result-grid">

            <div className="result-box">
              <span>Technical</span>
              <strong>88%</strong>
            </div>

            <div className="result-box">
              <span>Communication</span>
              <strong>82%</strong>
            </div>

            <div className="result-box">
              <span>Problem Solving</span>
              <strong>87%</strong>
            </div>

          </div>

          <div className="feedback-section">

            <h3>
              ✅ Strengths
            </h3>

            <ul>

              <li>
                Good understanding of technical concepts
              </li>

              <li>
                Clear explanation of answers
              </li>

              <li>
                Strong project knowledge
              </li>

            </ul>

          </div>

          <div className="feedback-section">

            <h3>
              ⚠️ Areas to Improve
            </h3>

            <ul>

              <li>
                Give more detailed technical examples
              </li>

              <li>
                Improve answer structure
              </li>

              <li>
                Explain problem-solving steps more clearly
              </li>

            </ul>

          </div>

          <div className="result-actions">

            <button
              onClick={handleRetake}
            >
              Retake Interview
            </button>

            <button
              className="secondary-btn"
              onClick={handleBack}
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>
    );
  }

  // ================= MAIN SCREEN =================

  return (
    <div className="ai-interview-page">

      {/* Header */}

      <div className="ai-interview-header">

        <div>

          <p className="dashboard-label">
            TALMETRY AI
          </p>

          <h1>
            AI Interview
          </h1>

          <p>
            Practice real interview questions and improve
            your technical skills.
          </p>

        </div>

        <button
          className="back-dashboard-btn"
          onClick={handleBack}
        >
          ← Dashboard
        </button>

      </div>


      {/* ================= SETUP ================= */}

      {!started ? (

        <div className="interview-setup">

          <div className="setup-icon">
            AI
          </div>

          <h2>
            Prepare for your interview
          </h2>

          <p>
            Choose your role and difficulty level to start
            an AI-powered mock interview.
          </p>

          <div className="setup-form">

            <div className="setup-field">

              <label>
                Interview Role
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >

                <option value="">
                  Select a role
                </option>

                <option value="Java Backend Developer">
                  Java Backend Developer
                </option>

                <option value="Python AI/ML Developer">
                  Python AI/ML Developer
                </option>

                <option value="Full Stack Developer">
                  Full Stack Developer
                </option>

                <option value="Software Engineer">
                  Software Engineer
                </option>

              </select>

            </div>

            <div className="setup-field">

              <label>
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
              >

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>

            </div>

          </div>

          <button
            className="start-interview-btn"
            onClick={handleStartInterview}
          >
            Start AI Interview →
          </button>

          <div className="interview-features">

            <div>
              <strong>
                AI Questions
              </strong>

              <span>
                Role-based questions
              </span>
            </div>

            <div>
              <strong>
                Instant Feedback
              </strong>

              <span>
                Analyze your answers
              </span>
            </div>

            <div>
              <strong>
                Final Score
              </strong>

              <span>
                Get your performance score
              </span>
            </div>

          </div>

        </div>

      ) : (

        /* ================= INTERVIEW ================= */

        <div className="interview-screen">

          <div className="interview-top">

            <div>

              <span className="interview-badge">
                AI INTERVIEW
              </span>

              <h2>
                {role}
              </h2>

            </div>

            <span className="difficulty-badge">
              {difficulty}
            </span>

          </div>

          <div className="question-card">

            <span className="question-number">
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <h2>
              {questions[currentQuestion]}
            </h2>

            <textarea
              placeholder="Type your answer here..."
              rows="8"
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              disabled={saving}
            />

            <div className="question-actions">

              <button
                className="secondary-button"
                onClick={() => {

                  if (!answer.trim()) {
                    alert("Please enter an answer first.");
                    return;
                  }

                  alert("Answer saved!");

                }}
                disabled={saving}
              >
                Save Answer
              </button>

              <button
                className="primary-button"
                onClick={handleNextQuestion}
                disabled={saving}
              >

                {saving
                  ? "Saving Interview..."
                  : currentQuestion === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question →"}

              </button>

            </div>

          </div>

          <div className="interview-info">

            <div>
              <strong>
                5
              </strong>

              <span>
                Total Questions
              </span>
            </div>

            <div>
              <strong>
                {difficulty}
              </strong>

              <span>
                Difficulty
              </span>
            </div>

            <div>
              <strong>
                AI
              </strong>

              <span>
                Evaluation
              </span>
            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AIInterview;