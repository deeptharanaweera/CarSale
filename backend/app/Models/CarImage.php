<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'url',
        'type', // gallery, 360, interior
        'sort_order',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}

