<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $baseUrl = rtrim(env('FRONTEND_APP_URL', config('app.url')), '/');
        $now = now()->toAtomString();

        $staticPaths = [
            '/',
            '/about',
            '/services',
            '/portfolio',
            '/pricing',
            '/contact',
            '/booking',
            '/blog',
        ];

        $urls = collect($staticPaths)->map(function (string $path) use ($baseUrl, $now) {
            return [
                'loc' => $baseUrl . $path,
                'lastmod' => $now,
            ];
        });

        $blogUrls = BlogPost::query()
            ->where('status', 'published')
            ->orderByDesc('updated_at')
            ->get(['slug', 'updated_at'])
            ->map(function (BlogPost $post) use ($baseUrl) {
                return [
                    'loc' => $baseUrl . '/blog/' . $post->slug,
                    'lastmod' => optional($post->updated_at)->toAtomString() ?? now()->toAtomString(),
                ];
            });

        $allUrls = $urls->concat($blogUrls)->values();

        $xml = view('sitemap', ['urls' => $allUrls])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
