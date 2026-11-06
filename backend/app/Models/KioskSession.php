<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KioskSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'kiosk_id',
        'started_at',
        'ended_at',
        'cars_viewed',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'cars_viewed' => 'array',
    ];

    public function kiosk()
    {
        return $this->belongsTo(Kiosk::class);
    }
}

