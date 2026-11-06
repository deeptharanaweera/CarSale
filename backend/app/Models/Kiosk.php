<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kiosk extends Model
{
    use HasFactory;

    protected $fillable = [
        'showroom_id',
        'floor_id',
        'name',
        'token',
        'pos_x',
        'pos_y',
        'pos_z',
        'status',
        'last_seen_at',
    ];

    protected $casts = [
        'pos_x' => 'float',
        'pos_y' => 'float',
        'pos_z' => 'float',
        'last_seen_at' => 'datetime',
    ];

    public function showroom()
    {
        return $this->belongsTo(Showroom::class);
    }

    public function floor()
    {
        return $this->belongsTo(ShowroomFloor::class, 'floor_id');
    }

    public function sessions()
    {
        return $this->hasMany(KioskSession::class);
    }

    public function leads()
    {
        return $this->hasMany(KioskLead::class);
    }
}

