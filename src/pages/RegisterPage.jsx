import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  register,
  selectAuthError,
  selectAuthStatus,
} from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const location = useLocation();
  const navigate = useNavigate();

  function handleFieldChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await dispatch(register(formData)).unwrap();
      navigate(location.state?.from || "/", { replace: true });
    } catch {
      // auth slice stores the error here
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

      {status === "error" && <p className="page-copy">{error}</p>}
    </section>
  );
}

export default RegisterPage;
