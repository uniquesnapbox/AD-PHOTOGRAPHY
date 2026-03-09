import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";

const FALLBACK_UPI_ID = import.meta.env.VITE_UPI_ID || "";
const FALLBACK_UPI_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || "AD Photography";

function Payment() {
  const { bookingId } = useParams();
  const { token, apiBaseUrl } = useAuth();
  const [booking, setBooking] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [paymentReference, setPaymentReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [qrImage, setQrImage] = useState("");

  const advanceAmount = useMemo(() => {
    if (!booking) return 0;
    return Number(booking.advance_amount ?? booking.advance_payment ?? 0);
  }, [booking]);

  const effectiveUpiId = paymentSettings?.upi_id || FALLBACK_UPI_ID;
  const effectiveUpiName = paymentSettings?.upi_name || FALLBACK_UPI_NAME;

  const upiUrl = useMemo(() => {
    if (!booking || !effectiveUpiId || advanceAmount <= 0) return "";
    const amount = advanceAmount.toFixed(2);
    const note = encodeURIComponent(`Advance payment for booking #${booking.id}`);
    return `upi://pay?pa=${encodeURIComponent(effectiveUpiId)}&pn=${encodeURIComponent(
      effectiveUpiName
    )}&am=${amount}&cu=INR&tn=${note}`;
  }, [advanceAmount, booking, effectiveUpiId, effectiveUpiName]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Unauthorized session.");
      return;
    }

    async function loadBookingAndSettings() {
      try {
        setLoading(true);
        setError("");

        const [bookingResponse, settingsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/client/bookings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${apiBaseUrl}/api/client/payment-settings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const bookingData = await parseJsonSafe(bookingResponse);
        const settingsData = await parseJsonSafe(settingsResponse);

        if (!bookingResponse.ok) {
          logApiError("Payment page booking fetch failed", {
            status: bookingResponse.status,
            response: bookingData,
            bookingId,
          });
          setError(bookingData?.message || "Unable to load booking details.");
          return;
        }

        const item = (bookingData.bookings || []).find((entry) => String(entry.id) === String(bookingId));
        if (!item) {
          setError("Booking not found in your account.");
          return;
        }

        setBooking(item);

        if (settingsResponse.ok) {
          setPaymentSettings(settingsData.payment_settings || {});
        } else {
          logApiError("Payment settings fetch failed", {
            status: settingsResponse.status,
            response: settingsData,
          });
          setPaymentSettings({});
        }
      } catch (err) {
        logApiError("Payment page request error", {
          error: err?.message || err,
          bookingId,
        });
        setError("Unable to connect to backend API.");
      } finally {
        setLoading(false);
      }
    }

    loadBookingAndSettings();
  }, [apiBaseUrl, bookingId, token]);

  useEffect(() => {
    if (!upiUrl) {
      setQrImage("");
      return;
    }

    QRCode.toDataURL(upiUrl, { width: 260, margin: 1 })
      .then((url) => setQrImage(url))
      .catch((err) => {
        logApiError("UPI QR generation failed", {
          error: err?.message || err,
          upiUrl,
        });
        setError("Unable to generate UPI QR code.");
      });
  }, [upiUrl]);

  const markPaymentDone = async () => {
    if (!booking) return;

    if (!paymentReference.trim()) {
      setStatus({ type: "error", message: "Please enter payment reference / UTR number." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`${apiBaseUrl}/api/client/bookings/${booking.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_reference: paymentReference.trim(),
          advance_amount: advanceAmount,
        }),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        logApiError("Booking payment mark failed", {
          status: response.status,
          response: data,
          bookingId: booking.id,
          payment_reference: paymentReference.trim(),
        });
        setStatus({ type: "error", message: data?.message || "Payment update failed." });
        return;
      }

      setBooking(data.booking);
      setStatus({
        type: "success",
        message: "Payment marked as paid. Invoice generated and email sent to client.",
      });
    } catch (err) {
      logApiError("Booking payment request error", {
        error: err?.message || err,
        bookingId: booking.id,
      });
      setStatus({ type: "error", message: "Unable to connect to backend API." });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInvoice = async () => {
    if (!booking) return;

    try {
      const response = await fetch(`${apiBaseUrl}/api/client/bookings/${booking.id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await parseJsonSafe(response);
        logApiError("Invoice download failed", {
          status: response.status,
          response: data,
          bookingId: booking.id,
        });
        setStatus({ type: "error", message: data?.message || "Invoice download failed." });
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
      logApiError("Invoice download request error", {
        error: err?.message || err,
        bookingId: booking.id,
      });
      setStatus({ type: "error", message: "Unable to download invoice." });
    }
  };

  return (
    <>
      <SEO title="Advance Payment" path={`/client-portal/payment/${bookingId}`} description="Pay booking advance and download invoice." />
      <section className="section-gap bg-white">
        <div className="container-wrap max-w-5xl">
          <SectionHeading eyebrow="Payment" title="Advance Payment" description="Scan UPI QR and confirm payment to generate your invoice instantly." />

          {loading && <p className="mt-8 text-slate-500">Loading booking details...</p>}
          {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

          {!loading && !error && booking && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-ink">Booking Details</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p><span className="font-semibold">Name:</span> {booking.name}</p>
                  <p><span className="font-semibold">Event:</span> {booking.event_type}</p>
                  <p><span className="font-semibold">Event Date:</span> {booking.event_date}</p>
                  <p><span className="font-semibold">Status:</span> {booking.status}</p>
                  <p><span className="font-semibold">Payment Status:</span> {booking.payment_status}</p>
                  <p><span className="font-semibold">Advance Amount:</span> INR {advanceAmount.toFixed(2)}</p>
                </div>

                <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-ink">Instructions</p>
                  <p className="mt-2">1. Scan the QR using any UPI app.</p>
                  <p>2. Complete payment for the exact advance amount.</p>
                  <p>3. Enter UTR/reference number and click "I have paid".</p>
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  <p className="font-semibold text-ink">Bank Transfer Details</p>
                  <p className="mt-2"><span className="font-semibold">Bank Name:</span> {paymentSettings?.bank_name || "-"}</p>
                  <p><span className="font-semibold">Account Holder:</span> {paymentSettings?.account_name || "-"}</p>
                  <p><span className="font-semibold">Account Number:</span> {paymentSettings?.account_number || "-"}</p>
                  <p><span className="font-semibold">IFSC:</span> {paymentSettings?.ifsc_code || "-"}</p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/client-portal" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                    Back to Client Portal
                  </Link>
                  {booking.payment_status === "paid" && (
                    <button type="button" className="btn-primary" onClick={downloadInvoice}>Download Invoice</button>
                  )}
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
                <h2 className="text-lg font-bold text-ink">Pay via UPI QR</h2>

                {booking.status !== "approved" && <p className="mt-4 text-sm text-red-600">Booking must be approved by admin before payment.</p>}

                {booking.status === "approved" && advanceAmount <= 0 && <p className="mt-4 text-sm text-red-600">Advance amount is not configured yet. Please contact AD Photography admin.</p>}

                {!effectiveUpiId && (
                  <p className="mt-4 text-sm text-red-600">UPI ID is not configured by admin yet. Please contact AD Photography.</p>
                )}

                {booking.status === "approved" && advanceAmount > 0 && effectiveUpiId && (
                  <>
                    {qrImage && (
                      <div className="mt-5 inline-flex rounded-xl border border-slate-200 p-3">
                        <img src={qrImage} alt="UPI QR code" className="h-56 w-56" />
                      </div>
                    )}

                    <div className="mt-4 text-sm text-slate-700">
                      <p><span className="font-semibold">UPI ID:</span> {effectiveUpiId}</p>
                      <p><span className="font-semibold">Payee:</span> {effectiveUpiName}</p>
                    </div>

                    <a href={upiUrl || "#"} className="mt-4 inline-block rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400 hover:text-black">Open UPI Payment Link</a>

                    {booking.payment_status !== "paid" && (
                      <div className="mt-5 space-y-3">
                        <label className="block text-sm font-medium text-slate-700">
                          Payment Reference / UTR Number
                          <input type="text" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Enter UTR / transaction reference" />
                        </label>
                        <button type="button" onClick={markPaymentDone} disabled={submitting} className="btn-primary disabled:opacity-70">
                          {submitting ? "Please wait..." : "I have paid"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {status.message && <p className={`mt-5 text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{status.message}</p>}
              </article>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Payment;

