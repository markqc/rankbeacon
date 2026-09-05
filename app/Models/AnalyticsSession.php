<?php

namespace App\Models;

use Database\Factories\AnalyticsSessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSession extends Model
{
    /** @use HasFactory<AnalyticsSessionFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'fingerprint',
        'session_token',
        'device_type',
        'user_agent',
        'first_seen_at',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'first_seen_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class);
    }
}
