<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'actor_name',
        'actor_email',
        'event',
        'description',
        'module',
        'subject_type',
        'subject_id',
        'method',
        'url',
        'ip_address',
        'user_agent',
        'metadata',
        'request_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
