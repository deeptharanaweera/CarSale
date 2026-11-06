<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'customer',
        'sold_price',
        'sold_at',
    ];

    protected $casts = [
        'sold_price' => 'float',
        'sold_at' => 'datetime',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}

