import { company, instagramPhotos } from "../data/siteData";

function InstagramPreview() {
  return (
    <section className="section-gap bg-white">
      <div className="container-wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">Instagram</p>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Latest Visual Stories</h2>
          </div>
          <a
            href={company.instagram}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-accent-400 hover:text-ink"
          >
            Visit Instagram
          </a>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {instagramPhotos.map((photo) => (
            <a
              key={photo.id}
              href={company.instagram}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-lg"
            >
              <img
                src={photo.image}
                alt={photo.title}
                loading="lazy"
                decoding="async"
                className="h-36 w-full object-cover transition duration-500 hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstagramPreview;
