import SEO from "../components/SEO";
import { Link } from "react-router-dom";
import { photographer } from "../data/siteData";

function About() {
  return (
    <>
      <SEO
        title="About Photographer"
        path="/about"
        description="Meet Arindam Dey from AD Photography and explore his experience, visual style, and studio setup."
      />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">About</p>
            <h1 className="mt-3 text-3xl font-bold text-ink sm:text-5xl">About AD Photography</h1>
            <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-600">
              Professional photography studio delivering wedding, portrait, event, and cinematic stories with creative direction and trusted service since 2013.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[380px,1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <img
                src={photographer.profileImage}
                alt="AD Photography profile"
                className="h-96 w-full rounded-xl object-cover"
              />
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="text-lg font-semibold text-ink">{photographer.name}</p>
                <p className="mt-1 text-sm text-slate-600">Founder, AD Photography</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <p className="leading-8 text-slate-700">
                  AD Photography has been providing professional photography services since 2013, serving clients across Assam and beyond. With years of experience capturing weddings, portraits, events, and studio photography, we focus on creating timeless and high-quality images that preserve real moments and emotions.
                </p>
                <p className="mt-5 leading-8 text-slate-700">
                  Our work combines creativity, professional equipment, and attention to detail to deliver photographs that clients can cherish for years. Over the years we have built strong relationships with clients throughout Assam and other regions by delivering reliable service and beautiful results.
                </p>
                <p className="mt-5 leading-8 text-slate-700">
                  Whether it is a wedding, personal portrait, or special event, AD Photography is committed to capturing every important moment with professionalism and artistic vision.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-soft">
                  <p className="text-2xl font-bold text-brand-500">2013</p>
                  <p className="mt-1 text-sm text-slate-600">Serving Since</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-soft">
                  <p className="text-2xl font-bold text-brand-500">1000+</p>
                  <p className="mt-1 text-sm text-slate-600">Shoots Completed</p>
                </article>
                <article className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-soft">
                  <p className="text-2xl font-bold text-brand-500">Assam+</p>
                  <p className="mt-1 text-sm text-slate-600">Regional Coverage</p>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <h2 className="text-xl font-semibold text-ink">Why Clients Trust AD Photography</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>• Professional planning and punctual shoot execution</p>
                  <p>• Premium cameras, lenses, lighting, and post-production workflow</p>
                  <p>• Clear communication, transparent delivery timelines, and quality-first output</p>
                </div>
                <div className="mt-6">
                  <Link to="/contact" className="btn-primary">
                    Book a Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
