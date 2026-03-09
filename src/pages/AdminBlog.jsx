import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";
import { clearStoredAdminAuth, getStoredAdminAuth } from "../utils/adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seo_title: "",
  seo_description: "",
  status: "draft",
  featured_image: null,
  remove_featured_image: false,
};

function AdminBlog() {
  const [auth, setAuth] = useState(() => getStoredAdminAuth());
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [posts]);

  const logout = async () => {
    try {
      if (auth?.token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
    } catch (err) {
      logApiError("Admin logout request error", {
        error: err?.message || err,
      });
    } finally {
      clearStoredAdminAuth();
      setAuth(null);
    }
  };

  const resetEditor = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setForm(initialForm);
    setEditingId(null);
    setCurrentImageUrl("");
    setPreviewUrl("");
  };

  const loadPosts = async () => {
    if (!auth?.token) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await parseJsonSafe(response);

      if (!response.ok) {
        logApiError("Admin blog list fetch failed", {
          status: response.status,
          response: data,
        });
        setError(data?.message || "Unable to load blog posts.");
        return;
      }

      setPosts(data.posts || []);
    } catch (err) {
      logApiError("Admin blog list request error", {
        error: err?.message || err,
      });
      setError("Unable to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      loadPosts();
    }
  }, [auth?.token]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    if (file) {
      setForm((prev) => ({ ...prev, featured_image: file, remove_featured_image: false }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, featured_image: null }));
    }
  };

  const submitPost = async (event) => {
    event.preventDefault();
    if (!auth?.token) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("slug", form.slug);
      body.append("excerpt", form.excerpt);
      body.append("content", form.content);
      body.append("seo_title", form.seo_title);
      body.append("seo_description", form.seo_description);
      body.append("status", form.status);

      if (form.featured_image) {
        body.append("featured_image", form.featured_image);
      }

      if (form.remove_featured_image) {
        body.append("remove_featured_image", "1");
      }

      let url = `${API_BASE_URL}/api/admin/blog`;
      let method = "POST";

      if (editingId) {
        url = `${API_BASE_URL}/api/admin/blog/${editingId}`;
        body.append("_method", "PUT");
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body,
      });

      const data = await parseJsonSafe(response);

      if (!response.ok) {
        logApiError("Admin blog save failed", {
          status: response.status,
          response: data,
          editingId,
        });
        setError(data?.message || "Unable to save blog post.");
        return;
      }

      setMessage(data?.message || "Blog post saved successfully.");
      resetEditor();
      loadPosts();
    } catch (err) {
      logApiError("Admin blog save request error", {
        error: err?.message || err,
        editingId,
      });
      setError("Unable to connect to backend API.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    setEditingId(post.id);
    setCurrentImageUrl(post.featured_image_url || "");
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      status: post.status || "draft",
      featured_image: null,
      remove_featured_image: false,
    });
  };

  const deletePost = async (postId) => {
    if (!auth?.token) return;
    if (!window.confirm("Delete this blog post permanently?")) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        logApiError("Admin blog delete failed", {
          status: response.status,
          response: data,
          postId,
        });
        setError(data?.message || "Unable to delete blog post.");
        return;
      }

      if (editingId === postId) {
        resetEditor();
      }

      setMessage(data?.message || "Blog post deleted successfully.");
      loadPosts();
    } catch (err) {
      logApiError("Admin blog delete request error", {
        error: err?.message || err,
        postId,
      });
      setError("Unable to connect to backend API.");
    }
  };

  const togglePublish = async (post) => {
    if (!auth?.token) return;

    const body = new FormData();
    body.append("_method", "PUT");
    body.append("title", post.title || "");
    body.append("slug", post.slug || "");
    body.append("excerpt", post.excerpt || "");
    body.append("content", post.content || "");
    body.append("seo_title", post.seo_title || "");
    body.append("seo_description", post.seo_description || "");
    body.append("status", post.status === "published" ? "draft" : "published");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blog/${post.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body,
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        logApiError("Admin blog publish toggle failed", {
          status: response.status,
          response: data,
          postId: post.id,
        });
        setError(data?.message || "Unable to update status.");
        return;
      }

      setMessage(data?.message || "Blog status updated.");
      loadPosts();
    } catch (err) {
      logApiError("Admin blog publish toggle request error", {
        error: err?.message || err,
        postId: post.id,
      });
      setError("Unable to connect to backend API.");
    }
  };

  if (!auth?.token) return <Navigate to="/login" replace />;

  return (
    <>
      <SEO title="Admin Blog" path="/admin/blog" description="Manage blog posts for SEO and content marketing." />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Admin"
            title="Blog Management"
            description="Create, edit, publish, and manage SEO blog posts."
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">Logged in as: <span className="font-semibold">{auth?.admin?.email}</span></p>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/bookings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Bookings</Link>
              <Link to="/admin/clients" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Clients</Link>
              <Link to="/admin/payment-settings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Payment Settings</Link>
              <button type="button" className="btn-primary" onClick={loadPosts}>Refresh</button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={logout}>Logout</button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <form onSubmit={submitPost} className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Blog Post" : "Create Blog Post"}</h3>

              <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">Title
                  <input type="text" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>

                <label className="block text-sm font-medium text-slate-700">Slug
                  <input type="text" value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} placeholder="auto-generated-if-empty" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>

                <label className="block text-sm font-medium text-slate-700">Excerpt
                  <textarea rows={3} value={form.excerpt} onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>

                <label className="block text-sm font-medium text-slate-700">Content (HTML supported)
                  <textarea rows={10} value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">SEO Title
                    <input type="text" value={form.seo_title} onChange={(event) => setForm((prev) => ({ ...prev, seo_title: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">Status
                    <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">SEO Description
                  <textarea rows={3} value={form.seo_description} onChange={(event) => setForm((prev) => ({ ...prev, seo_description: event.target.value }))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>

                <label className="block text-sm font-medium text-slate-700">Featured Image
                  <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 w-full" />
                </label>

                {(previewUrl || currentImageUrl) && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <img src={previewUrl || currentImageUrl} alt="Featured preview" className="h-44 w-full rounded-md object-cover" />
                  </div>
                )}

                {editingId && currentImageUrl && !previewUrl && (
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.remove_featured_image} onChange={(event) => setForm((prev) => ({ ...prev, remove_featured_image: event.target.checked }))} />
                    Remove existing featured image
                  </label>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}</button>
                {editingId && (
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={resetEditor}>Cancel Edit</button>
                )}
              </div>
            </form>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-bold text-ink">All Blog Posts</h3>
              {loading && <p className="mt-4 text-sm text-slate-500">Loading posts...</p>}

              <div className="mt-4 space-y-4">
                {sortedPosts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-ink">{post.title}</h4>
                        <p className="mt-1 text-xs text-slate-500">/{post.slug}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-500">{post.status}</p>
                      </div>
                      <Link to={`/blog/${post.slug}`} className="text-xs font-semibold text-brand-500 hover:text-brand-700" target="_blank" rel="noreferrer">View</Link>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(post)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-accent-100">Edit</button>
                      <button type="button" onClick={() => togglePublish(post)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-accent-100">{post.status === "published" ? "Unpublish" : "Publish"}</button>
                      <button type="button" onClick={() => deletePost(post.id)} className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </article>
                ))}

                {!loading && sortedPosts.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No blog posts yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AdminBlog;
