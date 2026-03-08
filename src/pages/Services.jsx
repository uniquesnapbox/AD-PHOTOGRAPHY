import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import { services } from "../data/siteData";

function Services() {
  return (
    <>
      <SEO
        title="Services"
        path="/services"
        description="Photography services by AD Photography including wedding, pre-wedding, event, boudoir, cinematography, product, baby, portrait fashion, and couple photography."
      />
      <section className="section-gap">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Services"
            title="Professional Photography Services"
            description="Each service includes professional planning, quality capture, and polished delivery."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <ServiceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Services;
