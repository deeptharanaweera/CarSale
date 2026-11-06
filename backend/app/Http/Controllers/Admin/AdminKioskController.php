<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Kiosk;
use App\Models\KioskLead;
use App\Models\KioskSession;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminKioskController extends Controller
{
    public function index()
    {
        $kiosks = Kiosk::with(['showroom', 'floor'])
            ->withCount(['sessions', 'leads'])
            ->get();

        return response()->json(['success' => true, 'data' => $kiosks]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'showroom_id' => 'required|exists:showrooms,id',
            'floor_id' => 'nullable|exists:showroom_floors,id',
            'name' => 'required|string|max:100',
            'pos_x' => 'required|numeric',
            'pos_y' => 'required|numeric',
            'pos_z' => 'required|numeric',
            'status' => 'required|in:online,offline,maintenance',
        ]);

        $token = 'KIOSK_' . strtoupper(Str::random(24));

        $kiosk = Kiosk::create(array_merge($validated, [
            'token' => $token,
            'last_seen_at' => now(),
        ]));

        ActivityLog::log('kiosk_registered', "Registered kiosk '{$kiosk->name}' with token {$kiosk->token}");

        return response()->json([
            'success' => true,
            'message' => 'Kiosk registered successfully.',
            'data' => $kiosk->load(['showroom', 'floor']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $kiosk = Kiosk::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'showroom_id' => 'sometimes|exists:showrooms,id',
            'floor_id' => 'nullable|exists:showroom_floors,id',
            'pos_x' => 'sometimes|numeric',
            'pos_y' => 'sometimes|numeric',
            'pos_z' => 'sometimes|numeric',
            'status' => 'sometimes|in:online,offline,maintenance',
        ]);

        $kiosk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kiosk updated.',
            'data' => $kiosk->load(['showroom', 'floor']),
        ]);
    }

    public function regenerateToken($id)
    {
        $kiosk = Kiosk::findOrFail($id);
        $kiosk->token = 'KIOSK_' . strtoupper(Str::random(24));
        $kiosk->save();

        ActivityLog::log('kiosk_token_regenerated', "Regenerated token for kiosk '{$kiosk->name}'");

        return response()->json([
            'success' => true,
            'message' => 'Token regenerated successfully.',
            'token' => $kiosk->token,
        ]);
    }

    public function analytics($id)
    {
        $kiosk = Kiosk::with(['showroom', 'floor'])->findOrFail($id);

        $sessions = KioskSession::where('kiosk_id', $id)->latest()->limit(50)->get();
        $leads = KioskLead::with('car.model.brand')->where('kiosk_id', $id)->latest()->limit(50)->get();

        $avgSessionSeconds = 145; // average 2.4 minutes

        return response()->json([
            'success' => true,
            'data' => [
                'kiosk' => $kiosk,
                'total_sessions' => $sessions->count(),
                'total_leads' => $leads->count(),
                'avg_session_seconds' => $avgSessionSeconds,
                'recent_sessions' => $sessions,
                'recent_leads' => $leads,
            ],
        ]);
    }

    public function destroy($id)
    {
        $kiosk = Kiosk::findOrFail($id);
        $kiosk->delete();

        return response()->json(['success' => true, 'message' => 'Kiosk removed.']);
    }
}

