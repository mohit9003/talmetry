import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("CANDIDATE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data);
        return;
      }

      // Store logged-in user
      localStorage.setItem("user", JSON.stringify(data));

      // Check selected role
      if (data.role !== role) {
        setMessage(
          `This account is registered as ${data.role.toLowerCase()}.`
        );
        return;
      }

      setMessage("Login successful!");

      // Temporary redirect
      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (error) {
      setMessage("Backend server is not running.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>Login to continue with Talmetry.</p>

        {/* Role Selection */}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <div className="password-wrapper">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>

          </div>

          <button type="submit">
            Login as{" "}
            {role === "CANDIDATE" ? "Candidate" : "Recruiter"}
          </button>

        </form>

        {/* Login Message */}
        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}

        {/* Register Link */}
        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;