import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { company, heroSlides } from "../data/siteData";

function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const active = heroSlides[index];

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={active.image}
          src={active.image}
          alt={active.title}
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

      <div className="container-wrap relative flex min-h-[85vh] items-center py-20 text-white">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-200"
          >
            Professional Photography Studio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
          >
            {active.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 max-w-2xl text-base text-slate-100 sm:text-lg"
          >
            {active.subtitle} {company.name} delivers wedding, portrait, studio, and event photography with premium edits and fast delivery.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link to="/contact" className="btn-primary">
              Book a Photoshoot
            </Link>
            <Link to="/work" className="btn-outline">
              View Portfolio
            </Link>
          </motion.div>

          <div className="mt-8 flex gap-2">
            {heroSlides.map((slide, slideIndex) => (
              <button
                key={slide.image}
                type="button"
                className={`h-2.5 rounded-full transition-all ${
                  slideIndex === index ? "w-9 bg-accent-400" : "w-2.5 bg-white/60"
                }`}
                onClick={() => setIndex(slideIndex)}
                aria-label={`Show slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

