<?php

return [
    'driver' => env('ASSESSMENT_DRIVER', 'deterministic'),
    'fallback_driver' => env('ASSESSMENT_FALLBACK_DRIVER', 'deterministic'),
    'openai' => [
        'key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-6.1-sol'),
        'timeout' => (int) env('OPENAI_TIMEOUT', 45),
    ],
];
