import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === "string") return [item];
        if (item && typeof item === "object") {
          return Object.values(item).map(String);
        }
        return [];
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\s*(?:,|\n|\r\n)\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value == null) return [];

  return [String(value).trim()].filter(Boolean);
};

const normalizeAnalysis = (data) => {
  const source = data?.analysis || data?.result || data || {};

  return {
    atsScore: Number(
      source.atsScore ??
      source.ats_score ??
      source.score ??
      0
    ),

    extractedSkills: normalizeList(
      source.extractedSkills ??
      source.extracted_skills ??
      source.skills
    ),

    strengths: normalizeList(source.strengths),

    weaknesses: normalizeList(
      source.weaknesses ??
      source.areasToImprove ??
      source.areas_to_improve
    ),

    suggestions: normalizeList(
      source.suggestions ??
      source.recommendations
    ),
  };
};
function Resume() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [file, setFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.token) {
      navigate("/login");
      return;
    }

    const fetchResumeAndAnalysis = async () => {
      try {
        // Fetch uploaded resume
        const resumeResponse = await fetch(
          `http://localhost:8080/api/candidate/resume/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          setUploadedResume(resumeData);

          // Fetch existing analysis
          const analysisResponse = await fetch(
            `http://localhost:8080/api/candidate/resume-analysis/${resumeData.id}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();

console.log(
  "SAVED ANALYSIS RESPONSE:",
  analysisData
);

setAnalysis(normalizeAnalysis(analysisData));
          }
        }
      } catch (error) {
        console.log("Resume/Analysis fetch error:", error);
      }
    };

    fetchResumeAndAnalysis();
  }, [user?.id, user?.token, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("Only PDF and DOCX files are allowed.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5 MB.");
      setFile(null);
      return;
    }

    setMessage("");
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a resume first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/candidate/resume/${user.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume upload failed");
      }

      setUploadedResume(data);
      setAnalysis(null);
      setFile(null);
      setMessage("Resume uploaded successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleViewResume = async () => {
    try {
      setMessage("");

      const response = await fetch(
        `http://localhost:8080/api/candidate/resume/download/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to open resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      setMessage(error.message || "Unable to open resume");
    }
  };

  const handleAnalyzeResume = async () => {
  if (!uploadedResume) {
    setMessage("Please upload a resume first.");
    return;
  }

  setAnalyzing(true);
  setMessage("🤖 AI is analyzing your resume...");

  try {
    const response = await fetch(
      `http://localhost:8080/api/candidate/resume-analysis/${uploadedResume.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const data = await response.json();

    console.log("RAW AI ANALYSIS RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error ||
        "Resume analysis failed"
      );
    }

    const normalizedData = normalizeAnalysis(data);

    console.log(
      "NORMALIZED ANALYSIS:",
      normalizedData
    );

    setAnalysis(normalizedData);

    const saveResponse = await fetch(
  `http://localhost:8080/api/candidate/resume/analysis/${uploadedResume.id}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      atsScore: normalizedData.atsScore,
      extractedSkills: normalizedData.extractedSkills.join(", "),
      strengths: normalizedData.strengths.join(", "),
      weaknesses: normalizedData.weaknesses.join(", "),
      suggestions: normalizedData.suggestions.join(", "),
    }),
  }
);

if (!saveResponse.ok) {
  console.warn("AI analysis generated but could not be saved.");
} else {
  console.log("AI analysis saved successfully.");
}

    const hasResult =
      normalizedData.atsScore > 0 ||
      normalizedData.extractedSkills.length > 0 ||
      normalizedData.strengths.length > 0 ||
      normalizedData.weaknesses.length > 0 ||
      normalizedData.suggestions.length > 0;

    if (hasResult) {
      setMessage("✅ Resume analyzed successfully!");
    } else {
      setMessage(
        "⚠️ Analysis completed, but no result fields were returned."
      );
    }

  } catch (error) {
    console.error("Analysis Error:", error);

    setMessage(
      `❌ ${error.message || "Unable to analyze resume"}`
    );
  } finally {
    setAnalyzing(false);
  }
};

  return (
    <div className="resume-page">

      <div className="resume-card">

        <button
          className="back-button"
          onClick={() => navigate("/candidate-dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="resume-icon">
          📄
        </div>

        <h1>Upload Your Resume</h1>

        <p>
          Upload your latest resume to get AI-powered skill analysis,
          job matching and ATS insights.
        </p>

        {/* Uploaded Resume */}

        {uploadedResume && (
          <div className="uploaded-resume">

            <div className="uploaded-file-icon">
              📄
            </div>

            <div className="uploaded-file-info">
              <strong>
                {uploadedResume.fileName}
              </strong>

              <span>
                Resume uploaded successfully
              </span>
            </div>

            <button
              type="button"
              className="view-resume-button"
              onClick={handleViewResume}
            >
              View
            </button>

            <button
              type="button"
              className="analyze-resume-button"
              onClick={handleAnalyzeResume}
              disabled={analyzing}
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>

            <div className="uploaded-status">
              ✓
            </div>

          </div>
        )}

        {/* Upload Form */}

        <form onSubmit={handleUpload}>

          <label className="resume-upload-box">

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

            <span className="upload-title">
              {file ? file.name : "Choose your resume"}
            </span>

            <span className="upload-subtitle">
              PDF or DOCX • Maximum 5 MB
            </span>

          </label>

          <button
            type="submit"
            className="upload-button"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>

        </form>

        {message && (
          <div className="resume-message">
            <span>{message}</span>

            {message.startsWith("❌") && uploadedResume && (
              <button
                type="button"
                className="retry-analysis-button"
                onClick={handleAnalyzeResume}
                disabled={analyzing}
              >
                🔄 Retry Analysis
              </button>
            )}
          </div>
        )}

        {/* AI Analysis */}

        {analysis && (
          <div className="analysis-section">

            <div className="analysis-header">
              <div>
                <span className="analysis-label">
                  AI RESUME ANALYSIS
                </span>

                <h2>
                  Your Resume Performance
                </h2>
              </div>

              <div className="ats-score">
                <span>{analysis.atsScore}</span>
                <small>/100</small>
                <label>ATS Score</label>
              </div>
            </div>

            {/* Skills */}

            <div className="analysis-card">

              <h3>🛠️ Extracted Skills</h3>

              <div className="skills-list">
                {analysis.extractedSkills.length > 0 ? (
                  analysis.extractedSkills.map((skill, index) => (
                    <span key={index}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills detected.</p>
                )}
              </div>

            </div>

            {/* Strengths */}

            <div className="analysis-card">

              <h3>💪 Strengths</h3>

              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((item, index) => (
                  <div
                    className="analysis-item strength"
                    key={index}
                  >
                    ✓ {item}
                  </div>
                ))
              ) : (
                <p>No strengths detected.</p>
              )}

            </div>

            {/* Weaknesses */}

            <div className="analysis-card">

              <h3>⚠️ Areas to Improve</h3>

              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map((item, index) => (
                  <div
                    className="analysis-item weakness"
                    key={index}
                  >
                    • {item}
                  </div>
                ))
              ) : (
                <p>No major weaknesses detected.</p>
              )}

            </div>

            {/* Suggestions */}

            <div className="analysis-card">

              <h3>💡 AI Suggestions</h3>

              {analysis.suggestions.length > 0 ? (
                analysis.suggestions.map((item, index) => (
                  <div
                    className="analysis-item suggestion"
                    key={index}
                  >
                    → {item}
                  </div>
                ))
              ) : (
                <p>No suggestions available.</p>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Resume;