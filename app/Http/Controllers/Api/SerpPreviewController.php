<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\SeoTools\Exceptions\FetchException;
use App\Domain\SeoTools\Exceptions\UnsafeUrlException;
use App\Domain\SeoTools\Services\UrlMetadataFetcher;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SerpPreviewController extends Controller
{
    public function __construct(
        private readonly UrlMetadataFetcher $fetcher,
        private readonly AnalyticsTracker $tracker,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => ['required', 'string', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('INVALID_URL', 'A valid URL is required.', 422);
        }

        try {
            $metadata = $this->fetcher->fetch($request->input('url'));

            $this->tracker->trackToolEvent(
                $request->merge(['path' => '/tools/serp-preview']),
                'serp-preview',
                'fetch',
                ['url' => $request->input('url')],
            );

            return response()->json([
                'data' => $metadata->toArray(),
                'meta' => [
                    'version' => 'v1',
                    'fetched_at' => $metadata->fetchedAt,
                ],
            ]);
        } catch (UnsafeUrlException $e) {
            return $this->errorResponse($e->errorCode, $e->getMessage(), 400);
        } catch (FetchException $e) {
            return $this->errorResponse($e->errorCode, $e->getMessage(), 502);
        }
    }

    private function errorResponse(string $code, string $message, int $status): JsonResponse
    {
        return response()->json([
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], $status);
    }
}
