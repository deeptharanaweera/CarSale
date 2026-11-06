<?php

use App\Http\Controllers\Admin\AdminCarController;
use App\Http\Controllers\Admin\AdminKioskController;
use App\Http\Controllers\Admin\AdminSalesController;
use App\Http\Controllers\Admin\AdminShowroomController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Kiosk\KioskController;
use App\Http\Controllers\Public\AuthController;
use App\Http\Controllers\Public\BookingController;
use App\Http\Controllers\Public\CarController;
use App\Http\Controllers\Public\ShowroomController;
use App\Http\Middleware\KioskTokenAuth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Public Cars & Showrooms
    Route::get('/cars', [CarController::class, 'index']);
    Route::get('/cars/filters', [CarController::class, 'filters']);
    Route::get('/cars/{slug}', [CarController::class, 'show']);
    Route::get('/showrooms', [ShowroomController::class, 'index']);
    Route::get('/showrooms/{id}', [ShowroomController::class, 'show']);

    // Public Bookings & Leads
    Route::post('/enquiries', [BookingController::class, 'storeEnquiry']);
    Route::post('/test-drives', [BookingController::class, 'storeTestDrive']);
    Route::post('/reservations', [BookingController::class, 'storeReservation']);

    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Authenticated User routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/favorites', [BookingController::class, 'getFavorites']);
        Route::post('/favorites/toggle', [BookingController::class, 'toggleFavorite']);
    });

    /*
    |--------------------------------------------------------------------------
    | Showroom Kiosk Routes (Authenticated with Kiosk Token)
    |--------------------------------------------------------------------------
    */
    Route::prefix('kiosk')->middleware(KioskTokenAuth::class)->group(function () {
        Route::get('/config', [KioskController::class, 'config']);
        Route::get('/cars', [KioskController::class, 'cars']);
        Route::get('/cars/{id}', [KioskController::class, 'carDetail']);
        Route::get('/floor', [KioskController::class, 'floor']);
        Route::post('/leads', [KioskController::class, 'storeLead']);
        Route::post('/sessions', [KioskController::class, 'storeSession']);
        Route::post('/heartbeat', [KioskController::class, 'heartbeat']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // Inventory Management
        Route::apiResource('cars', AdminCarController::class);
        Route::post('/cars/{id}/assign-slot', [AdminCarController::class, 'assignSlot']);
        Route::post('/cars/{id}/model-3d', [AdminCarController::class, 'saveModel3d']);

        // Showroom Management
        Route::apiResource('showrooms', AdminShowroomController::class);
        Route::get('/showrooms/{id}/floors', [AdminShowroomController::class, 'floors']);
        Route::post('/showrooms/{id}/floors', [AdminShowroomController::class, 'storeFloor']);
        Route::post('/slots', [AdminShowroomController::class, 'storeSlot']);
        Route::put('/slots/{id}', [AdminShowroomController::class, 'updateSlot']);
        Route::delete('/slots/{id}', [AdminShowroomController::class, 'destroySlot']);

        // Kiosk Management
        Route::apiResource('kiosks', AdminKioskController::class);
        Route::post('/kiosks/{id}/regenerate-token', [AdminKioskController::class, 'regenerateToken']);
        Route::get('/kiosks/{id}/analytics', [AdminKioskController::class, 'analytics']);

        // Sales & Bookings
        Route::get('/enquiries', [AdminSalesController::class, 'enquiries']);
        Route::put('/enquiries/{id}', [AdminSalesController::class, 'updateEnquiry']);
        Route::get('/test-drives', [AdminSalesController::class, 'testDrives']);
        Route::put('/test-drives/{id}', [AdminSalesController::class, 'updateTestDrive']);
        Route::get('/reservations', [AdminSalesController::class, 'reservations']);
        Route::put('/reservations/{id}', [AdminSalesController::class, 'updateReservation']);

        // Users & Master Data
        Route::get('/users', [AdminSalesController::class, 'users']);
        Route::post('/users', [AdminSalesController::class, 'storeUser']);
        Route::get('/brands', [AdminSalesController::class, 'brands']);
        Route::post('/brands', [AdminSalesController::class, 'storeBrand']);
        Route::post('/models', [AdminSalesController::class, 'storeModel']);
        Route::get('/activity-logs', [AdminSalesController::class, 'activityLogs']);
    });
});

// Also provide direct /api/* bindings
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/filters', [CarController::class, 'filters']);
Route::get('/cars/{slug}', [CarController::class, 'show']);
Route::get('/showrooms', [ShowroomController::class, 'index']);
Route::get('/showrooms/{id}', [ShowroomController::class, 'show']);
Route::post('/enquiries', [BookingController::class, 'storeEnquiry']);
Route::post('/test-drives', [BookingController::class, 'storeTestDrive']);
Route::post('/reservations', [BookingController::class, 'storeReservation']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::prefix('kiosk')->middleware(KioskTokenAuth::class)->group(function () {
    Route::get('/config', [KioskController::class, 'config']);
    Route::get('/cars', [KioskController::class, 'cars']);
    Route::get('/cars/{id}', [KioskController::class, 'carDetail']);
    Route::get('/floor', [KioskController::class, 'floor']);
    Route::post('/leads', [KioskController::class, 'storeLead']);
    Route::post('/sessions', [KioskController::class, 'storeSession']);
    Route::post('/heartbeat', [KioskController::class, 'heartbeat']);
});

Route::prefix('admin')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::apiResource('cars', AdminCarController::class);
    Route::post('/cars/{id}/assign-slot', [AdminCarController::class, 'assignSlot']);
    Route::post('/cars/{id}/model-3d', [AdminCarController::class, 'saveModel3d']);
    Route::apiResource('showrooms', AdminShowroomController::class);
    Route::get('/showrooms/{id}/floors', [AdminShowroomController::class, 'floors']);
    Route::post('/showrooms/{id}/floors', [AdminShowroomController::class, 'storeFloor']);
    Route::post('/slots', [AdminShowroomController::class, 'storeSlot']);
    Route::put('/slots/{id}', [AdminShowroomController::class, 'updateSlot']);
    Route::delete('/slots/{id}', [AdminShowroomController::class, 'destroySlot']);
    Route::apiResource('kiosks', AdminKioskController::class);
    Route::post('/kiosks/{id}/regenerate-token', [AdminKioskController::class, 'regenerateToken']);
    Route::get('/kiosks/{id}/analytics', [AdminKioskController::class, 'analytics']);
    Route::get('/enquiries', [AdminSalesController::class, 'enquiries']);
    Route::put('/enquiries/{id}', [AdminSalesController::class, 'updateEnquiry']);
    Route::get('/test-drives', [AdminSalesController::class, 'testDrives']);
    Route::put('/test-drives/{id}', [AdminSalesController::class, 'updateTestDrive']);
    Route::get('/reservations', [AdminSalesController::class, 'reservations']);
    Route::put('/reservations/{id}', [AdminSalesController::class, 'updateReservation']);
    Route::get('/users', [AdminSalesController::class, 'users']);
    Route::post('/users', [AdminSalesController::class, 'storeUser']);
    Route::get('/brands', [AdminSalesController::class, 'brands']);
    Route::post('/brands', [AdminSalesController::class, 'storeBrand']);
    Route::post('/models', [AdminSalesController::class, 'storeModel']);
    Route::get('/activity-logs', [AdminSalesController::class, 'activityLogs']);
});
