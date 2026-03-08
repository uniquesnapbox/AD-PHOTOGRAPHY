import { motion } from "framer-motion";

function GalleryGrid({ photos, onPhotoClick }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          role={onPhotoClick ? "button" : undefined}
          tabIndex={onPhotoClick ? 0 : undefined}
          onClick={onPhotoClick ? () => onPhotoClick(index) : undefined}
          onKeyDown={
            onPhotoClick
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") onPhotoClick(index);
                }
              : undefined
          }
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
          className={`group mb-4 block w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-soft ${
            onPhotoClick ? "cursor-pointer" : ""
          }`}
        >
          <div className="relative">
            <img
              src={photo.image}
              alt={photo.title}
              loading="lazy"
              decoding="async"
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/35" />
          </div>
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-500">{photo.category}</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{photo.title}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default GalleryGrid;
