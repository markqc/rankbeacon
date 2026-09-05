<?php

namespace App\Support\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;

trait ProcessesUploadedImages
{
    private function storeUploadedImage(UploadedFile $file, string $directory, int $maxSize): string
    {
        if ($file->getMimeType() === 'image/svg+xml') {
            return $file->store($directory, 'public');
        }

        $image = Image::decodePath($file->getRealPath())->scaleDown($maxSize, $maxSize);
        $encoded = $image->encodeUsingFormat(Format::PNG);

        $path = $directory.'/'.Str::uuid().'.png';
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }

    private function deleteStoredImage(?string $url, array $allowedPrefixes): void
    {
        if (blank($url)) {
            return;
        }

        $path = ltrim(str_replace('/storage/', '', (string) parse_url($url, PHP_URL_PATH)), '/');

        if ($path !== '' && Str::startsWith($path, $allowedPrefixes)) {
            Storage::disk('public')->delete($path);
        }
    }
}
