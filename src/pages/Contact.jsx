import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import ContactForm from "../components/ContactForm";
import { company } from "../data/siteData";

function Contact() {
  return (
    <>
      <SEO
        title="Contact / Booking"
        path="/contact"
        description="Book your photoshoot with AD Photography using the contact form, WhatsApp, phone, and location map."
      />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Contact / Booking"
            title="Book a Photoshoot"
            description="Send your requirements and preferred date. We will confirm availability and package details."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <ContactForm />
            <div className="space-y-5">
              <article className="rounded-xl border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-ink">Contact Information</h3>
                <p className="mt-3 text-slate-600">
                  <strong>Phone:</strong> {company.phone}
                </p>
                <p className="mt-2 text-slate-600">
                  <strong>Email:</strong> {company.email}
                </p>
                <p className="mt-2 text-slate-600">
                  <strong>Address:</strong> {company.address}
                </p>
                <a
                  href={`https://wa.me/${company.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-5 px-5 py-2.5"
                >
                  Chat on WhatsApp
                </a>
              </article>

              <article className="overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title="AD Photography Location"
                  src={company.mapEmbed}
                  width="100%"
                  height="320"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Contact;
