import { Link } from "react-router-dom";
import { company } from "../data/siteData";

function Footer() {
  return (
    <footer className="border-t-4 border-brand-500 bg-ink py-10 text-slate-300">
      <div className="container-wrap grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="logo-box h-11 w-11">
              <img src="/logo.jpg" alt={`${company.name} logo`} className="h-full w-full rounded-lg object-cover" />
            </div>
            <h3 className="text-lg font-bold text-white">{company.name}</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">{company.intro}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link to="/services" className="hover:text-accent-300">
              Services
            </Link>
            <Link to="/portfolio" className="hover:text-accent-300">
              Portfolio
            </Link>
            <Link to="/about" className="hover:text-accent-300">
              About
            </Link>
            <Link to="/pricing" className="hover:text-accent-300">
              Pricing
            </Link>
            <Link to="/blog" className="hover:text-accent-300">
              Blog
            </Link>
            <Link to="/contact" className="hover:text-accent-300">
              Contact
            </Link>
            <Link to="/login" className="hover:text-accent-300">
              Login
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
          <div className="mt-3 space-y-2 text-sm">
            <p>{company.email}</p>
            <p>{company.phone}</p>
            <p>{company.address}</p>
          </div>
        </div>
      </div>

      <div className="container-wrap mt-8 border-t border-slate-700 pt-5 text-center text-xs text-slate-500">
        Copyright © {new Date().getFullYear()} {company.name}. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
