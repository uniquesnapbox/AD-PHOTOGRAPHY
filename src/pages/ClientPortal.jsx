import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";

function ClientPortal() {
  const { user, token, apiBaseUrl } = useAuth();
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [galleryError, setGalleryError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");
  const [selectingId, setSelectingId] = useState("");
  const [images, setImages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [preview, setPreview] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!token) {
      setGalleryLoading(false);
      setBookingLoading(false);
      setGalleryError("Unauthorized session.");
      setBookingError("Unauthorized session.");
      return;
    }

    async function fetchPhotos() {
      try {
        setGalleryLoading(true);
        setGalleryError("");
        const res = await fetch(`${apiBaseUrl}/api/client/photos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await parseJsonSafe(res);
        if (!res.ok) {
          logApiError("Client photos fetch failed", {
            status: res.status,
            response: data,
          });
          throw new Error("Failed to fetch files.");
        }

        const mapped = (data.photos || []).map((file) => ({
          id: file.id,
          name: file.name,
          createdTime: file.created_time,
          image: file.image,
          downloadUrl: file.download_url,
        }));
        setImages(mapped);
      } catch (err) {
        logApiError("Client photos request error", {
          error: err?.message || err,
        });
        setGalleryError("Unable to load gallery. Please contact AD Photography support.");
      } finally {
        setGalleryLoading(false);
      }
    }

    async function fetchSelections() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/client/selections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await parseJsonSafe(res);
        if (res.ok) {
          setSelectedPhotoIds(data.selected_photo_ids || []);
        } else {
          logApiError("Client selections fetch failed", {
            status: res.status,
            response: data,
          });
        }
      } catch (err) {
        logApiError("Client selections request error", {
          error: err?.message || err,
        });
      }
    }

    async function fetchBookings() {
      try {
        setBookingLoading(true);
        setBookingError("");
        const res = await fetch(`${apiBaseUrl}/api/client/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await parseJsonSafe(res);
        if (!res.ok) {
          logApiError("Client bookings fetch failed", {
            status: res.status,
            response: data,
          });
          setBookingError(data?.message || "Unable to load bookings.");
          return;
        }
        setBookings(data.bookings || []);
      } catch (err) {
        logApiError("Client bookings request error", {
          error: err?.message || err,
        });
        setBookingError("Unable to connect to booking API.");
      } finally {
        setBookingLoading(false);
      }
    }

    fetchPhotos();
    fetchSelections();
    fetchBookings();
  }, [apiBaseUrl, token]);

  const selectPhoto = async (photoId) => {
    if (!token || !photoId || selectedPhotoIds.includes(photoId)) return;

    setSelectingId(photoId);
    setSelectionMessage("");

    try {
      const res = await fetch(`${apiBaseUrl}/api/client/photos/${encodeURIComponent(photoId)}/select`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await parseJsonSafe(res);

      if (!res.ok) {
        logApiError("Client photo selection failed", {
          status: res.status,
          response: data,
          photoId,
        });
        setSelectionMessage(data?.message || "Unable to select photo.");
        return;
      }

      setSelectedPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));
      setSelectionMessage("Photo added to selected list.");
    } catch (err) {
      logApiError("Client photo selection request error", {
        error: err?.message || err,
        photoId,
      });
      setSelectionMessage("Unable to connect to selection API.");
    } finally {
      setSelectingId("");
    }
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

  useEffect(() => {
    if (searchParams.get("download") !== "all") return;
    if (!images.length) return;

    downloadAll();
    setSearchParams({}, { replace: true });
  }, [images, searchParams, setSearchParams]);

  const downloadInvoice = async (booking) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/client/bookings/${booking.id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await parseJsonSafe(response);
        logApiError("Client invoice download failed", {
          status: response.status,
          response: data,
          bookingId: booking.id,
        });
        setBookingError(data?.message || "Invoice download failed.");
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `${booking.invoice_number || `invoice-${booking.id}`}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      logApiError("Client invoice download request error", {
        error: err?.message || err,
        bookingId: booking.id,
      });
      setBookingError("Unable to download invoice.");
    }
  };

  const amountFor = (booking) => Number(booking.advance_amount ?? booking.advance_payment ?? 0);

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
              <Link to="/client-portal/selected-images" className="btn-primary">
                Selected Images ({selectedPhotoIds.length})
              </Link>
              <button type="button" onClick={downloadAll} className="btn-primary">
                Download All
              </button>
              <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Share on WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-ink">Your Bookings & Payments</h2>
            {bookingLoading && <p className="mt-4 text-slate-500">Loading your bookings...</p>}
            {!bookingLoading && bookingError && <p className="mt-4 text-sm text-red-600">{bookingError}</p>}

            {!bookingLoading && !bookingError && (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {bookings.map((booking) => (
                  <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-500">Booking #{booking.id}</p>
                        <h3 className="mt-1 text-lg font-bold text-ink">{booking.event_type}</h3>
                        <p className="mt-1 text-sm text-slate-600">Event Date: {booking.event_date}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                      <p><span className="font-semibold">Payment:</span> {booking.payment_status}</p>
                      <p><span className="font-semibold">Advance:</span> INR {amountFor(booking).toFixed(2)}</p>
                      <p className="sm:col-span-2"><span className="font-semibold">Reference:</span> {booking.payment_reference || "-"}</p>
                      <p className="sm:col-span-2"><span className="font-semibold">Invoice:</span> {booking.invoice_number || "Not generated"}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.status === "approved" && booking.payment_status !== "paid" && (
                        <Link to={`/client-portal/payment/${booking.id}`} className="btn-primary px-4 py-2">
                          Pay Advance
                        </Link>
                      )}

                      {booking.payment_status === "paid" && (
                        <button
                          type="button"
                          onClick={() => downloadInvoice(booking)}
                          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100"
                        >
                          Download Invoice
                        </button>
                      )}
                    </div>
                  </article>
                ))}

                {!bookingLoading && bookings.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    No bookings found for your account.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-ink">Your Private Gallery</h2>
              {selectionMessage && <p className="text-sm text-emerald-600">{selectionMessage}</p>}
            </div>
            {galleryLoading && <p className="mt-6 text-slate-500">Loading your gallery...</p>}
            {!galleryLoading && galleryError && <p className="mt-6 text-sm text-red-600">{galleryError}</p>}

            {!galleryLoading && !galleryError && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((img) => {
                  const isSelected = selectedPhotoIds.includes(img.id);

                  return (
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
                            onClick={() => selectPhoto(img.id)}
                            disabled={isSelected || selectingId === img.id}
                            className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                              isSelected
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 text-slate-700 hover:bg-accent-100"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                          >
                            {isSelected ? "Selected" : selectingId === img.id ? "Saving..." : "Favourite"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
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



