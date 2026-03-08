import { motion } from "framer-motion";

function ServiceCard({ title, description }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Service</p>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </motion.article>
  );
}

export default ServiceCard;
