<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Store a newly created review
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'booking_id' => 'required|exists:bookings,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::findOrFail($request->booking_id);

        // Check if booking belongs to user
        if ($booking->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if booking is completed
        if ($booking->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya bisa memberikan review untuk pemesanan yang sudah selesai'
            ], 400);
        }

        // Check if review already exists
        if ($booking->review) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memberikan review untuk pemesanan ini'
            ], 400);
        }

        $review = Review::create([
            'user_id' => auth()->id(),
            'booking_id' => $booking->id,
            'travel_id' => $booking->travel_id,
            'agent_id' => $booking->agent_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Update travel rating
        $booking->travel->updateRating();

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil ditambahkan',
            'data' => $review->load(['user', 'travel', 'agent'])
        ], 201);
    }

    /**
     * Get reviews for a travel or agent
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'travel', 'agent']);

        if ($request->has('travel_id')) {
            $query->where('travel_id', $request->travel_id);
        }

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }
}

