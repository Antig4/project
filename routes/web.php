<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// API Routes
Route::prefix('api')->group(function () {
    // Authentication Routes
    Route::post('/login', [AuthController::class, 'login']);
    
    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        
        // Students
        Route::apiResource('students', StudentController::class);
        
        // Faculty
        Route::apiResource('faculty', FacultyController::class);
        
        // Courses
        Route::apiResource('courses', CourseController::class);
        
        // Reports
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/export', [ReportController::class, 'export']);
        
        // Settings
        Route::get('/settings', [SettingsController::class, 'index']);
    // User profile update
    Route::post('/user/update', [AuthController::class, 'update']);
        Route::get('/archive', [SettingsController::class, 'archive']);
    Route::put('/archive/restore/{type}/{id}', [SettingsController::class, 'restore']);
    // Accept POST as well for restore (some clients may still send POST)
    Route::post('/archive/restore/{type}/{id}', [SettingsController::class, 'restore']);
        Route::delete('/archive/delete/{type}/{id}', [SettingsController::class, 'deletePermanent']);
        Route::post('/departments', [SettingsController::class, 'storeDepartment']);
        Route::put('/departments/{id}', [SettingsController::class, 'updateDepartment']);
        Route::delete('/departments/{id}', [SettingsController::class, 'destroyDepartment']);
        Route::post('/academic-years', [SettingsController::class, 'storeAcademicYear']);
        Route::put('/academic-years/{id}', [SettingsController::class, 'updateAcademicYear']);
        Route::delete('/academic-years/{id}', [SettingsController::class, 'destroyAcademicYear']);
    });
});

// React App Route (must be last)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

// Browser error reporting endpoint (used during debugging)
Route::post('/__client-error', function (\Illuminate\Http\Request $request) {
    $data = $request->all();
    \Log::error('[client] ' . ($data['message'] ?? 'unknown') . " -- " . ($data['stack'] ?? 'no-stack'));
    return response()->json(['status' => 'ok']);
});
