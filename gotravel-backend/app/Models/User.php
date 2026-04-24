<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'business_name',
        'business_license',
        'business_address',
        'business_logo',
        'verification_status',
        'rejection_reason',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is agent
     */
    public function isAgent()
    {
        return $this->role === 'agent';
    }

    /**
     * Check if user is regular user
     */
    public function isUser()
    {
        return $this->role === 'user';
    }

    /**
     * Check if agent is verified
     */
    public function isVerifiedAgent()
    {
        return $this->isAgent() && $this->verification_status === 'verified';
    }

    /**
     * Relationships
     */
    public function travels()
    {
        return $this->hasMany(Travel::class, 'agent_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function agentBookings()
    {
        return $this->hasMany(Booking::class, 'agent_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function agentReviews()
    {
        return $this->hasMany(Review::class, 'agent_id');
    }
}
