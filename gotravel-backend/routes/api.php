<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TravelController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AgentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ==================== AUTH ROUTES ====================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register-agent', [AuthController::class, 'registerAgent']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:api');
});

// ==================== TRAVEL ROUTES ====================
Route::prefix('travels')->group(function () {
    Route::get('/', [TravelController::class, 'index']);           // GET /api/travels - Public
    Route::get('/cities', [TravelController::class, 'getCities']); // GET /api/travels/cities - Public
    Route::get('/{id}', [TravelController::class, 'show']);        // GET /api/travels/{id} - Public

    // Protected routes (requires authentication and agent role)
    Route::middleware(['auth:api', 'role:agent'])->group(function () {
        Route::post('/', [TravelController::class, 'store']);          // POST /api/travels - Agent only
        Route::put('/{id}', [TravelController::class, 'update']);      // PUT /api/travels/{id} - Agent only
        Route::patch('/{id}', [TravelController::class, 'update']);    // PATCH /api/travels/{id} - Agent only
        Route::delete('/{id}', [TravelController::class, 'destroy']);  // DELETE /api/travels/{id} - Agent only
    });
});

// ==================== BOOKING ROUTES ====================
Route::prefix('bookings')->middleware('auth:api')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store'])->middleware('role:user');
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::patch('/{id}/status', [BookingController::class, 'updateStatus'])->middleware('role:agent,admin');
    Route::delete('/{id}', [BookingController::class, 'destroy']);
});

// ==================== REVIEW ROUTES ====================
Route::prefix('reviews')->group(function () {
    Route::get('/', [ReviewController::class, 'index']); // Public
    Route::post('/', [ReviewController::class, 'store'])->middleware(['auth:api', 'role:user']);
});

// ==================== AGENT ROUTES ====================
Route::prefix('agent')->middleware(['auth:api', 'role:agent'])->group(function () {
    Route::get('/stats', [AgentController::class, 'getStats']);
    Route::get('/travels', [AgentController::class, 'getTravels']);
    Route::get('/bookings', [AgentController::class, 'getBookings']);
});

// ==================== ADMIN ROUTES ====================
Route::prefix('admin')->middleware(['auth:api', 'role:admin'])->group(function () {
    Route::get('/stats', [AdminController::class, 'getStats']);
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::get('/agents', [AdminController::class, 'getAllAgents']);
    Route::get('/bookings', [AdminController::class, 'getAllBookings']);
    Route::get('/travels', [AdminController::class, 'getAllTravels']);
    Route::patch('/agents/{id}/status', [AdminController::class, 'updateAgentStatus']);
    Route::patch('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
});

// Route untuk frontend Gotravel (compatibility)
Route::prefix('v1')->group(function () {
    Route::get('/travels/search', [TravelController::class, 'index']); // Compatible with frontend - Public
});
