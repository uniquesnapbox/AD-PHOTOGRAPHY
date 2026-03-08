import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Lightbox({ photos, activeIndex, onClose }) {
  const isOpen = activeIndex !== null;
  const photo = isOpen ? photos[activeIndex] : null;

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && photo && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="relative max-h-[95vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/80"
            >
              Close
            </button>
            <img
              src={photo.image}
              alt={photo.title}
              className="max-h-[85vh] rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-sm text-slate-200">
              {photo.title} • {photo.category}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Lightbox;
