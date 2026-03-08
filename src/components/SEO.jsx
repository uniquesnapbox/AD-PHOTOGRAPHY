import { Helmet } from "react-helmet-async";

function SEO({ title, description, path = "" }) {
  const fullTitle = `${title} | AD Photography`;
  const url = `https://www.adphotography.in${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
}

export default SEO;
