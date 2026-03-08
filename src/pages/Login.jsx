import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/client-portal" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login(form);
    if (!result.ok) {
      setStatus(result.message);
      return;
    }
    setStatus("");
    navigate("/client-portal");
  };

  return (
    <>
      <SEO
        title="Client Login"
        path="/login"
        description="Client login for AD Photography."
      />
      <section className="section-gap bg-white">
        <div className="container-wrap max-w-2xl">
          <SectionHeading
            eyebrow="Client Login"
            title="Login to Your Client Account"
            description="Use your email and password to access your client dashboard."
            center
          />
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
          >
            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
              />
            </label>

            {status && <p className="mt-3 text-sm text-red-600">{status}</p>}

            <button type="submit" className="btn-primary mt-5">
              Login
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;
