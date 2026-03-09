import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/api/blog`);
        const data = await parseJsonSafe(response);

        if (!response.ok) {
          logApiError("Load blog posts failed", {
            status: response.status,
            response: data,
          });
          setError(data?.message || "Unable to load blog posts.");
          return;
        }

        setPosts(data.posts || []);
      } catch (err) {
        logApiError("Load blog posts request error", {
          error: err?.message || err,
        });
        setError("Unable to connect to blog API.");
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  return (
    <>
      <SEO
        title="Blog"
        path="/blog"
        description="Photography tips, stories, and updates from AD Photography."
        image="/logo.jpg"
      />

      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="AD Photography"
            title="Blog"
            description="Photography insights, event stories, and practical tips for clients and creators."
          />

          {loading && <p className="mt-8 text-slate-500">Loading blog posts...</p>}
          {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
                  {post.featured_image_url ? (
                    <Link to={`/blog/${post.slug}`}>
                      <img src={post.featured_image_url} alt={post.title} className="h-56 w-full object-cover" loading="lazy" />
                    </Link>
                  ) : (
                    <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400">No image</div>
                  )}

                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-ink">{post.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt || "Read the full article for more details."}</p>
                    <Link to={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-brand-500 hover:text-brand-700">
                      Read More
                    </Link>
                  </div>
                </article>
              ))}

              {!loading && posts.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No published blog posts available yet.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Blog;
