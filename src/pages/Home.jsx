import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import GalleryGrid from "../components/GalleryGrid";
import TestimonialCard from "../components/TestimonialCard";
import InstagramPreview from "../components/InstagramPreview";
import GoogleReviews from "../components/GoogleReviews";
import { company, services, galleryPhotos, testimonials } from "../data/siteData";

function Home() {
  const featuredPhotos = galleryPhotos.slice(0, 6);

  return (
    <>
      <SEO
        title="Home"
        path="/"
        description="AD Photography showcases wedding, portrait, studio, and event photography with modern portfolio booking support."
      />
      <Hero />

      <section className="section-gap">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Photographer Intro"
            title="Crafting Visual Stories That Feel Personal"
            description={company.intro}
          />
        </div>
      </section>

      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Featured Portfolio"
            title="Selected Frames"
            description="A curated collection of recent wedding, event, portrait, and studio captures."
            center
          />
          <div className="mt-10">
            <GalleryGrid photos={featuredPhotos} onPhotoClick={() => {}} />
          </div>
          <div className="mt-8 text-center">
            <Link to="/work" className="btn-primary">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      <GoogleReviews />

      <section className="section-gap">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Services"
            title="Photography Services"
            description="From wedding coverage to boudoir, baby, couple, product, portrait fashion, and cinematography, every session is handled with consistent quality and professional delivery."
            center
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <ServiceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Client Feedback"
            title="What Clients Say"
            description="Trusted by couples, families, and event organizers."
            center
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <TestimonialCard key={item.name} {...item} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/contact" className="btn-primary">
              Book a Photoshoot
            </Link>
          </div>
        </div>
      </section>

      <InstagramPreview />
    </>
  );
}

export default Home;

