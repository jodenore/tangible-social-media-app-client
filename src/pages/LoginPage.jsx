import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  login,
  selectAuthError,
  selectAuthStatus,
} from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

function LoginPage() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleFieldChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate(location.state?.from || "/", { replace: true });
    } catch {
      // auth slice stores the error for the UI to display.
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

      {status === "error" && <p className="page-copy">{error}</p>}
    </section>
  );
}

export default LoginPage;
