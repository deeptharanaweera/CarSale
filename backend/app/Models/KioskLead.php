<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KioskLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'kiosk_id',
        'car_id',
        'name',
        'phone',
        'action',
    ];

    public function kiosk()
    {
        return $this->belongsTo(Kiosk::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}

