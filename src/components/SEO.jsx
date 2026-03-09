import { Helmet } from "react-helmet-async";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.adphotography.in").replace(/\/$/, "");

function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function SEO({ title, description, path = "", image = "/logo.jpg", type = "website" }) {
  const fullTitle = `${title} | AD Photography`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <link rel="canonical" href={url} />
    </Helmet>
  );
}

export default SEO;
