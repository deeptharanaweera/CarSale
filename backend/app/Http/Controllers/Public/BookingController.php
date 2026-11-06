<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Car;
use App\Models\Enquiry;
use App\Models\Reservation;
use App\Models\TestDrive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function storeEnquiry(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:100',
            'message' => 'nullable|string|max:1000',
        ]);

        $enquiry = Enquiry::create(array_merge($validated, [
            'user_id' => auth('sanctum')->id(),
            'status' => 'new',
        ]));

        ActivityLog::log('enquiry_created', "New enquiry for car #{$validated['car_id']}", [
            'enquiry_id' => $enquiry->id,
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your enquiry has been received. Our concierge team will reach out shortly.',
            'data' => $enquiry,
        ], 201);
    }

    public function storeTestDrive(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:100',
            'date_time' => 'required|date|after:now',
        ]);

        $testDrive = TestDrive::create(array_merge($validated, [
            'user_id' => auth('sanctum')->id(),
            'status' => 'pending',
        ]));

        ActivityLog::log('test_drive_booked', "Test drive booked for car #{$validated['car_id']}", [
            'test_drive_id' => $testDrive->id,
            'date_time' => $validated['date_time'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Test drive booked successfully! We look forward to welcoming you.',
            'data' => $testDrive,
        ], 201);
    }

    public function storeReservation(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:100',
            'amount' => 'nullable|numeric|min:100',
        ]);

        return DB::transaction(function () use ($validated) {
            $car = Car::lockForUpdate()->findOrFail($validated['car_id']);

            if ($car->status === 'sold') {
                return response()->json([
                    'success' => false,
                    'message' => 'This vehicle has already been sold.',
                ], 422);
            }

            $reservation = Reservation::create([
                'car_id' => $car->id,
                'user_id' => auth('sanctum')->id(),
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'amount' => $validated['amount'] ?? 500.00,
                'status' => 'paid',
            ]);

            // Transition car status to reserved
            $car->status = 'reserved';
            $car->save();

            ActivityLog::log('car_reserved', "Car #{$car->id} reserved by {$validated['name']}", [
                'reservation_id' => $reservation->id,
                'amount' => $reservation->amount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle successfully reserved! Reservation deposit secured.',
                'data' => $reservation,
            ], 201);
        });
    }

    public function getFavorites(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $favorites = $user->favorites()->with(['model.brand', 'images', 'showroom'])->get();

        return response()->json([
            'success' => true,
            'data' => $favorites,
        ]);
    }

    public function toggleFavorite(Request $request)
    {
        $request->validate(['car_id' => 'required|exists:cars,id']);
        $user = $request->user();
        $carId = (int) $request->car_id;

        $attached = $user->favorites()->toggle($carId);
        $isFavorited = count($attached['attached']) > 0;

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
            'message' => $isFavorited ? 'Added to favorites.' : 'Removed from favorites.',
        ]);
    }
}

