<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Showroom;
use App\Models\ShowroomFloor;
use App\Models\ShowroomSlot;
use Illuminate\Http\Request;

class AdminShowroomController extends Controller
{
    public function index()
    {
        $showrooms = Showroom::with(['floors.slots.car.model.brand'])
            ->withCount(['cars', 'kiosks'])
            ->get();

        return response()->json(['success' => true, 'data' => $showrooms]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:50|unique:showrooms,code',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'phone' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:150',
            'image' => 'nullable|string',
        ]);

        $showroom = Showroom::create($validated);

        // Auto create level 1 floor
        ShowroomFloor::create([
            'showroom_id' => $showroom->id,
            'name' => 'Main Showcase Floor',
            'level' => 1,
            'scale' => 1.0,
        ]);

        ActivityLog::log('showroom_created', "Created showroom '{$showroom->name}'");

        return response()->json([
            'success' => true,
            'message' => 'Showroom created.',
            'data' => $showroom->load('floors.slots'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $showroom = Showroom::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:150',
            'code' => 'sometimes|string|max:50|unique:showrooms,code,' . $showroom->id,
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'phone' => 'nullable|string',
            'opening_hours' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $showroom->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Showroom updated.',
            'data' => $showroom,
        ]);
    }

    public function floors($id)
    {
        $floors = ShowroomFloor::with(['slots.car.model.brand'])
            ->where('showroom_id', $id)
            ->orderBy('level')
            ->get();

        return response()->json(['success' => true, 'data' => $floors]);
    }

    public function storeFloor(Request $request, $id)
    {
        $showroom = Showroom::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'level' => 'required|integer',
            'model_url' => 'nullable|string',
            'scale' => 'nullable|numeric',
        ]);

        $floor = $showroom->floors()->create($validated);

        return response()->json(['success' => true, 'data' => $floor], 201);
    }

    public function storeSlot(Request $request)
    {
        $validated = $request->validate([
            'floor_id' => 'required|exists:showroom_floors,id',
            'label' => 'required|string|max:50',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'pos_z' => 'required|numeric',
            'rotation_y' => 'nullable|numeric',
            'type' => 'required|string|in:indoor,outdoor,service',
        ]);

        $slot = ShowroomSlot::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Slot created.',
            'data' => $slot,
        ], 201);
    }

    public function updateSlot(Request $request, $id)
    {
        $slot = ShowroomSlot::findOrFail($id);
        $validated = $request->validate([
            'label' => 'sometimes|string|max:50',
            'pos_x' => 'sometimes|numeric',
            'pos_y' => 'sometimes|numeric',
            'pos_z' => 'sometimes|numeric',
            'rotation_y' => 'sometimes|numeric',
            'type' => 'sometimes|string',
        ]);

        $slot->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Slot position updated.',
            'data' => $slot->load('car'),
        ]);
    }

    public function destroySlot($id)
    {
        $slot = ShowroomSlot::findOrFail($id);
        $slot->delete();

        return response()->json(['success' => true, 'message' => 'Slot removed.']);
    }
}

