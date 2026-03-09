<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = BlogPost::query()
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (BlogPost $post) => $this->transformPost($post, false))
            ->values();

        return response()->json(['posts' => $posts]);
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::query()
            ->where('status', 'published')
            ->where('slug', $slug)
            ->first();

        if (!$post) {
            return response()->json(['message' => 'Blog post not found.'], 404);
        }

        $related = BlogPost::query()
            ->where('status', 'published')
            ->where('id', '!=', $post->id)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn (BlogPost $item) => $this->transformPost($item, false))
            ->values();

        return response()->json([
            'post' => $this->transformPost($post, true),
            'related_posts' => $related,
        ]);
    }

    private function transformPost(BlogPost $post, bool $withContent): array
    {
        $featuredImageUrl = $post->featured_image
            ? (str_starts_with($post->featured_image, 'http')
                ? $post->featured_image
                : asset('storage/' . ltrim($post->featured_image, '/')))
            : null;

        $excerpt = $post->excerpt;
        if (!$excerpt && $withContent) {
            $excerpt = str(strip_tags($post->content))->limit(180)->value();
        }

        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $excerpt,
            'content' => $withContent ? $post->content : null,
            'featured_image' => $post->featured_image,
            'featured_image_url' => $featuredImageUrl,
            'seo_title' => $post->seo_title,
            'seo_description' => $post->seo_description,
            'status' => $post->status,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
        ];
    }
}
