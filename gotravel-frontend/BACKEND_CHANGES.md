# Perubahan Backend yang Diperlukan untuk GoTravel

## 1. Database Migrations

### Tambah kolom pada tabel users untuk agent registration:
```php
Schema::table('users', function (Blueprint $table) {
    $table->enum('role', ['user', 'agent', 'admin'])->default('user')->after('password');
    $table->string('phone')->nullable()->after('email');
    $table->string('agency_name')->nullable()->after('phone');
    $table->text('agency_address')->nullable()->after('agency_name');
    $table->string('business_license')->nullable()->after('agency_address');
    $table->enum('agent_status', ['pending', 'approved', 'rejected'])->nullable()->after('business_license');
});
```

### Buat tabel pickup_locations:
```php
Schema::create('pickup_locations', function (Blueprint $table) {
    $table->id();
    $table->foreignId('travel_id')->constrained()->onDelete('cascade');
    $table->string('name'); // Nama lokasi, misal: "Terminal Cicaheum"
    $table->text('address');
    $table->decimal('latitude', 10, 7);
    $table->decimal('longitude', 10, 7);
    $table->time('pickup_time')->nullable();
    $table->integer('order')->default(0); // Urutan penjemputan
    $table->timestamps();
});
```

### Buat tabel bookings:
```php
Schema::create('bookings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('travel_id')->constrained()->onDelete('cascade');
    $table->foreignId('pickup_location_id')->nullable()->constrained()->onDelete('set null');
    $table->string('booking_code')->unique();
    $table->string('customer_name');
    $table->string('customer_phone');
    $table->string('customer_email');
    $table->integer('seats');
    $table->decimal('total_price', 10, 2);
    $table->date('travel_date');
    $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

## 2. Models

### User Model - tambahkan:
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'phone',
    'role',
    'agency_name',
    'agency_address',
    'business_license',
    'agent_status',
];

protected $hidden = [
    'password',
    'remember_token',
];

protected $casts = [
    'email_verified_at' => 'datetime',
];

// Relationships
public function travels()
{
    return $this->hasMany(Travel::class, 'agent_id');
}

public function bookings()
{
    return $this->hasMany(Booking::class);
}

// Scopes
public function scopeAgents($query)
{
    return $query->where('role', 'agent');
}

public function scopeApprovedAgents($query)
{
    return $query->where('role', 'agent')->where('agent_status', 'approved');
}
```

### Travel Model - tambahkan relationship:
```php
public function pickupLocations()
{
    return $this->hasMany(PickupLocation::class)->orderBy('order');
}

public function bookings()
{
    return $this->hasMany(Booking::class);
}

public function agent()
{
    return $this->belongsTo(User::class, 'agent_id');
}
```

