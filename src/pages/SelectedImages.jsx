import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";

function SelectedImages() {
  const { token, apiBaseUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Unauthorized session.");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [photosRes, selectionsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/api/client/photos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${apiBaseUrl}/api/client/selections`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const photosData = await photosRes.json();
        const selectionsData = await selectionsRes.json();

        if (!photosRes.ok) {
          setError(photosData?.message || "Unable to load gallery photos.");
          return;
        }

        if (!selectionsRes.ok) {
          setError(selectionsData?.message || "Unable to load selected images.");
          return;
        }

        const mappedImages = (photosData.photos || []).map((file) => ({
          id: file.id,
          name: file.name,
          image: file.image,
          downloadUrl: file.download_url,
          createdTime: file.created_time,
        }));

        setImages(mappedImages);
        setSelectedIds(selectionsData.selected_photo_ids || []);
      } catch {
        setError("Unable to connect to backend API.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [apiBaseUrl, token]);

  const selectedImages = useMemo(() => {
    if (!selectedIds.length || !images.length) return [];
    const selectedSet = new Set(selectedIds);
    return images.filter((img) => selectedSet.has(img.id));
  }, [images, selectedIds]);

  return (
    <>
      <SEO
        title="Selected Images"
        path="/selected-images"
        description="View all favourite photos selected by client."
      />

      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Client Portal"
            title="Selected Images"
            description="These are the photos you marked as favourites."
          />

          <div className="mt-4">
            <Link
              to="/client-portal"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100"
            >
              Back to Client Portal
            </Link>
          </div>

          {loading && <p className="mt-8 text-slate-500">Loading selected images...</p>}
          {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <p className="mt-8 text-sm text-slate-600">Total selected: {selectedImages.length}</p>

              {selectedImages.length === 0 ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  No selected images yet. Go to your gallery and click Favourite.
                </div>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {selectedImages.map((img) => (
                    <article key={img.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
                      <button type="button" className="block w-full" onClick={() => setPreview(img)}>
                        <img src={img.image} alt={img.name} loading="lazy" className="h-56 w-full object-cover" />
                      </button>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-slate-700">{img.name}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <a href={img.downloadUrl} target="_blank" rel="noreferrer" className="btn-primary px-3 py-2">
                            Download
                          </a>
                          <span className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                            Selected
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
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

export default SelectedImages;
