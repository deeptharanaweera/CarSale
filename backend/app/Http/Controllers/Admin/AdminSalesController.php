<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Brand;
use App\Models\CarModel;
use App\Models\Enquiry;
use App\Models\Reservation;
use App\Models\TestDrive;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminSalesController extends Controller
{
    public function enquiries(Request $request)
    {
        $enquiries = Enquiry::with(['car.model.brand', 'user'])
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $enquiries->items(), 'meta' => ['total' => $enquiries->total()]]);
    }

    public function updateEnquiry(Request $request, $id)
    {
        $enquiry = Enquiry::findOrFail($id);
        $request->validate(['status' => 'required|in:new,contacted,closed']);
        $enquiry->update(['status' => $request->status]);

        return response()->json(['success' => true, 'message' => 'Enquiry status updated.']);
    }

    public function testDrives(Request $request)
    {
        $testDrives = TestDrive::with(['car.model.brand', 'user'])
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $testDrives->items(), 'meta' => ['total' => $testDrives->total()]]);
    }

    public function updateTestDrive(Request $request, $id)
    {
        $testDrive = TestDrive::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,confirmed,completed,cancelled']);
        $testDrive->update(['status' => $request->status]);

        return response()->json(['success' => true, 'message' => 'Test drive status updated.']);
    }

    public function reservations(Request $request)
    {
        $reservations = Reservation::with(['car.model.brand', 'user'])
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $reservations->items(), 'meta' => ['total' => $reservations->total()]]);
    }

    public function updateReservation(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);
        $request->validate(['status' => 'required|in:pending,paid,refunded,cancelled']);
        $reservation->update(['status' => $request->status]);

        return response()->json(['success' => true, 'message' => 'Reservation status updated.']);
    }

    public function users(Request $request)
    {
        $users = User::with('showroom')->latest()->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string',
            'role' => 'required|in:super_admin,manager,sales_staff,showroom_staff,customer',
            'showroom_id' => 'nullable|exists:showrooms,id',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create(array_merge($validated, [
            'password' => Hash::make($validated['password']),
        ]));

        return response()->json(['success' => true, 'data' => $user->load('showroom')], 201);
    }

    public function brands()
    {
        $brands = Brand::with('models')->withCount('cars')->get();
        return response()->json(['success' => true, 'data' => $brands]);
    }

    public function storeBrand(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|unique:brands,slug',
            'logo' => 'nullable|string',
        ]);

        $brand = Brand::create($validated);
        return response()->json(['success' => true, 'data' => $brand], 201);
    }

    public function storeModel(Request $request)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'name' => 'required|string|max:100',
            'body_type' => 'required|string',
        ]);

        $model = CarModel::create($validated);
        return response()->json(['success' => true, 'data' => $model], 201);
    }

    public function activityLogs()
    {
        $logs = ActivityLog::with('user')->latest('id')->limit(50)->get();
        return response()->json(['success' => true, 'data' => $logs]);
    }
}

