# AD Photography Backend (Laravel + MySQL)

Laravel API backend for:
- Client login
- Token-based auth
- Client-specific Google Drive gallery fetch

## Tech
- Laravel
- MySQL
- Google Drive API (server-side fetch)

## API Endpoints

- `POST /api/client/login`
  - body: `{ "email": "...", "password": "..." }`
- `GET /api/client/me` (Bearer token)
- `POST /api/client/logout` (Bearer token)
- `GET /api/client/photos` (Bearer token)

## Setup

1. Install dependencies:
   ```bash
   php artisan --version
   ```
   (Project already contains vendor after scaffold.)

2. Configure `.env`:
   - `DB_CONNECTION=mysql`
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`
   - `DB_DATABASE=ad_photography`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=`
   - `GOOGLE_DRIVE_API_KEY=your_key`

3. Generate app key:
   ```bash
   php artisan key:generate
   ```

4. Run migrations and seed demo clients:
   ```bash
   php artisan migrate --seed
   ```

5. Start API server:
   ```bash
   php artisan serve
   ```

Default API base URL:
- `http://127.0.0.1:8000`

## Demo Client Credentials

- `rahul@adphotography.in / rahul123`
- `anita@adphotography.in / anita123`
- `rohit@adphotography.in / rohit123`

Update records from `database/seeders/DatabaseSeeder.php` and re-seed.
