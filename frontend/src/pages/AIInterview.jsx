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

  // AI evaluation result
  const [evaluation, setEvaluation] = useState(null);

  const questions = [
    "Tell us about yourself and your technical experience.",

    "What is the difference between an ArrayList and a LinkedList in Java?",

    "What is REST API and how does it work?",

    "Explain the difference between authentication and authorization.",

    "Describe one technical project you have worked on and the challenges you faced.",
  ];

  // ================= START INTERVIEW =================

  const handleStartInterview = () => {
    if (!role) {
      alert("Please select an interview role.");
      return;
    }

    setStarted(true);
  };

  // ================= BACK =================

  const handleBack = () => {
    navigate("/candidate-dashboard");
  };

  // ================= NEXT QUESTION =================

  const handleNextQuestion = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer before continuing.");
      return;
    }

    // Save current answer
    const updatedAnswers = [
      ...answers,
      {
        question: questions[currentQuestion],
        answer: answer.trim(),
      },
    ];

    setAnswers(updatedAnswers);
    setAnswer("");

    // ================= MOVE TO NEXT QUESTION =================

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }

    // ================= FINAL QUESTION =================

    setSaving(true);

    try {
      // -----------------------------------------
      // STEP 1: Send answers to Python AI Service
      // -----------------------------------------

      const aiResponse = await fetch(
        "http://127.0.0.1:8000/api/evaluate-interview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answers: updatedAnswers,
          }),
        }
      );

      if (!aiResponse.ok) {
        throw new Error("AI evaluation failed");
      }

      const aiData = await aiResponse.json();

      console.log("AI Evaluation:", aiData);

      // Check Python response
      if (aiData.error) {
        throw new Error(aiData.error);
      }

      // Save AI result in frontend state
      setEvaluation(aiData);

      // -----------------------------------------
      // STEP 2: Save result in Java Backend
      // -----------------------------------------

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

            score: String(aiData.score),

            technicalScore: String(aiData.technicalScore),

            communicationScore: String(aiData.communicationScore),

            problemSolvingScore: String(
              aiData.problemSolvingScore
            ),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save interview");
      }

      const savedInterview = await response.json();

      console.log(
        "Interview saved successfully:",
        savedInterview
      );

      // -----------------------------------------
      // STEP 3: Show result screen
      // -----------------------------------------

      setCompleted(true);

    } catch (error) {
      console.error(
        "Interview evaluation/save error:",
        error
      );

      alert(
        "Interview result could not be generated. Please make sure both AI Service and backend are running."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= RETAKE =================

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswer("");
    setAnswers([]);
    setEvaluation(null);

    setCompleted(false);
    setStarted(false);
    setSaving(false);
  };

  // ================= LOGIN CHECK =================

  if (!user) {
    navigate("/login");
    return null;
  }

  // ================= RESULT SCREEN =================

  if (completed && evaluation) {
    return (
      <div className="ai-interview-page">

        {/* Header */}

        <div className="ai-interview-header">

          <div>
            <p className="dashboard-label">
              TALMETRY AI
            </p>

            <h1>
              Interview Result
            </h1>

            <p>
              Your mock interview performance has been
              evaluated by Talmetry AI.
            </p>
          </div>

          <button
            className="back-dashboard-btn"
            onClick={handleBack}
          >
            ← Dashboard
          </button>

        </div>


        {/* Result Card */}

        <div className="interview-result-card">

          <div className="result-icon">
            🎯
          </div>

          <h1>
            Interview Completed!
          </h1>

          <p className="result-subtitle">
            Great job! Here is your Talmetry AI interview
            performance.
          </p>


          {/* Overall Score */}

          <div className="score-circle">
            <span>
              {evaluation.score}
            </span>

            <small>
              /100
            </small>
          </div>

          <h2>
            Overall Score
          </h2>


          {/* Score Grid */}

          <div className="result-grid">

            <div className="result-box">
              <span>
                Technical
              </span>

              <strong>
                {evaluation.technicalScore}%
              </strong>
            </div>


            <div className="result-box">
              <span>
                Communication
              </span>

              <strong>
                {evaluation.communicationScore}%
              </strong>
            </div>


            <div className="result-box">
              <span>
                Problem Solving
              </span>

              <strong>
                {evaluation.problemSolvingScore}%
              </strong>
            </div>

          </div>


          {/* Strengths */}

          <div className="feedback-section">

            <h3>
              ✅ Strengths
            </h3>

            <ul>

              {evaluation.strengths &&
              evaluation.strengths.length > 0 ? (

                evaluation.strengths.map(
                  (strength, index) => (
                    <li key={index}>
                      {strength}
                    </li>
                  )
                )

              ) : (

                <li>
                  Shows good understanding of
                  technical concepts.
                </li>

              )}

            </ul>

          </div>


          {/* Areas To Improve */}

          <div className="feedback-section">

            <h3>
              ⚠️ Areas to Improve
            </h3>

            <ul>

              {evaluation.areasToImprove &&
              evaluation.areasToImprove.length > 0 ? (

                evaluation.areasToImprove.map(
                  (area, index) => (
                    <li key={index}>
                      {area}
                    </li>
                  )
                )

              ) : (

                <li>
                  Continue improving technical depth
                  and real-world examples.
                </li>

              )}

            </ul>

          </div>


          {/* Answer Evaluation */}

          {evaluation.evaluatedAnswers &&
          evaluation.evaluatedAnswers.length > 0 && (

            <div className="feedback-section">

              <h3>
                📊 Answer Evaluation
              </h3>

              <ul>

                {evaluation.evaluatedAnswers.map(
                  (item, index) => (

                    <li key={index}>

                      <strong>
                        Q{index + 1}:
                      </strong>{" "}

                      {item.score}/100

                    </li>

                  )
                )}

              </ul>

            </div>

          )}


          {/* Result Actions */}

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

            {/* Role */}

            <div className="setup-field">

              <label>
                Interview Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
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


            {/* Difficulty */}

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


          {/* Features */}

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

          {/* Interview Top */}

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


          {/* Question Card */}

          <div className="question-card">

            <span className="question-number">
              Question {currentQuestion + 1} of{" "}
              {questions.length}
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


            {/* Question Actions */}

            <div className="question-actions">

              <button
                className="secondary-button"
                onClick={() => {

                  if (!answer.trim()) {
                    alert(
                      "Please enter an answer first."
                    );
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
                  ? "Evaluating Interview..."
                  : currentQuestion ===
                    questions.length - 1
                  ? "Finish Interview"
                  : "Next Question →"}

              </button>

            </div>

          </div>


          {/* Interview Info */}

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