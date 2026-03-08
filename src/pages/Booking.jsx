import { useState } from "react";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  event_type: "Wedding Photography",
  event_date: "",
  location: "",
  message: "",
};

function Booking() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", message: data?.message || "Booking failed." });
      } else {
        setStatus({ type: "success", message: "Booking submitted successfully." });
        setForm(initialForm);
      }
    } catch {
      setStatus({ type: "error", message: "Unable to connect to booking API." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Booking" path="/booking" description="Book your photography session with AD Photography." />
      <section className="section-gap bg-white">
        <div className="container-wrap max-w-3xl">
          <SectionHeading eyebrow="Booking" title="Book Your Photoshoot" description="Fill this form to create your booking request." center />

          <form onSubmit={onSubmit} className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Name<input name="name" value={form.name} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Phone<input name="phone" value={form.phone} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Email<input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Event Type<select name="event_type" value={form.event_type} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"><option>Wedding Photography</option><option>Pre Wedding Shoot</option><option>Event Photography</option><option>Boudoir Photography</option><option>Cinematography</option><option>Product Photography and Videography</option><option>Baby Photography</option><option>Portrait and Fashion Photography</option><option>Couple Photography</option></select></label>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Event Date<input type="date" name="event_date" value={form.event_date} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-medium text-slate-700">Location<input name="location" value={form.location} onChange={onChange} required className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">Message<textarea name="message" value={form.message} onChange={onChange} rows={5} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" /></label>
            {status.message && <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{status.message}</p>}
            <button type="submit" disabled={submitting} className="btn-primary mt-5 disabled:opacity-60">{submitting ? "Submitting..." : "Submit Booking"}</button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Booking;
