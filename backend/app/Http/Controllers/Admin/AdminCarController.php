<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Car;
use App\Models\CarImage;
use App\Models\CarModel3d;
use App\Models\ShowroomSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminCarController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['model.brand', 'showroom', 'slot.floor', 'model3d', 'images']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('vin', 'like', "%{$search}%");
            });
        }

        if ($showroomId = $request->query('showroom_id')) {
            $query->where('showroom_id', $showroomId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $cars = $query->latest()->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $cars->items(),
            'meta' => [
                'current_page' => $cars->currentPage(),
                'last_page' => $cars->lastPage(),
                'total' => $cars->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'model_id' => 'required|exists:car_models,id',
            'showroom_id' => 'required|exists:showrooms,id',
            'slot_id' => 'nullable|exists:showroom_slots,id',
            'title' => 'required|string|max:200',
            'year' => 'required|integer|min:1980|max:2030',
            'price' => 'required|numeric|min:0',
            'mileage' => 'nullable|integer|min:0',
            'fuel' => 'required|string|max:50',
            'transmission' => 'required|string|max:50',
            'color' => 'nullable|string|max:50',
            'vin' => 'nullable|string|max:50|unique:cars,vin',
            'condition' => 'required|string|in:New,Certified Pre-Owned,Used',
            'description' => 'nullable|string',
            'status' => 'required|string|in:available,reserved,sold',
            'is_featured' => 'boolean',
            'images' => 'nullable|array',
            'features' => 'nullable|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Check slot exclusivity
            if (!empty($validated['slot_id'])) {
                $existingCar = Car::where('slot_id', $validated['slot_id'])->first();
                if ($existingCar) {
                    return response()->json([
                        'success' => false,
                        'message' => "Slot is already occupied by {$existingCar->title}.",
                    ], 422);
                }
            }

            $slug = Str::slug($validated['title']) . '-' . Str::random(5);
            $car = Car::create(array_merge($validated, [
                'slug' => $slug,
                'location_updated_at' => !empty($validated['slot_id']) ? now() : null,
            ]));

            if (!empty($validated['features'])) {
                $car->features()->sync($validated['features']);
            }

            if (!empty($validated['images'])) {
                foreach ($validated['images'] as $idx => $img) {
                    CarImage::create([
                        'car_id' => $car->id,
                        'url' => is_array($img) ? ($img['url'] ?? '') : $img,
                        'type' => is_array($img) ? ($img['type'] ?? 'gallery') : 'gallery',
                        'sort_order' => $idx,
                    ]);
                }
            }

            ActivityLog::log('car_created', "Created car listing '{$car->title}'", ['car_id' => $car->id]);

            return response()->json([
                'success' => true,
                'message' => 'Car listing created successfully.',
                'data' => $car->load(['model.brand', 'showroom', 'slot', 'images', 'model3d']),
            ], 201);
        });
    }

    public function show($id)
    {
        $car = Car::with(['model.brand', 'showroom.floors.slots', 'slot.floor', 'images', 'model3d', 'features'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $car]);
    }

    public function update(Request $request, $id)
    {
        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'model_id' => 'sometimes|exists:car_models,id',
            'showroom_id' => 'sometimes|exists:showrooms,id',
            'slot_id' => 'nullable|exists:showroom_slots,id',
            'title' => 'sometimes|string|max:200',
            'year' => 'sometimes|integer',
            'price' => 'sometimes|numeric|min:0',
            'mileage' => 'sometimes|integer|min:0',
            'fuel' => 'sometimes|string|max:50',
            'transmission' => 'sometimes|string|max:50',
            'color' => 'nullable|string|max:50',
            'vin' => 'nullable|string|max:50|unique:cars,vin,' . $car->id,
            'condition' => 'sometimes|string',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:available,reserved,sold',
            'is_featured' => 'boolean',
            'features' => 'nullable|array',
        ]);

        // Slot constraint check
        if (isset($validated['slot_id']) && $validated['slot_id'] !== $car->slot_id) {
            if ($validated['slot_id']) {
                $occupied = Car::where('slot_id', $validated['slot_id'])->where('id', '!=', $car->id)->first();
                if ($occupied) {
                    return response()->json([
                        'success' => false,
                        'message' => "Slot is already occupied by '{$occupied->title}'.",
                    ], 422);
                }
            }
            $car->location_updated_at = now();
        }

        $car->update($validated);

        if ($request->has('features')) {
            $car->features()->sync($request->features);
        }

        ActivityLog::log('car_updated', "Updated car '{$car->title}'", ['car_id' => $car->id]);

        return response()->json([
            'success' => true,
            'message' => 'Car updated successfully.',
            'data' => $car->load(['model.brand', 'showroom', 'slot', 'images', 'model3d']),
        ]);
    }

    public function destroy($id)
    {
        $car = Car::findOrFail($id);
        $title = $car->title;
        $car->delete();

        ActivityLog::log('car_deleted', "Deleted car '{$title}'", ['car_id' => $id]);

        return response()->json([
            'success' => true,
            'message' => 'Car deleted successfully.',
        ]);
    }

    public function assignSlot(Request $request, $id)
    {
        $validated = $request->validate([
            'slot_id' => 'nullable|exists:showroom_slots,id',
        ]);

        return DB::transaction(function () use ($id, $validated) {
            $car = Car::lockForUpdate()->findOrFail($id);
            $newSlotId = $validated['slot_id'];

            if ($newSlotId) {
                $occupied = Car::lockForUpdate()->where('slot_id', $newSlotId)->where('id', '!=', $car->id)->first();
                if ($occupied) {
                    return response()->json([
                        'success' => false,
                        'message' => "Slot is already occupied by '{$occupied->title}'.",
                    ], 422);
                }
            }

            $oldSlot = $car->slot ? $car->slot->label : 'None';
            $car->slot_id = $newSlotId;
            $car->location_updated_at = now();
            $car->save();

            $newSlotLabel = $car->slot ? $car->slot->label : 'Unassigned';

            ActivityLog::log(
                'car_slot_assigned',
                "Moved car '{$car->title}' from [{$oldSlot}] to [{$newSlotLabel}]",
                ['car_id' => $car->id, 'slot_id' => $newSlotId]
            );

            return response()->json([
                'success' => true,
                'message' => "Car successfully stationed at {$newSlotLabel}.",
                'data' => $car->load(['slot.floor', 'showroom']),
            ]);
        });
    }

    public function saveModel3d(Request $request, $id)
    {
        $car = Car::findOrFail($id);

        $validated = $request->validate([
            'glb_url' => 'required|string',
            'variants' => 'nullable|array',
            'interior_camera' => 'nullable|array',
        ]);

        $model3d = CarModel3d::updateOrCreate(
            ['car_id' => $car->id],
            [
                'glb_url' => $validated['glb_url'],
                'variants' => $validated['variants'] ?? null,
                'interior_camera' => $validated['interior_camera'] ?? null,
            ]
        );

        ActivityLog::log('car_3d_updated', "Updated 3D model config for '{$car->title}'", ['car_id' => $car->id]);

        return response()->json([
            'success' => true,
            'message' => '3D model configuration saved.',
            'data' => $model3d,
        ]);
    }
}

