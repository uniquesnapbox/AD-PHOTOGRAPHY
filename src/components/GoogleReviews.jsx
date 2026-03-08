import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.places) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps script.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
}

function formatReviewDate(unixSeconds) {
  if (!unixSeconds) return "";
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

function Stars({ rating = 0 }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rounded ? "text-accent-400" : "text-slate-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

function GoogleReviews() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placeName, setPlaceName] = useState("AD Photography");
  const [reviews, setReviews] = useState([]);
  const [googleUrl, setGoogleUrl] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID;

  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      if (!apiKey || !placeId) {
        if (isMounted) {
          setError("Google Reviews is not configured yet.");
          setLoading(false);
        }
        return;
      }

      try {
        await loadGoogleMaps(apiKey);
        if (!window.google?.maps?.places) throw new Error("Google Places library not available.");

        const container = document.createElement("div");
        const service = new window.google.maps.places.PlacesService(container);

        service.getDetails(
          {
            placeId,
            fields: ["name", "rating", "reviews", "url"],
          },
          (result, status) => {
            if (!isMounted) return;

            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !result) {
              setError("Unable to load Google reviews at the moment.");
              setLoading(false);
              return;
            }

            setPlaceName(result.name || "AD Photography");
            setGoogleUrl(result.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`);

            const latestReviews = [...(result.reviews || [])]
              .sort((a, b) => (b.time || 0) - (a.time || 0))
              .slice(0, 6);

            setReviews(latestReviews);
            setLoading(false);
          }
        );
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load Google reviews at the moment.");
        setLoading(false);
      }
    }

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [apiKey, placeId]);

  const hasReviews = useMemo(() => reviews.length > 0, [reviews]);

  return (
    <section className="section-gap bg-white">
      <div className="container-wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Google Reviews</p>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">What Clients Say on Google</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Latest verified customer reviews from our Google Business Profile.
            </p>
          </div>

          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              View all reviews on Google
            </a>
          )}
        </div>

        <div className="mt-8">
          {loading && <p className="text-slate-500">Loading Google reviews...</p>}
          {!loading && error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && hasReviews && (
            <>
              <p className="mb-4 text-sm font-medium text-slate-600">{placeName}</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <motion.article
                    key={`${review.author_name}-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-ink">{review.author_name}</p>
                        <p className="text-xs text-slate-500">
                          {review.relative_time_description || formatReviewDate(review.time)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-slate-500">{formatReviewDate(review.time)}</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default GoogleReviews;
