<?php

return [
    'activity_log_retention_days' => (int) env('ADMIN_ACTIVITY_LOG_RETENTION_DAYS', 365),

    'analytics_retention_days' => (int) env('ANALYTICS_RETENTION_DAYS', 90),

    'redacted_keys' => [
        'password',
        'password_confirmation',
        'current_password',
        'remember_token',
        'csrf',
        '_token',
        'cookie',
        'authorization',
        'api_key',
        'apikey',
        'secret',
        'smtp_password',
        'smtp2go_api_key',
    ],
];
