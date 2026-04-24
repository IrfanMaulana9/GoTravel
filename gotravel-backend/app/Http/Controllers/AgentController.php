<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Travel;
use App\Models\Booking;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * Get agent dashboard statistics
     */
    public function getStats()
    {
        $agent = auth()->user();

        $stats = [
            'total_travels' => Travel::where('agent_id', $agent->id)->count(),
            'active_travels' => Travel::where('agent_id', $agent->id)
                ->where('is_active', true)
                ->count(),
            'total_bookings' => Booking::where('agent_id', $agent->id)->count(),
            'pending_bookings' => Booking::where('agent_id', $agent->id)
                ->where('status', 'pending')
                ->count(),
            'confirmed_bookings' => Booking::where('agent_id', $agent->id)
                ->where('status', 'confirmed')
                ->count(),
            'completed_bookings' => Booking::where('agent_id', $agent->id)
                ->where('status', 'completed')
                ->count(),
            'total_revenue' => Booking::where('agent_id', $agent->id)
                ->where('payment_status', 'paid')
                ->sum('total_price'),
            'verification_status' => $agent->verification_status,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get agent's travels
     */
    public function getTravels(Request $request)
    {
        $query = Travel::where('agent_id', auth()->id());

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('from_city', 'like', "%{$search}%")
                  ->orWhere('to_city', 'like', "%{$search}%");
            });
        }

        $travels = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $travels
        ]);
    }

    /**
     * Get agent's bookings
     */
    public function getBookings(Request $request)
    {
        $query = Booking::with(['user', 'travel'])
            ->where('agent_id', auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
}

