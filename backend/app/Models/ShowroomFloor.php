<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShowroomFloor extends Model
{
    use HasFactory;

    protected $fillable = [
        'showroom_id',
        'name',
        'level',
        'model_url',
        'navmesh_url',
        'scale',
    ];

    public function showroom()
    {
        return $this->belongsTo(Showroom::class);
    }

    public function slots()
    {
        return $this->hasMany(ShowroomSlot::class, 'floor_id');
    }

    public function kiosks()
    {
        return $this->hasMany(Kiosk::class, 'floor_id');
    }
}

