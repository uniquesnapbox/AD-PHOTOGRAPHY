import { useState } from "react";
import emailjs from "@emailjs/browser";

const initialState = {
  name: "",
  email: "",
  phone: "",
  service: "Wedding Photography",
  date: "",
  message: "",
};

function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus({
        type: "error",
        message:
          "Email service is not configured yet. Please add EmailJS keys in your .env file.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: form.name,
          from_email: form.email,
          phone: form.phone,
          service: form.service,
          date: form.date,
          message: form.message,
        },
        { publicKey }
      );
      setStatus({ type: "success", message: "Message sent successfully. We will contact you shortly." });
      setForm(initialState);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again or contact us via WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Phone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Select Service
          <select
            name="service"
            value={form.service}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          >
            <option>Wedding Photography</option>
            <option>Pre Wedding Shoot</option>
            <option>Event Photography</option>
            <option>Boudoir Photography</option>
            <option>Cinematography</option>
            <option>Product Photography and Videography</option>
            <option>Baby Photography</option>
            <option>Portrait and Fashion Photography</option>
            <option>Couple Photography</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Preferred Shoot Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Project Details
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={5}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
          />
        </label>
      </div>

      {status.message && (
        <p
          className={`mt-4 text-sm ${
            status.type === "success" ? "text-brand-600" : "text-red-600"
          }`}
        >
          {status.message}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary mt-5 disabled:opacity-60">
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default ContactForm;
