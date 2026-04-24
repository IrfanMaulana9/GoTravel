<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Travel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'travels';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'agent_id',
        'agent_name',
        'from_city',
        'to_city',
        'depart_time',
        'arrival_time',
        'duration',
        'price',
        'seats',
        'available_seats',
        'type',
        'rating',
        'reviews_count',
        'facilities',
        'image',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'float',
        'price' => 'integer',
        'seats' => 'integer',
        'available_seats' => 'integer',
        'reviews_count' => 'integer',
        'is_active' => 'boolean',
        'depart_time' => 'datetime:H:i',
        'arrival_time' => 'datetime:H:i',
    ];

    /**
     * Get facilities as array
     */
    public function getFacilitiesArrayAttribute()
    {
        if (empty($this->facilities)) {
            return [];
        }

        // Check if it's JSON
        if (strpos($this->facilities, '[') === 0) {
            return json_decode($this->facilities, true) ?? [];
        }

        // Comma separated
        return array_map('trim', explode(',', $this->facilities));
    }

    /**
     * Scope for searching
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function($q) use ($search) {
                $q->where('agent_name', 'like', "%{$search}%")
                  ->orWhere('from_city', 'like', "%{$search}%")
                  ->orWhere('to_city', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Scope for filtering by type
     */
    public function scopeFilterByType($query, $type)
    {
        if ($type) {
            return $query->where('type', $type);
        }
        return $query;
    }

    /**
     * Scope for filtering by route
     */
    public function scopeFilterByRoute($query, $fromCity, $toCity)
    {
        if ($fromCity) {
            $query->where('from_city', 'like', "%{$fromCity}%");
        }
        if ($toCity) {
            $query->where('to_city', 'like', "%{$toCity}%");
        }
        return $query;
    }

    /**
     * Scope for price range
     */
    public function scopePriceRange($query, $minPrice, $maxPrice)
    {
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        return $query;
    }

    /**
     * Relationships
     */
    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Update rating based on reviews
     */
    public function updateRating()
    {
        $avgRating = $this->reviews()->avg('rating') ?? 0;
        $reviewsCount = $this->reviews()->count();

        $this->update([
            'rating' => round($avgRating, 1),
            'reviews_count' => $reviewsCount,
        ]);
    }
}
