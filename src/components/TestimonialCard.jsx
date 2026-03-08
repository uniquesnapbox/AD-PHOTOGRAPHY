import { motion } from "framer-motion";

function TestimonialCard({ name, role, quote }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <p className="text-slate-600">"{quote}"</p>
      <p className="mt-4 font-semibold text-ink">{name}</p>
      <p className="text-sm text-brand-500">{role}</p>
    </motion.article>
  );
}

export default TestimonialCard;
