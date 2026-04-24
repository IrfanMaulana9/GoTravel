<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'travel_id',
        'agent_id',
        'travel_date',
        'quantity',
        'total_price',
        'status',
        'passenger_name',
        'passenger_phone',
        'passenger_address',
        'pickup_location',
        'notes',
        'payment_method',
        'payment_status',
        'paid_at',
        'booking_code',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'total_price' => 'decimal:2',
        'quantity' => 'integer',
        'paid_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function travel()
    {
        return $this->belongsTo(Travel::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}

