<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Booking;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings
     */
    public function index(Request $request)
    {
        $query = Booking::with(['travel', 'user', 'agent']);

        // Filter by user role
        if (auth()->user()->isUser()) {
            $query->where('user_id', auth()->id());
        } elseif (auth()->user()->isAgent()) {
            $query->where('agent_id', auth()->id());
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Store a newly created booking
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'travel_id' => 'required|exists:travels,id',
            'travel_date' => 'required|date|after_or_equal:today',
            'quantity' => 'required|integer|min:1',
            'passenger_name' => 'required|string|max:255',
            'passenger_phone' => 'required|string|max:20',
            'passenger_address' => 'nullable|string',
            'pickup_location' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $travel = Travel::findOrFail($request->travel_id);

        // Check if travel is active
        if (!$travel->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan travel tidak tersedia'
            ], 400);
        }

        // Check available seats
        if ($travel->available_seats < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Kursi tidak mencukupi. Kursi tersedia: ' . $travel->available_seats
            ], 400);
        }

        $totalPrice = $travel->price * $request->quantity;

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'travel_id' => $travel->id,
            'agent_id' => $travel->agent_id,
            'travel_date' => $request->travel_date,
            'quantity' => $request->quantity,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'passenger_name' => $request->passenger_name,
            'passenger_phone' => $request->passenger_phone,
            'passenger_address' => $request->passenger_address,
            'pickup_location' => $request->pickup_location,
            'notes' => $request->notes,
            'payment_status' => 'pending',
        ]);

        // Update available seats
        $travel->decrement('available_seats', $request->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Pemesanan berhasil dibuat',
            'data' => $booking->load(['travel', 'agent'])
        ], 201);
    }

    /**
     * Display the specified booking
     */
    public function show($id)
    {
        $booking = Booking::with(['travel', 'user', 'agent', 'review'])->findOrFail($id);

        // Check authorization
        if (auth()->user()->isUser() && $booking->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (auth()->user()->isAgent() && $booking->agent_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Update booking status
     */
    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        // Only agent or admin can update status
        if (!auth()->user()->isAgent() && !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if (auth()->user()->isAgent() && $booking->agent_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $booking->status;
        $booking->update(['status' => $request->status]);

        // If cancelled, return seats
        if ($oldStatus !== 'cancelled' && $request->status === 'cancelled') {
            $booking->travel->increment('available_seats', $booking->quantity);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pemesanan berhasil diperbarui',
            'data' => $booking
        ]);
    }

    /**
     * Cancel booking
     */
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        // Only user who made booking or admin can cancel
        if (auth()->user()->isUser() && $booking->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($booking->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat membatalkan pemesanan yang sudah selesai'
            ], 400);
        }

        // Return seats
        if ($booking->status !== 'cancelled') {
            $booking->travel->increment('available_seats', $booking->quantity);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Pemesanan berhasil dibatalkan'
        ]);
    }
}

