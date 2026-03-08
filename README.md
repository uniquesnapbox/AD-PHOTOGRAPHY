# AD Photography - Booking API

This repository contains the AD Photography backend booking module built with Laravel + MySQL.

## Project Structure

- `backend-api/app/Http/Controllers/Api/BookingController.php` - Booking create/list/status update API
- `backend-api/app/Models/Booking.php` - Booking model
- `backend-api/app/Http/Middleware/AuthenticateAdminKey.php` - Admin key middleware (legacy)
- `backend-api/database/migrations/2026_03_09_000003_create_bookings_table.php` - Bookings table migration

## Booking Table

`bookings`

- `id`
- `client_id` (nullable FK -> clients.id)
- `name`
- `phone`
- `email`
- `event_type`
- `event_date`
- `location`
- `message` (nullable)
- `status` (`pending`, `approved`, `rejected`)
- `advance_payment`
- `created_at`
- `updated_at`

## API Endpoints

### 1) Create Booking

- `POST /api/bookings`

Sample request body:

```json
{
  "name": "Rahul Das",
  "phone": "+91 9000000000",
  "email": "rahul@example.com",
  "event_type": "Wedding Photography",
  "event_date": "2026-04-20",
  "location": "Karimganj",
  "message": "Need full day coverage",
  "advance_payment": 5000
}
```

### 2) Admin Booking List

- `GET /api/admin/bookings`

### 3) Client Booking List

- `GET /api/client/bookings`

### 4) Update Booking Status

- `PATCH /api/admin/bookings/{id}/status`

Sample request body:

```json
{
  "status": "approved",
  "advance_payment": 10000
}
```

## Email Notifications

When booking is created:

- Email sent to admin (`ADMIN_BOOKING_EMAIL` or `MAIL_FROM_ADDRESS`)
- Confirmation email sent to client

When status is updated:

- Status update email sent to client

## Environment

Configure `.env` in Laravel project:

```env
APP_NAME="AD Photography"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ad_photography
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@adphotography.in"
MAIL_FROM_NAME="AD Photography"

ADMIN_BOOKING_EMAIL="contact@adphotography.in"
ADMIN_API_KEY="change_this_key"
```

## Run Locally

From Laravel backend folder:

```bash
cd backend-api
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

API base URL:

- `http://127.0.0.1:8000/api`

## Notes

- Keep `.env` private; do not commit credentials.
- If frontend is hosted separately, set CORS accordingly in Laravel.
