<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['model.brand', 'showroom', 'slot.floor', 'images', 'model3d', 'features'])
            ->where('status', '!=', 'archived');

        // Search text
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('vin', 'like', "%{$search}%")
                  ->orWhereHas('model', function ($mq) use ($search) {
                      $mq->where('name', 'like', "%{$search}%")
                         ->orWhereHas('brand', function ($bq) use ($search) {
                             $bq->where('name', 'like', "%{$search}%");
                         });
                  });
            });
        }

        // Brand filter
        if ($brand = $request->query('brand')) {
            $query->whereHas('model.brand', function ($q) use ($brand) {
                $q->where('slug', $brand)->orWhere('name', $brand);
            });
        }

        // Body type filter
        if ($bodyType = $request->query('body_type')) {
            $query->whereHas('model', function ($q) use ($bodyType) {
                $q->where('body_type', $bodyType);
            });
        }

        // Fuel filter
        if ($fuel = $request->query('fuel')) {
            $query->where('fuel', $fuel);
        }

        // Transmission filter
        if ($transmission = $request->query('transmission')) {
            $query->where('transmission', 'like', "%{$transmission}%");
        }

        // Condition filter
        if ($condition = $request->query('condition')) {
            $query->where('condition', $condition);
        }

        // Status filter (default to all or available/reserved)
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Showroom filter
        if ($showroomId = $request->query('showroom_id')) {
            $query->where('showroom_id', $showroomId);
        }

        // Price range
        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', (float) $minPrice);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Year range
        if ($minYear = $request->query('min_year')) {
            $query->where('year', '>=', (int) $minYear);
        }
        if ($maxYear = $request->query('max_year')) {
            $query->where('year', '<=', (int) $maxYear);
        }

        // Max mileage
        if ($maxMileage = $request->query('max_mileage')) {
            $query->where('mileage', '<=', (int) $maxMileage);
        }

        // Featured only
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'year_desc' => $query->orderBy('year', 'desc'),
            'mileage_asc' => $query->orderBy('mileage', 'asc'),
            default => $query->latest(),
        };

        $perPage = min((int) $request->query('per_page', 12), 50);
        $cars = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $cars->items(),
            'meta' => [
                'current_page' => $cars->currentPage(),
                'last_page' => $cars->lastPage(),
                'per_page' => $cars->perPage(),
                'total' => $cars->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $car = Car::with([
            'model.brand',
            'showroom.floors.slots',
            'slot.floor',
            'images',
            'model3d',
            'features',
        ])
        ->where('slug', $slug)
        ->orWhere('id', is_numeric($slug) ? (int) $slug : 0)
        ->firstOrFail();

        // Similar cars
        $similar = Car::with(['model.brand', 'images'])
            ->where('id', '!=', $car->id)
            ->where(function ($q) use ($car) {
                $q->where('model_id', $car->model_id)
                  ->orWhere('showroom_id', $car->showroom_id)
                  ->orWhereBetween('price', [$car->price * 0.7, $car->price * 1.3]);
            })
            ->where('status', 'available')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $car,
            'similar' => $similar,
        ]);
    }

    public function filters()
    {
        $brands = Brand::withCount('cars')->get();
        $bodyTypes = Car::join('car_models', 'cars.model_id', '=', 'car_models.id')
            ->distinct()
            ->pluck('car_models.body_type');
        $fuelTypes = Car::distinct()->pluck('fuel');
        $priceMin = Car::min('price') ?? 0;
        $priceMax = Car::max('price') ?? 500000;
        $yearMin = Car::min('year') ?? 2020;
        $yearMax = Car::max('year') ?? 2026;

        return response()->json([
            'success' => true,
            'data' => [
                'brands' => $brands,
                'body_types' => $bodyTypes,
                'fuel_types' => $fuelTypes,
                'price_range' => ['min' => $priceMin, 'max' => $priceMax],
                'year_range' => ['min' => $yearMin, 'max' => $yearMax],
            ],
        ]);
    }
}

