import { useMemo, useState } from "react";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import GalleryGrid from "../components/GalleryGrid";
import Lightbox from "../components/Lightbox";
import { galleryCategories, galleryPhotos, services } from "../data/siteData";

function Work() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(null);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "All") return galleryPhotos;
    return galleryPhotos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <SEO
        title="Work"
        path="/work"
        description="AD Photography services and portfolio in one place with category filters and gallery preview."
      />

      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Work"
            title="Services"
            description="Explore all photography services offered by AD Photography."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => (
              <ServiceCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-gap">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Work"
            title="Portfolio"
            description="Browse category-wise gallery and click any image to preview in full size."
          />

          <div className="mt-8 flex flex-wrap gap-3">
            {galleryCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-brand-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-accent-100 hover:text-ink"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <GalleryGrid photos={filteredPhotos} onPhotoClick={setActiveIndex} />
          </div>
        </div>
      </section>

      <Lightbox
        photos={filteredPhotos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
      />
    </>
  );
}

export default Work;
