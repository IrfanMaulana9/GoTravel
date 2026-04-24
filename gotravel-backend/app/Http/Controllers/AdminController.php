<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_agents' => User::where('role', 'agent')->count(),
            'pending_agents' => User::where('role', 'agent')
                ->where('verification_status', 'pending')
                ->count(),
            'verified_agents' => User::where('role', 'agent')
                ->where('verification_status', 'verified')
                ->count(),
            'total_travels' => Travel::count(),
            'active_travels' => Travel::where('is_active', true)->count(),
            'total_bookings' => Booking::count(),
            'pending_bookings' => Booking::where('status', 'pending')->count(),
            'confirmed_bookings' => Booking::where('status', 'confirmed')->count(),
            'completed_bookings' => Booking::where('status', 'completed')->count(),
            'total_revenue' => Booking::where('payment_status', 'paid')
                ->sum('total_price'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get all users
     */
    public function getAllUsers(Request $request)
    {
        $query = User::where('role', 'user')->withCount('bookings');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get all agents
     */
    public function getAllAgents(Request $request)
    {
        $query = User::where('role', 'agent');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }

        $agents = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $agents
        ]);
    }

    /**
     * Update agent verification status
     */
    public function updateAgentStatus(Request $request, $id)
    {
        $agent = User::where('role', 'agent')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,verified,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $agent->update([
            'verification_status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status verifikasi agen berhasil diperbarui',
            'data' => $agent
        ]);
    }

    /**
     * Get all bookings
     */
    public function getAllBookings(Request $request)
    {
        $query = Booking::with(['user', 'travel' => function($query) {
            $query->withTrashed();
        }, 'agent']);

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

    /**
     * Update user status (activate/deactivate)
     */
    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // For now, we can just return success
        // You can add an 'is_active' field to users table if needed
        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diperbarui',
            'data' => $user
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menghapus admin'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus'
        ]);
    }
    /**
     * Get all travels (Admin)
     */
    public function getAllTravels(Request $request)
    {
        $query = Travel::query(); // Use query() to start building

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('origin_city', 'like', "%{$search}%")
                  ->orWhere('destination_city', 'like', "%{$search}%")
                  ->orWhere('agent_name', 'like', "%{$search}%");
            });
        }

        $travels = $query->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $travels
        ]);
    }
}

