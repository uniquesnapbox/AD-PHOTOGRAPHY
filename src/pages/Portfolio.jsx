import { useMemo, useState } from "react";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import GalleryGrid from "../components/GalleryGrid";
import Lightbox from "../components/Lightbox";
import { galleryCategories, galleryPhotos } from "../data/siteData";

function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(null);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "All") return galleryPhotos;
    return galleryPhotos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <SEO
        title="Portfolio / Gallery"
        path="/portfolio"
        description="Browse AD Photography portfolio categories including wedding, couple, portrait and fashion, event, baby, boudoir, product, and cinematography."
      />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Portfolio / Gallery"
            title="Photo Gallery"
            description="Click any photo to open a full-size lightbox preview."
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

export default Portfolio;
