<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ClientGalleryController;
use Illuminate\Support\Facades\Route;

Route::post('/client/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/bookings', [BookingController::class, 'store']);

Route::middleware('client.auth')->group(function () {
    Route::get('/client/me', [AuthController::class, 'me']);
    Route::post('/client/logout', [AuthController::class, 'logout']);
    Route::get('/client/photos', [ClientGalleryController::class, 'index']);
    Route::get('/client/bookings', [BookingController::class, 'clientIndex']);
    Route::post('/client/bookings/{booking}/pay', [BookingController::class, 'pay']);
    Route::get('/client/bookings/{booking}/invoice', [BookingController::class, 'downloadInvoice']);
});

Route::middleware('admin.auth')->group(function () {
    Route::post('/admin/logout', [AdminAuthController::class, 'logout']);
    Route::get('/admin/bookings', [BookingController::class, 'adminIndex']);
    Route::patch('/admin/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
});
