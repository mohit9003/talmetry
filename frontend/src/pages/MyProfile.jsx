import { useEffect, useState } from "react";

function MyProfile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    location: "",
    education: "",
    experience: "",
    skills: "",
    github: "",
    linkedin: "",
  });

  // =========================
  // LOAD PROFILE
  // =========================
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !user?.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/candidate/profile/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.status === 404) {
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.log(
            `Profile loading failed: ${response.status}`,
            errorText
          );
          setLoading(false);
          return;
        }

        const data = await response.json();

        setForm({
          phone: data.phone || "",
          location: data.location || "",
          education: data.education || "",
          experience: data.experience || "",
          skills: data.skills || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });

        setProfileExists(true);
      } catch (error) {
        console.log("Could not load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SAVE / UPDATE PROFILE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user?.token) {
      alert("Session expired. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/candidate/profile/${user.id}`,
        {
          method: profileExists ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },

          body: JSON.stringify(form),
        }
      );

      // Handle errors without forcing JSON parsing
      if (!response.ok) {
        const errorText = await response.text();

        alert(
          `Error ${response.status}: ${
            errorText || "Profile request failed"
          }`
        );

        return;
      }

      // Successful response
      const data = await response.json();

      console.log("Profile response:", data);

      setProfileExists(true);

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Profile request error:", error);

      alert(
        "Unable to connect to backend. Please make sure Spring Boot is running."
      );
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // =========================
  // PROFILE PAGE
  // =========================
  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Profile Header */}
        <div className="profile-header">

          <div className="profile-big-avatar">
            {user?.fullName?.charAt(0).toUpperCase() || "C"}
          </div>

          <div>
            <p className="dashboard-label">
              MY PROFILE
            </p>

            <h1>
              {user?.fullName || "Candidate"}
            </h1>

            <p>
              {user?.email}
            </p>
          </div>

        </div>

        {/* Profile Form */}
        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* =========================
              PERSONAL INFORMATION
          ========================= */}
          <div className="profile-section">

            <h2>Personal Information</h2>

            <p>
              Keep your basic information up to date.
            </p>

            <div className="profile-form-grid">

              <div>
                <label>Full Name</label>

                <input
                  type="text"
                  value={user?.fullName || ""}
                  disabled
                />
              </div>

              <div>
                <label>Email</label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div>
                <label>Phone</label>

                <input
                  name="phone"
                  type="text"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Location</label>

                <input
                  name="location"
                  type="text"
                  placeholder="e.g. Lucknow, India"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          {/* =========================
              PROFESSIONAL INFORMATION
          ========================= */}
          <div className="profile-section">

            <h2>Professional Information</h2>

            <p>
              Tell recruiters about your professional background.
            </p>

            <div className="profile-form-grid">

              <div>
                <label>Education</label>

                <input
                  name="education"
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={form.education}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Experience</label>

                <input
                  name="experience"
                  type="text"
                  placeholder="e.g. Fresher / 1 Year"
                  value={form.experience}
                  onChange={handleChange}
                />
              </div>

            </div>

            <label>Skills</label>

            <textarea
              name="skills"
              placeholder="Java, Python, JavaScript, React, Spring Boot, SQL..."
              value={form.skills}
              onChange={handleChange}
              rows="4"
            />

          </div>

          {/* =========================
              PROFESSIONAL LINKS
          ========================= */}
          <div className="profile-section">

            <h2>Professional Links</h2>

            <p>
              Add links that help recruiters know more about you.
            </p>

            <div className="profile-form-grid">

              <div>
                <label>GitHub</label>

                <input
                  name="github"
                  type="url"
                  placeholder="https://github.com/username"
                  value={form.github}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>LinkedIn</label>

                <input
                  name="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={form.linkedin}
                  onChange={handleChange}
                />
              </div>

            </div>

          </div>

          {/* =========================
              SAVE BUTTON
          ========================= */}
          <div className="profile-actions">

            <button
              type="submit"
              className="primary-button"
            >
              {profileExists
                ? "Update Profile"
                : "Save Profile"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default MyProfile;