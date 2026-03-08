import { company } from "../data/siteData";

function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${company.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-400 hover:text-ink"
      aria-label="Chat on WhatsApp for booking"
    >
      Book on WhatsApp
    </a>
  );
}

export default WhatsAppButton;
