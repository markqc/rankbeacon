<?php

namespace App\Models;

use Database\Factories\AnalyticsDailyStatFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsDailyStat extends Model
{
    /** @use HasFactory<AnalyticsDailyStatFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'date',
        'metric',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'integer',
        ];
    }
}
