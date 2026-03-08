import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";

const FAV_STORAGE_KEY = "ad_client_favourites";

function ClientPortal() {
  const { user, token, apiBaseUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(`${FAV_STORAGE_KEY}_${user?.clientId || "guest"}`);
    if (raw) {
      try {
        setFavourites(JSON.parse(raw));
      } catch {
        setFavourites([]);
      }
    }
  }, [user?.clientId]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Unauthorized session.");
      return;
    }

    async function fetchPhotos() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${apiBaseUrl}/api/client/photos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch files.");
        const data = await res.json();

        const mapped = (data.photos || []).map((file) => ({
          id: file.id,
          name: file.name,
          createdTime: file.created_time,
          image: file.image,
          downloadUrl: file.download_url,
        }));
        setImages(mapped);
      } catch (err) {
        setError("Unable to load gallery. Please contact AD Photography support.");
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [apiBaseUrl, token]);

  const toggleFavourite = (fileId) => {
    const next = favourites.includes(fileId)
      ? favourites.filter((id) => id !== fileId)
      : [...favourites, fileId];
    setFavourites(next);
    localStorage.setItem(`${FAV_STORAGE_KEY}_${user?.clientId || "guest"}`, JSON.stringify(next));
  };

  const whatsappShareUrl = useMemo(() => {
    const text = encodeURIComponent(
      `AD Photography client gallery: ${window.location.origin}/client-portal`
    );
    return `https://wa.me/?text=${text}`;
  }, []);

  const downloadAll = () => {
    images.slice(0, 20).forEach((img, idx) => {
      setTimeout(() => window.open(img.downloadUrl, "_blank", "noopener,noreferrer"), idx * 300);
    });
  };

  return (
    <>
      <SEO
        title="Client Portal"
        path="/client-portal"
        description="Client portal gallery for AD Photography with private photo delivery."
      />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Client Portal</p>
              <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                Welcome, {user?.name || user?.email}
              </h1>
              <p className="mt-3 text-slate-600">
                Your gallery is loaded from your assigned Google Drive folder.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={downloadAll} className="btn-primary">
                Download All
              </button>
              <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Share on WhatsApp
              </a>
            </div>
          </div>

          {loading && <p className="mt-8 text-slate-500">Loading your gallery...</p>}
          {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((img) => (
                <article
                  key={img.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft"
                >
                  <button type="button" className="block w-full" onClick={() => setPreview(img)}>
                    <img src={img.image} alt={img.name} loading="lazy" className="h-56 w-full object-cover" />
                  </button>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-slate-700">{img.name}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <a href={img.downloadUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-2">
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleFavourite(img.id)}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100"
                      >
                        {favourites.includes(img.id) ? "★ Favourite" : "☆ Favourite"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {preview && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-h-[95vh] max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white"
            >
              Close
            </button>
            <img src={preview.image} alt={preview.name} className="max-h-[88vh] rounded-lg object-contain" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white">{preview.name}</p>
              <a href={preview.downloadUrl} target="_blank" rel="noreferrer" className="btn-primary px-4 py-2">
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ClientPortal;
