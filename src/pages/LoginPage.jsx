import { useState } from "react";
import { getCurrentUser, loginUser } from "../api/authApi";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
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

      const data = await loginUser(formData);
      localStorage.setItem("token", data.data.token);
      const loggedInUser = await getCurrentUser();
      setCurrentUser(loggedInUser);
      setStatus("success");
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setStatus("error");
    }
  }

  return (
    <section className="page-panel narrow-panel">
      <p className="page-kicker">Auth</p>
      <h1>Login</h1>
      <form className="template-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFieldChange}
            placeholder="mbappe@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleFieldChange}
            placeholder="Password"
          />
        </label>
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Logging in..." : "Login"}
        </button>
      </form>

      {status === "success" && currentUser && (
        <div>
          <p className="page-copy">Logged in successfully.</p>
          <p className="page-copy">Logged in as {currentUser.displayName}</p>
        </div>
      )}
      {status === "error" && <p className="page-copy">{error}</p>}
    </section>
  );
}

export default LoginPage;
