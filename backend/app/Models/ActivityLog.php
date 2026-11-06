<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'subject',
        'meta',
        'created_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log($action, $subject = null, array $meta = [], $userId = null)
    {
        return static::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'subject' => $subject,
            'meta' => $meta,
            'created_at' => now(),
        ]);
    }
}

