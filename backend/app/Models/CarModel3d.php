<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarModel3d extends Model
{
    use HasFactory;

    protected $table = 'car_models_3d';

    protected $fillable = [
        'car_id',
        'glb_url',
        'variants',
        'interior_camera',
    ];

    protected $casts = [
        'variants' => 'array',
        'interior_camera' => 'array',
    ];

    public function car()
    {
        return $this->belongsTo(Car::class);
    }
}

