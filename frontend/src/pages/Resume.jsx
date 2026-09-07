import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Resume() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [file, setFile] = useState(null);
  const [uploadedResume, setUploadedResume] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/candidate/resume/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUploadedResume(data);
        }
      } catch (error) {
        console.log("Resume fetch error:", error);
      }
    };

    fetchResume();
  }, [user.id, user.token]);

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
      setFile(null);
      setMessage("Resume uploaded successfully!");

    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  // View resume
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
              className="view-resume-button"
              onClick={handleViewResume}
            >
              View
            </button>

            <div className="uploaded-status">
              ✓
            </div>

          </div>
        )}

        <form onSubmit={handleUpload}>

          <label className="resume-upload-box">

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

            <span className="upload-title">
              {file
                ? file.name
                : "Choose your resume"}
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
            {uploading
              ? "Uploading..."
              : "Upload Resume"}
          </button>

        </form>

        {message && (
          <div className="resume-message">
            {message}
          </div>
        )}

      </div>

    </div>
  );
}

export default Resume;