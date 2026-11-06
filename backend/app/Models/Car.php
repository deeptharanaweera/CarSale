<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_id',
        'showroom_id',
        'slot_id',
        'title',
        'slug',
        'year',
        'price',
        'mileage',
        'fuel',
        'transmission',
        'color',
        'vin',
        'condition',
        'description',
        'status',
        'is_featured',
        'location_updated_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'price' => 'float',
        'mileage' => 'integer',
        'is_featured' => 'boolean',
        'location_updated_at' => 'datetime',
    ];

    public function model()
    {
        return $this->belongsTo(CarModel::class, 'model_id');
    }

    public function showroom()
    {
        return $this->belongsTo(Showroom::class);
    }

    public function slot()
    {
        return $this->belongsTo(ShowroomSlot::class, 'slot_id');
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class, 'car_feature');
    }

    public function images()
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order');
    }

    public function model3d()
    {
        return $this->hasOne(CarModel3d::class);
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

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }
}

