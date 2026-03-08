# AD Photography - Portfolio Website

Modern photography portfolio and booking website built with React, Vite, Tailwind CSS, React Router, and Framer Motion.
Includes Laravel + MySQL backend API in `backend-api/` for client login and private gallery delivery.

## Features

- Fullscreen hero image slideshow
- Portfolio gallery with category filters
- Lightbox preview on image click
- Services page
- About Photographer page
- Pricing / Packages page
- Contact / Booking page
- Client login and private client portal
- Instagram preview section
- Google Reviews section (Google Business Profile)
- WhatsApp floating booking button
- Google Map embed
- SEO meta tags and responsive layout

## Pages

- Home
- Portfolio / Gallery
- Services
- About Photographer
- Pricing / Packages
- Contact / Booking

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- EmailJS (for booking form email sending)

## Folder Structure

```text
.
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- vite.config.js
|-- .env.example
|-- public
|   `-- logo.jpg
`-- src
    |-- App.jsx
    |-- main.jsx
    |-- index.css
    |-- components
    |   |-- ContactForm.jsx
    |   |-- Footer.jsx
    |   |-- GalleryGrid.jsx
    |   |-- ProtectedRoute.jsx
    |   |-- Hero.jsx
    |   |-- InstagramPreview.jsx
    |   |-- GoogleReviews.jsx
    |   |-- Lightbox.jsx
    |   |-- Navbar.jsx
    |   |-- PricingCard.jsx
    |   |-- SEO.jsx
    |   |-- SectionHeading.jsx
    |   |-- ServiceCard.jsx
    |   |-- TestimonialCard.jsx
    |   `-- WhatsAppButton.jsx
    |-- data
    |   `-- siteData.js
    |-- context
    |   `-- AuthContext.jsx
    |-- layouts
    |   `-- MainLayout.jsx
    `-- pages
        |-- About.jsx
        |-- Contact.jsx
        |-- ClientPortal.jsx
        |-- Home.jsx
        |-- NotFound.jsx
        |-- Portfolio.jsx
        |-- Pricing.jsx
        `-- Services.jsx
```

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open:
   ```text
   http://localhost:5173
   ```

## Backend (Laravel + MySQL)

1. Configure backend env:
   - `backend-api/.env` (DB + `GOOGLE_DRIVE_API_KEY`)
2. Run backend:
   ```bash
   cd backend-api
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
3. Set frontend API URL in root `.env`:
   - `VITE_API_BASE_URL=http://127.0.0.1:8000`

## Production Build

```bash
npm run build
npm run preview
```

## Email Booking Setup (EmailJS)

1. Copy `.env.example` to `.env`
2. Add values:
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
3. Restart dev server

## Google Reviews Setup (Google Places)

1. Add to `.env`:
   - `VITE_GOOGLE_API_KEY`
   - `VITE_GOOGLE_PLACE_ID`
2. Enable Places API for your Google Cloud project and restrict API key by domain.
3. Restart dev server.

## Client Gallery Setup (Google Drive)

1. Set backend API base URL in `.env`:
   - `VITE_API_BASE_URL`
2. Start Laravel backend API (inside `backend-api`).
3. Client login route:
   - `/login`
4. Client portal route (protected):
   - `/client-portal`

## Deploy

Deploy the generated `dist/` folder (`npm run build`) to:
- Netlify
- Vercel
- Any static hosting with SPA fallback to `index.html`
