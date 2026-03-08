import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function PricingCard({ name, price, description, features }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
    >
      <h3 className="text-xl font-semibold text-ink">{name}</h3>
      <p className="mt-2 text-3xl font-bold text-brand-500">{price}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-brand-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/contact" className="btn-primary mt-6 px-4 py-2.5">
        Book This Package
      </Link>
    </motion.article>
  );
}

export default PricingCard;
