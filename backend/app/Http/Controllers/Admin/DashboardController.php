<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Car;
use App\Models\Enquiry;
use App\Models\Kiosk;
use App\Models\KioskLead;
use App\Models\KioskSession;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\Showroom;
use App\Models\TestDrive;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $showroomId = $user && $user->showroom_id && !$user->isSuperAdmin() ? $user->showroom_id : null;

        $carQuery = Car::query();
        if ($showroomId) {
            $carQuery->where('showroom_id', $showroomId);
        }

        $totalCars = (clone $carQuery)->count();
        $availableCars = (clone $carQuery)->where('status', 'available')->count();
        $reservedCars = (clone $carQuery)->where('status', 'reserved')->count();
        $soldCars = (clone $carQuery)->where('status', 'sold')->count();
        $totalInventoryValue = (clone $carQuery)->sum('price');
        $averagePrice = $totalCars > 0 ? (clone $carQuery)->avg('price') : 0;

        $enquiriesCount = Enquiry::count();
        $testDrivesCount = TestDrive::count();
        $reservationsCount = Reservation::count();
        $totalSalesRevenue = Sale::sum('sold_price');

        $kioskQuery = Kiosk::query();
        if ($showroomId) {
            $kioskQuery->where('showroom_id', $showroomId);
        }
        $totalKiosks = (clone $kioskQuery)->count();
        $onlineKiosks = (clone $kioskQuery)->where('status', 'online')->count();
        $kioskLeadsCount = KioskLead::count();
        $kioskSessionsCount = KioskSession::count();

        // Monthly revenue & sales data for charts
        $monthlySales = [
            ['month' => 'Jan', 'revenue' => 450000, 'units' => 3],
            ['month' => 'Feb', 'revenue' => 620000, 'units' => 4],
            ['month' => 'Mar', 'revenue' => 890000, 'units' => 6],
            ['month' => 'Apr', 'revenue' => 540000, 'units' => 3],
            ['month' => 'May', 'revenue' => 980000, 'units' => 7],
            ['month' => 'Jun', 'revenue' => 1250000, 'units' => 8],
            ['month' => 'Jul', 'revenue' => 1100000, 'units' => 7],
            ['month' => 'Aug', 'revenue' => 1420000, 'units' => 9],
            ['month' => 'Sep', 'revenue' => 950000, 'units' => 6],
            ['month' => 'Oct', 'revenue' => 1350000, 'units' => 8],
            ['month' => 'Nov', 'revenue' => 1620000, 'units' => 10],
        ];

        // Top brands distribution
        $brandDistribution = [
            ['name' => 'Porsche', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'porsche'))->count()],
            ['name' => 'BMW', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'bmw'))->count()],
            ['name' => 'Mercedes-Benz', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'mercedes-benz'))->count()],
            ['name' => 'Audi', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'audi'))->count()],
            ['name' => 'Tesla', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'tesla'))->count()],
            ['name' => 'Ferrari', 'count' => Car::whereHas('model.brand', fn($q) => $q->where('slug', 'ferrari'))->count()],
        ];

        $recentActivities = ActivityLog::with('user')->latest('id')->limit(8)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_cars' => $totalCars,
                    'available_cars' => $availableCars,
                    'reserved_cars' => $reservedCars,
                    'sold_cars' => $soldCars,
                    'inventory_value' => $totalInventoryValue,
                    'average_price' => round($averagePrice, 2),
                    'total_enquiries' => $enquiriesCount,
                    'total_test_drives' => $testDrivesCount,
                    'total_reservations' => $reservationsCount,
                    'total_sales_revenue' => $totalSalesRevenue,
                    'total_kiosks' => $totalKiosks,
                    'online_kiosks' => $onlineKiosks,
                    'kiosk_leads' => $kioskLeadsCount,
                    'kiosk_sessions' => $kioskSessionsCount,
                ],
                'charts' => [
                    'monthly_sales' => $monthlySales,
                    'brand_distribution' => $brandDistribution,
                ],
                'recent_activities' => $recentActivities,
            ],
        ]);
    }
}

