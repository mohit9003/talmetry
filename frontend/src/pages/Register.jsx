import { API_URL } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [role, setRole] = useState("CANDIDATE");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: role,
          }),
        }
      );

      // Backend may return either JSON or plain text
      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        setMessage(
          typeof data === "string"
            ? data
            : data.message || "Registration failed."
        );
        return;
      }

      setMessage(
        typeof data === "string"
          ? data
          : data.message || "Registration successful!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Create Account</h1>

        <p>Join Talmetry and get started.</p>

        <div className="role-selection">

          <button
            type="button"
            className={role === "CANDIDATE" ? "active" : ""}
            onClick={() => setRole("CANDIDATE")}
          >
            Candidate
          </button>

          <button
            type="button"
            className={role === "RECRUITER" ? "active" : ""}
            onClick={() => setRole("RECRUITER")}
          >
            Recruiter
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Create{" "}
            {role === "CANDIDATE"
              ? "Candidate"
              : "Recruiter"}{" "}
            Account
          </button>

        </form>

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default Register;