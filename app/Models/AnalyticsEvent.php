<?php

namespace App\Models;

use Database\Factories\AnalyticsEventFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    /** @use HasFactory<AnalyticsEventFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'analytics_session_id',
        'event_type',
        'page_path',
        'tool_name',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class);
    }
}
