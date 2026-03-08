import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import PricingCard from "../components/PricingCard";
import { packages } from "../data/siteData";

function Pricing() {
  return (
    <>
      <SEO
        title="Pricing / Packages"
        path="/pricing"
        description="Simple photography packages for wedding, event, and studio shoots by AD Photography."
      />
      <section className="section-gap">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Pricing / Packages"
            title="Simple Packages"
            description="Transparent package options with customization available based on your event and timeline."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <PricingCard key={item.name} {...item} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Pricing;