### Buat Model PickupLocation:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupLocation extends Model
{
    protected $fillable = [
        'travel_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'pickup_time',
        'order',
    ];

    public function travel()
    {
        return $this->belongsTo(Travel::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
```

### Buat Model Booking:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'travel_id',
        'pickup_location_id',
        'booking_code',
        'customer_name',
        'customer_phone',
        'customer_email',
        'seats',
        'total_price',
        'travel_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function travel()
    {
        return $this->belongsTo(Travel::class);
    }

    public function pickupLocation()
    {
        return $this->belongsTo(PickupLocation::class);
    }

    // Generate unique booking code
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($booking) {
            $booking->booking_code = 'GT-' . strtoupper(uniqid());
        });
    }
}
```

## 3. Controllers

### AuthController - tambahkan method registerAgent:
```php
public function registerAgent(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed',
        'phone' => 'required|string|max:20',
        'agency_name' => 'required|string|max:255',
        'agency_address' => 'required|string',
        'business_license' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
    ]);

    // Upload business license
    $licensePath = $request->file('business_license')->store('business_licenses', 'public');

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'phone' => $request->phone,
        'role' => 'agent',
        'agency_name' => $request->agency_name,
        'agency_address' => $request->agency_address,
        'business_license' => $licensePath,
        'agent_status' => 'pending',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Agent registration successful. Waiting for admin approval.',
        'data' => $user,
    ], 201);
}
```

### Buat AgentController:
```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AgentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function getStats()
    {
        $agent = auth()->user();

        $stats = [
            'total_travels' => Travel::where('agent_id', $agent->id)->count(),
            'total_bookings' => Booking::whereHas('travel', function($q) use ($agent) {
                $q->where('agent_id', $agent->id);
            })->count(),
            'total_revenue' => Booking::whereHas('travel', function($q) use ($agent) {
                $q->where('agent_id', $agent->id);
            })->where('status', 'confirmed')->sum('total_price'),
            'monthly_bookings' => Booking::whereHas('travel', function($q) use ($agent) {
                $q->where('agent_id', $agent->id);
            })->whereMonth('created_at', date('m'))->count(),
            'growth_rate' => 15, // Calculate actual growth rate
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function getTravels(Request $request)
    {
        $travels = Travel::where('agent_id', auth()->id())
            ->with('pickupLocations')
            ->latest()
            ->paginate($request->get('limit', 10));

        return response()->json([
            'success' => true,
            'data' => $travels,
        ]);
    }

    public function getBookings(Request $request)
    {
        $bookings = Booking::whereHas('travel', function($q) {
            $q->where('agent_id', auth()->id());
        })
        ->with(['travel', 'user', 'pickupLocation'])
        ->latest()
        ->paginate($request->get('limit', 10));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }
}
```

### Buat AdminController:
```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Travel;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'admin']);
    }

    public function getDashboardStats()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_agents' => User::where('role', 'agent')->count(),
            'total_travels' => Travel::count(),
            'total_bookings' => Booking::count(),
            'total_revenue' => Booking::where('status', 'confirmed')->sum('total_price'),
            'growth_rate' => 12, // Calculate actual growth
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    public function getAllUsers(Request $request)
    {
        $users = User::where('role', 'user')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function getAllAgents(Request $request)
    {
        $agents = User::where('role', 'agent')
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $agents,
        ]);
    }

    public function getAllBookings(Request $request)
    {
        $bookings = Booking::with(['user', 'travel', 'pickupLocation'])
            ->latest()
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    public function updateAgentStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $agent = User::where('role', 'agent')->findOrFail($id);
        $agent->agent_status = $request->status;
        $agent->save();

        return response()->json([
            'success' => true,
            'message' => 'Agent status updated successfully',
            'data' => $agent,
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }
}
```

### Buat BookingController:
```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Travel;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request)
    {
        $request->validate([
            'travel_id' => 'required|exists:travels,id',
            'pickup_location_id' => 'nullable|exists:pickup_locations,id',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email',
            'seats' => 'required|integer|min:1',
            'travel_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        $travel = Travel::findOrFail($request->travel_id);

        // Check seat availability
        if ($travel->available_seats < $request->seats) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available',
            ], 400);
        }

        $totalPrice = $travel->price * $request->seats;

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'travel_id' => $request->travel_id,
            'pickup_location_id' => $request->pickup_location_id,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'customer_email' => $request->customer_email,
            'seats' => $request->seats,
            'total_price' => $totalPrice,
            'travel_date' => $request->travel_date,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        // Update available seats
        $travel->decrement('available_seats', $request->seats);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'data' => $booking->load(['travel', 'pickupLocation']),
        ], 201);
    }

    public function index(Request $request)
    {
        $bookings = Booking::where('user_id', auth()->id())
            ->with(['travel', 'pickupLocation'])
            ->latest()
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    public function show($id)
    {
        $booking = Booking::with(['travel', 'pickupLocation', 'user'])
            ->findOrFail($id);

        // Check authorization
        if ($booking->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:confirmed,cancelled,completed',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated',
            'data' => $booking,
        ]);
    }

    public function cancel($id)
    {
        $booking = Booking::where('user_id', auth()->id())->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Booking already cancelled',
            ], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        // Return seats to travel
        $booking->travel->increment('available_seats', $booking->seats);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
        ]);
    }
}
```

### TravelController - tambahkan methods untuk pickup locations:
```php
public function addPickupLocation(Request $request, $travelId)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'address' => 'required|string',
        'latitude' => 'required|numeric|between:-90,90',
        'longitude' => 'required|numeric|between:-180,180',
        'pickup_time' => 'nullable|date_format:H:i',
        'order' => 'nullable|integer',
    ]);

    $travel = Travel::findOrFail($travelId);

    // Check if user is the agent owner
    if ($travel->agent_id !== auth()->id() && !auth()->user()->isAdmin()) {
        abort(403, 'Unauthorized');
    }

    $pickupLocation = $travel->pickupLocations()->create($request->all());

    return response()->json([
        'success' => true,
        'message' => 'Pickup location added successfully',
        'data' => $pickupLocation,
    ], 201);
}

public function getPickupLocations($travelId)
{
    $travel = Travel::findOrFail($travelId);
    $pickupLocations = $travel->pickupLocations()->orderBy('order')->get();

    return response()->json([
        'success' => true,
        'data' => $pickupLocations,
    ]);
}

public function deletePickupLocation($travelId, $locationId)
{
    $travel = Travel::findOrFail($travelId);

    // Check authorization
    if ($travel->agent_id !== auth()->id() && !auth()->user()->isAdmin()) {
        abort(403, 'Unauthorized');
    }

    $location = $travel->pickupLocations()->findOrFail($locationId);
    $location->delete();

    return response()->json([
        'success' => true,
        'message' => 'Pickup location deleted successfully',
    ]);
}
```

## 4. Routes (api.php)

```php
// Auth routes
Route::post('/auth/register-agent', [AuthController::class, 'registerAgent']);

// Agent routes (protected)
Route::middleware(['auth:sanctum', 'agent'])->prefix('agent')->group(function () {
    Route::get('/stats', [AgentController::class, 'getStats']);
    Route::get('/travels', [AgentController::class, 'getTravels']);
    Route::get('/bookings', [AgentController::class, 'getBookings']);
});

// Admin routes (protected)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::get('/agents', [AdminController::class, 'getAllAgents']);
    Route::get('/bookings', [AdminController::class, 'getAllBookings']);
    Route::patch('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
    Route::patch('/agents/{id}/status', [AdminController::class, 'updateAgentStatus']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
});

// Pickup location routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/travels/{id}/pickup-locations', [TravelController::class, 'addPickupLocation']);
    Route::delete('/travels/{travelId}/pickup-locations/{locationId}', [TravelController::class, 'deletePickupLocation']);
});

Route::get('/travels/{id}/pickup-locations', [TravelController::class, 'getPickupLocations']);

// Booking routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::delete('/bookings/{id}', [BookingController::class, 'cancel']);
});
```

## 5. Middleware

### Buat AgentMiddleware:
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AgentMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || auth()->user()->role !== 'agent') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Agent access only.',
            ], 403);
        }

        // Check if agent is approved
        if (auth()->user()->agent_status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Your agent account is pending approval.',
            ], 403);
        }

        return $next($request);
    }
}
```

### Buat AdminMiddleware:
```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access only.',
            ], 403);
        }

        return $next($request);
    }
}
```

### Register middleware di app/Http/Kernel.php:
```php
protected $middlewareAliases = [
    // ... existing middleware
    'agent' => \App\Http\Middleware\AgentMiddleware::class,
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

## 6. Seeder Updates

Update TravelSeeder untuk include pickup locations:
```php
// In TravelSeeder.php
Travel::create([
    // ... existing fields
])->each(function($travel) {
    // Add pickup locations for each travel
    $travel->pickupLocations()->createMany([
        [
            'name' => 'Terminal ' . $travel->origin,
            'address' => 'Terminal Utama ' . $travel->origin,
            'latitude' => -6.9175 + (rand(-100, 100) / 1000),
            'longitude' => 107.6191 + (rand(-100, 100) / 1000),
            'pickup_time' => '07:00',
            'order' => 1,
        ],
        [
            'name' => 'Stasiun ' . $travel->origin,
            'address' => 'Stasiun Kereta ' . $travel->origin,
            'latitude' => -6.9175 + (rand(-100, 100) / 1000),
            'longitude' => 107.6191 + (rand(-100, 100) / 1000),
            'pickup_time' => '07:15',
            'order' => 2,
        ],
    ]);
});
```

## Ringkasan Perubahan:

1. **Database**: 3 tabel baru (pickup_locations, bookings) + modifikasi tabel users
2. **Models**: 2 model baru (PickupLocation, Booking) + update User & Travel models
3. **Controllers**: 3 controller baru (AgentController, AdminController, BookingController) + update AuthController & TravelController
4. **Middleware**: 2 middleware baru (AgentMiddleware, AdminMiddleware)
5. **Routes**: Tambahan routes untuk agent, admin, bookings, dan pickup locations
6. **Seeder**: Update untuk include pickup locations

Semua perubahan ini sudah terintegrasi dengan frontend React.js yang baru dibuat.
