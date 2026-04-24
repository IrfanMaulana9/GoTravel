<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controller;
use App\Models\Travel;
use Illuminate\Http\Request;
use App\Http\Requests\TravelRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TravelController extends Controller
{
    /**
     * Display a listing of the resource with pagination and filters.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Get query parameters
            $perPage = $request->integer('limit', 10);
            $page = $request->integer('page', 1);
            $search = $request->query('search');
            $type = $request->query('type');
            $fromCity = $request->query('from_city');
            $toCity = $request->query('to_city');
            $minPrice = $request->query('min_price');
            $maxPrice = $request->query('max_price');
            $sortBy = $request->query('sort_by', 'created_at');
            $orderBy = $request->query('order_by', 'desc');

            // Validate sort_by and order_by
            $validSortColumns = ['id', 'agent_name', 'price', 'rating', 'depart_time', 'created_at'];
            $validOrderDirections = ['asc', 'desc'];

            $sortBy = in_array($sortBy, $validSortColumns) ? $sortBy : 'created_at';
            $orderBy = in_array($orderBy, $validOrderDirections) ? $orderBy : 'desc';

            // Build query with scopes
            $query = Travel::query()
                ->where('is_active', true)
                ->search($search)
                ->filterByType($type)
                ->filterByRoute($fromCity, $toCity)
                ->priceRange($minPrice, $maxPrice)
                ->orderBy($sortBy, $orderBy);

            // Filter by agent if user is agent
            if (auth()->check() && auth()->user()->isAgent()) {
                // For agent dashboard, show only their travels
                if ($request->has('my_travels') && $request->boolean('my_travels')) {
                    $query->where('agent_id', auth()->id());
                }
            }

            // Get paginated results
            $travels = $query->paginate($perPage, ['*'], 'page', $page);

            // Transform data to include facilities array
            $travels->getCollection()->transform(function ($travel) {
                $travel->facilities_array = $travel->facilities_array;
                return $travel;
            });

            return response()->json([
                'success' => true,
                'message' => 'Data travel berhasil diambil',
                'data' => $travels->items(),
                'pagination' => [
                    'current_page' => $travels->currentPage(),
                    'total_pages' => $travels->lastPage(),
                    'total_items' => $travels->total(),
                    'per_page' => $travels->perPage(),
                    'has_next_page' => $travels->hasMorePages(),
                    'has_prev_page' => $travels->currentPage() > 1,
                ],
                'filters' => [
                    'search' => $search,
                    'type' => $type,
                    'from_city' => $fromCity,
                    'to_city' => $toCity,
                    'min_price' => $minPrice,
                    'max_price' => $maxPrice,
                    'sort_by' => $sortBy,
                    'order_by' => $orderBy,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param TravelRequest $request
     * @return JsonResponse
     */
    public function store(TravelRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('travels', $imageName, 'public');
                $validated['image'] = $imagePath;
            }

            // Set agent_id if user is agent
            if (auth()->check() && auth()->user()->isAgent()) {
                $validated['agent_id'] = auth()->id();
                $validated['agent_name'] = auth()->user()->business_name ?? auth()->user()->name;
            }

            // Set default values
            if (!isset($validated['available_seats'])) {
                $validated['available_seats'] = $validated['seats'] ?? 0;
            }
            if (!isset($validated['is_active'])) {
                $validated['is_active'] = true;
            }

            // Create travel
            $travel = Travel::create($validated);

            // Add facilities array to response
            $travel->facilities_array = $travel->facilities_array;

            return response()->json([
                'success' => true,
                'message' => 'Travel berhasil ditambahkan',
                'data' => $travel
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan travel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show($id): JsonResponse
    {
        try {
            $travel = Travel::find($id);

            if (!$travel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Travel tidak ditemukan'
                ], 404);
            }

            // Add facilities array to response
            $travel->facilities_array = $travel->facilities_array;

            return response()->json([
                'success' => true,
                'message' => 'Detail travel berhasil diambil',
                'data' => $travel
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil detail',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param TravelRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(TravelRequest $request, $id): JsonResponse
    {
        try {
            $travel = Travel::find($id);

            if (!$travel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Travel tidak ditemukan'
                ], 404);
            }

            // Check if agent owns this travel
            if (auth()->check() && auth()->user()->isAgent() && $travel->agent_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            Log::info('[v0] Update request received', [
                'travel_id' => $id,
                'has_file' => $request->hasFile('image'),
                'all_files' => $request->allFiles(),
                'old_image' => $travel->image
            ]);

            $validated = $request->validated();

            if ($request->hasFile('image')) {
                Log::info('[v0] Processing image upload');

                // Delete old image if exists
                if ($travel->image && Storage::disk('public')->exists($travel->image)) {
                    Storage::disk('public')->delete($travel->image);
                    Log::info('[v0] Old image deleted', ['path' => $travel->image]);
                }

                // Upload new image
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('travels', $imageName, 'public');
                $validated['image'] = $imagePath;

                Log::info('[v0] New image uploaded', [
                    'path' => $imagePath,
                    'full_url' => asset('storage/' . $imagePath)
                ]);
            }

            $travel->update($validated);

            // Refresh and add facilities array
            $travel->refresh();
            $travel->facilities_array = $travel->facilities_array;

            if ($travel->image) {
                $travel->image_url = asset('storage/' . $travel->image);
            }

            return response()->json([
                'success' => true,
                'message' => 'Travel berhasil diperbarui',
                'data' => $travel
            ], 200);

        } catch (\Exception $e) {
            Log::error('[v0] Update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui travel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy($id): JsonResponse
    {
        try {
            $travel = Travel::find($id);

            if (!$travel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Travel tidak ditemukan'
                ], 404);
            }

            // Check if agent owns this travel or user is admin
            if (auth()->check()) {
                if (auth()->user()->isAgent() && $travel->agent_id !== auth()->id()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthorized'
                    ], 403);
                }
            }

            if ($travel->image && Storage::disk('public')->exists($travel->image)) {
                Storage::disk('public')->delete($travel->image);
            }

            // Soft delete
            $travel->delete();

            return response()->json([
                'success' => true,
                'message' => 'Travel berhasil dihapus (soft delete)',
                'data' => [
                    'id' => $id,
                    'deleted_at' => now()->toDateTimeString()
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus travel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available cities for filtering
     *
     * @return JsonResponse
     */
    public function getCities(): JsonResponse
    {
        try {
            $fromCities = Travel::distinct()->pluck('from_city')->toArray();
            $toCities = Travel::distinct()->pluck('to_city')->toArray();

            $allCities = array_unique(array_merge($fromCities, $toCities));
            sort($allCities);

            return response()->json([
                'success' => true,
                'message' => 'Daftar kota berhasil diambil',
                'data' => [
                    'all_cities' => $allCities,
                    'from_cities' => $fromCities,
                    'to_cities' => $toCities
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar kota',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
