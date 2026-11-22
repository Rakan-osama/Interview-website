<?php

namespace App\Domain\Curriculum;

use Illuminate\Support\Str;

final class EnglishText
{
    public function containsArabic(?string $value): bool
    {
        return $value !== null && preg_match('/\p{Arabic}/u', $value) === 1;
    }

    public function clean(?string $value): string
    {
        if (! $value) {
            return '';
        }

        $english = preg_replace('/[\p{Arabic}]+/u', ' ', $value) ?? '';
        $english = str_replace(['،', '؛', '؟', 'ـ'], [' ', ';', '?', ''], $english);
        $english = preg_replace('/\s+([,.;:!?])/u', '$1', $english) ?? $english;
        $english = preg_replace('/\s+/u', ' ', $english) ?? $english;

        return trim($english, " \t\n\r\0\x0B,;:-");
    }

    public function title(?string $value, string $fallbackKey): string
    {
        $title = $this->clean($value);

        return mb_strlen($title) >= 3 ? $title : Str::headline($fallbackKey);
    }

    public function usable(?string $value, int $minimum = 35): ?string
    {
        if ($this->containsArabic($value)) {
            return null;
        }

        $clean = $this->clean($value);

        return mb_strlen($clean) >= $minimum ? $clean : null;
    }

    public function sentences(string $value): array
    {
        return array_values(array_filter(array_map(
            fn (string $sentence): string => trim($sentence),
            preg_split('/(?<=[.!?])\s+/u', $this->clean($value)) ?: [],
        ), fn (string $sentence): bool => mb_strlen($sentence) > 12));
    }
}
