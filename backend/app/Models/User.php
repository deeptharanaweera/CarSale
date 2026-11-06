<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'showroom_id',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function showroom()
    {
        return $this->belongsTo(Showroom::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(Car::class, 'favorites')->withTimestamps();
    }

    public function enquiries()
    {
        return $this->hasMany(Enquiry::class);
    }

    public function testDrives()
    {
        return $this->hasMany(TestDrive::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isStaff(): bool
    {
        return in_array($this->role, ['super_admin', 'manager', 'sales_staff', 'showroom_staff']);
    }
}
