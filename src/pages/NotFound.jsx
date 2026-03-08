import { Link } from "react-router-dom";
import SEO from "../components/SEO";

function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        path="/404"
        description="The page you are looking for does not exist."
      />
      <section className="section-gap">
        <div className="container-wrap text-center">
          <h1 className="text-4xl font-bold text-ink">404</h1>
          <p className="mt-3 text-slate-600">The page you requested could not be found.</p>
          <Link to="/" className="btn-primary mt-6">
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}

export default NotFound;
