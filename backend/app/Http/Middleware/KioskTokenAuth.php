<?php

namespace App\Http\Middleware;

use App\Models\Kiosk;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KioskTokenAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Kiosk-Token') ?? $request->query('kiosk_token');

        if (!$token) {
            // Check bearer token as fallback
            $token = $request->bearerToken();
        }

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Missing X-Kiosk-Token header.',
            ], 401);
        }

        $kiosk = Kiosk::with(['showroom', 'floor'])->where('token', $token)->first();

        if (!$kiosk) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or unauthorized kiosk token.',
            ], 401);
        }

        // Attach kiosk to the request
        $request->attributes->set('kiosk', $kiosk);

        return $next($request);
    }
}

