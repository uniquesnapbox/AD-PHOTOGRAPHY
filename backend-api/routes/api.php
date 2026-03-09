<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminBlogController;
use App\Http\Controllers\Api\AdminClientController;
use App\Http\Controllers\Api\AdminPaymentSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ClientGalleryController;
use App\Http\Controllers\Api\PaymentSettingController;
use App\Http\Controllers\Api\PhotoSelectionController;
use Illuminate\Support\Facades\Route;

Route::post('/client/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/bookings', [BookingController::class, 'store']);

Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);

Route::middleware('client.auth')->group(function () {
    Route::get('/client/me', [AuthController::class, 'me']);
    Route::post('/client/logout', [AuthController::class, 'logout']);

    Route::get('/client/photos', [ClientGalleryController::class, 'index']);
    Route::post('/client/photos/{photo}/select', [PhotoSelectionController::class, 'select']);
    Route::get('/client/selections', [PhotoSelectionController::class, 'clientIndex']);

    Route::get('/client/bookings', [BookingController::class, 'clientIndex']);
    Route::post('/client/bookings/{booking}/pay', [BookingController::class, 'pay']);
    Route::get('/client/bookings/{booking}/invoice', [BookingController::class, 'downloadInvoice']);

    Route::get('/client/payment-settings', [PaymentSettingController::class, 'show']);
});

Route::middleware('admin.auth')->group(function () {
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);

    Route::get('/admin/bookings', [BookingController::class, 'adminIndex']);
    Route::patch('/admin/bookings/{booking}/status', [BookingController::class, 'updateStatus']);

    Route::get('/admin/clients', [AdminClientController::class, 'index']);
    Route::patch('/admin/clients/{client}', [AdminClientController::class, 'update']);

    Route::get('/admin/selections/{client}', [PhotoSelectionController::class, 'adminIndex']);

    Route::get('/admin/blog', [AdminBlogController::class, 'index']);
    Route::post('/admin/blog', [AdminBlogController::class, 'store']);
    Route::put('/admin/blog/{id}', [AdminBlogController::class, 'update']);
    Route::delete('/admin/blog/{id}', [AdminBlogController::class, 'destroy']);

    Route::get('/admin/payment-settings', [AdminPaymentSettingController::class, 'show']);
    Route::put('/admin/payment-settings', [AdminPaymentSettingController::class, 'update']);
});
