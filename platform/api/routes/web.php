<?php

use Illuminate\Support\Facades\Route;

Route::get('/{path?}', function () {
    $index = public_path('spa/index.html');
    abort_unless(is_file($index), 503, 'The React application has not been built.');
    return response()->file($index, ['Cache-Control' => 'no-cache, no-store, must-revalidate']);
})->where('path', '^(?!api(?:/|$)|sanctum(?:/|$)|up$).*$');
