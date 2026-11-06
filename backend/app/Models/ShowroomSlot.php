<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShowroomSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'floor_id',
        'label',
        'pos_x',
        'pos_y',
        'pos_z',
        'rotation_y',
        'type',
    ];

    public function floor()
    {
        return $this->belongsTo(ShowroomFloor::class, 'floor_id');
    }

    public function car()
    {
        return $this->hasOne(Car::class, 'slot_id');
    }
}

