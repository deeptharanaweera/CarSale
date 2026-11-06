<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Showroom;
use Illuminate\Http\Request;

class ShowroomController extends Controller
{
    public function index()
    {
        $showrooms = Showroom::with([
            'floors.slots.car',
            'kiosks',
        ])
        ->withCount([
            'cars',
            'cars as available_cars_count' => function ($q) {
                $q->where('status', 'available');
            },
        ])
        ->get();

        return response()->json([
            'success' => true,
            'data' => $showrooms,
        ]);
    }

    public function show($id)
    {
        $showroom = Showroom::with([
            'floors.slots.car.model.brand',
            'cars' => function ($q) {
                $q->with(['model.brand', 'images', 'slot']);
            },
            'kiosks',
        ])
        ->withCount('cars')
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $showroom,
        ]);
    }
}

