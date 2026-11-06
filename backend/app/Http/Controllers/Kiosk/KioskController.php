<?php

namespace App\Http\Controllers\Kiosk;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Car;
use App\Models\Kiosk;
use App\Models\KioskLead;
use App\Models\KioskSession;
use Illuminate\Http\Request;

class KioskController extends Controller
{
    private function getKiosk(Request $request): Kiosk
    {
        /** @var Kiosk $kiosk */
        $kiosk = $request->attributes->get('kiosk');
        if (!$kiosk) {
            $token = $request->header('X-Kiosk-Token') ?? $request->query('kiosk_token');
            $kiosk = Kiosk::with(['showroom', 'floor'])->where('token', $token)->firstOrFail();
        }
        return $kiosk;
    }

    public function config(Request $request)
    {
        $kiosk = $this->getKiosk($request)->load(['showroom.floors', 'floor']);

        // Update heartbeat passively
        $kiosk->update([
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $kiosk->id,
                'name' => $kiosk->name,
                'token' => $kiosk->token,
                'showroom' => $kiosk->showroom,
                'floor' => $kiosk->floor,
                'kiosk_position' => [
                    'x' => $kiosk->pos_x,
                    'y' => $kiosk->pos_y,
                    'z' => $kiosk->pos_z,
                ],
                'attract_video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-42861-large.mp4',
                'idle_timeout_seconds' => 60,
            ],
        ]);
    }

    public function cars(Request $request)
    {
        $kiosk = $this->getKiosk($request);

        $query = Car::with(['model.brand', 'slot.floor', 'images', 'model3d', 'features'])
            ->where('showroom_id', $kiosk->showroom_id)
            ->where('status', 'available');

        if ($brand = $request->query('brand')) {
            $query->whereHas('model.brand', function ($q) use ($brand) {
                $q->where('slug', $brand)->orWhere('name', $brand);
            });
        }

        if ($bodyType = $request->query('body_type')) {
            $query->whereHas('model', function ($q) use ($bodyType) {
                $q->where('body_type', $bodyType);
            });
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float) $maxPrice);
        }

        $cars = $query->orderBy('is_featured', 'desc')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $cars,
        ]);
    }

    public function carDetail(Request $request, $id)
    {
        $kiosk = $this->getKiosk($request);

        $car = Car::with(['model.brand', 'slot.floor', 'images', 'model3d', 'features'])
            ->where('showroom_id', $kiosk->showroom_id)
            ->findOrFail($id);

        // Precompute route path from kiosk to car slot if assigned
        $routePath = [];
        if ($car->slot) {
            $routePath = [
                ['x' => $kiosk->pos_x, 'y' => $kiosk->pos_y, 'z' => $kiosk->pos_z],
                ['x' => ($kiosk->pos_x + $car->slot->pos_x) / 2, 'y' => 0.05, 'z' => ($kiosk->pos_z + $car->slot->pos_z) / 2],
                ['x' => $car->slot->pos_x, 'y' => $car->slot->pos_y, 'z' => $car->slot->pos_z],
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $car,
            'navigation' => [
                'kiosk_position' => ['x' => $kiosk->pos_x, 'y' => $kiosk->pos_y, 'z' => $kiosk->pos_z],
                'slot_coordinates' => $car->slot ? [
                    'label' => $car->slot->label,
                    'x' => $car->slot->pos_x,
                    'y' => $car->slot->pos_y,
                    'z' => $car->slot->pos_z,
                    'rotation_y' => $car->slot->rotation_y,
                ] : null,
                'waypoints' => $routePath,
            ],
        ]);
    }

    public function floor(Request $request)
    {
        $kiosk = $this->getKiosk($request);
        $floor = $kiosk->floor ?? $kiosk->showroom->floors()->first();

        if (!$floor) {
            return response()->json(['success' => false, 'message' => 'No floor configured.'], 404);
        }

        $floor->load(['slots.car.model.brand']);

        return response()->json([
            'success' => true,
            'data' => [
                'floor' => $floor,
                'kiosk_position' => [
                    'x' => $kiosk->pos_x,
                    'y' => $kiosk->pos_y,
                    'z' => $kiosk->pos_z,
                ],
                'slots' => $floor->slots,
            ],
        ]);
    }

    public function storeLead(Request $request)
    {
        $kiosk = $this->getKiosk($request);

        $validated = $request->validate([
            'car_id' => 'nullable|exists:cars,id',
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'action' => 'required|in:test_drive,call_staff',
        ]);

        $lead = KioskLead::create([
            'kiosk_id' => $kiosk->id,
            'car_id' => $validated['car_id'] ?? null,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'action' => $validated['action'],
        ]);

        ActivityLog::log('kiosk_lead_created', "Lead from kiosk '{$kiosk->name}': {$validated['name']} ({$validated['action']})", [
            'kiosk_id' => $kiosk->id,
            'lead_id' => $lead->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['action'] === 'call_staff'
                ? 'Staff notified! A showroom specialist is walking to your kiosk now.'
                : 'Test drive request submitted! Our concierge will attend you immediately.',
            'data' => $lead,
        ], 201);
    }

    public function storeSession(Request $request)
    {
        $kiosk = $this->getKiosk($request);

        $validated = $request->validate([
            'started_at' => 'required|date',
            'ended_at' => 'nullable|date',
            'cars_viewed' => 'nullable|array',
        ]);

        $session = KioskSession::create([
            'kiosk_id' => $kiosk->id,
            'started_at' => $validated['started_at'],
            'ended_at' => $validated['ended_at'] ?? now(),
            'cars_viewed' => $validated['cars_viewed'] ?? [],
        ]);

        return response()->json([
            'success' => true,
            'data' => $session,
        ], 201);
    }

    public function heartbeat(Request $request)
    {
        $kiosk = $this->getKiosk($request);
        $kiosk->update([
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Heartbeat acknowledged.',
            'last_seen_at' => $kiosk->last_seen_at,
        ]);
    }
}

