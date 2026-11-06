<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Showroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'lat',
        'lng',
        'phone',
        'opening_hours',
        'image',
    ];

    public function floors()
    {
        return $this->hasMany(ShowroomFloor::class);
    }

    public function slots()
    {
        return $this->hasManyThrough(ShowroomSlot::class, ShowroomFloor::class, 'showroom_id', 'floor_id');
    }

    public function cars()
    {
        return $this->hasMany(Car::class);
    }

    public function kiosks()
    {
        return $this->hasMany(Kiosk::class);
    }

    public function staff()
    {
        return $this->hasMany(User::class);
    }
}

