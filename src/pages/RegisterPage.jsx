import { useState } from "react";

import { getCurrentUser, registerUser } from "../api/authApi";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  function handleFieldChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setStatus("loading");
      setError("");

      const data = await registerUser(formData);

      localStorage.setItem("token", data.data.token);

      const loggedInUser = await getCurrentUser();

      setCurrentUser(loggedInUser);
      setStatus("success");
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setStatus("error");
    }
  }

  return (
    <section className="page-panel narrow-panel">
      <p className="page-kicker">Auth</p>
      <h1>Create Account</h1>

      <form className="template-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleFieldChange}
            placeholder="nextupmike"
          />
        </label>

        <label>
          Display name
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleFieldChange}
            placeholder="NextUp Mike"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFieldChange}
            placeholder="mike@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleFieldChange}
            placeholder="Create password"
          />
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {status === "success" && currentUser && (
        <div>
          <p className="page-copy">Account created successfully.</p>
          <p className="page-copy">Logged in as {currentUser.displayName}</p>
        </div>
      )}

      {status === "error" && <p className="page-copy">{error}</p>}
    </section>
  );
}

export default RegisterPage;
