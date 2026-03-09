import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/blog/${encodeURIComponent(slug)}`);
        const data = await parseJsonSafe(response);

        if (!response.ok) {
          logApiError("Load blog post failed", {
            status: response.status,
            response: data,
            slug,
          });
          setError(data?.message || "Blog post not found.");
          return;
        }

        setPost(data.post || null);
        setRelated(data.related_posts || []);
      } catch (err) {
        logApiError("Load blog post request error", {
          error: err?.message || err,
          slug,
        });
        setError("Unable to connect to blog API.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  const seoTitle = post?.seo_title || post?.title || "Blog";
  const seoDescription = post?.seo_description || post?.excerpt || "Read this blog post from AD Photography.";

  return (
    <>
      <SEO
        title={seoTitle}
        path={`/blog/${slug}`}
        description={seoDescription}
        image={post?.featured_image_url || "/logo.jpg"}
        type="article"
      />

      <section className="section-gap bg-white">
        <div className="container-wrap max-w-4xl">
          {loading && <p className="text-slate-500">Loading article...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && post && (
            <article>
              <Link to="/blog" className="text-sm font-semibold text-brand-500 hover:text-brand-700">
                Back to Blog
              </Link>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{post.title}</h1>
              {post.excerpt && <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>}

              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="mt-6 w-full rounded-xl border border-slate-200 object-cover"
                />
              )}

              <div
                className="prose prose-slate mt-8 max-w-none leading-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {related.length > 0 && (
                <div className="mt-12 border-t border-slate-200 pt-8">
                  <h2 className="text-2xl font-bold text-ink">Related Posts</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    {related.map((item) => (
                      <article key={item.id} className="rounded-xl border border-slate-200 p-4 shadow-soft">
                        <h3 className="text-base font-bold text-ink">{item.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{item.excerpt || "Read this post."}</p>
                        <Link to={`/blog/${item.slug}`} className="mt-3 inline-block text-sm font-semibold text-brand-500 hover:text-brand-700">
                          Read More
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    </>
  );
}

export default BlogPost;
