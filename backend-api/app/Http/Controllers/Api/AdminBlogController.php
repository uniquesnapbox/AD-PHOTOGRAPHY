<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminBlogController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = BlogPost::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (BlogPost $post) => $this->transformPost($post, true))
            ->values();

        return response()->json(['posts' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published'],
            'featured_image' => ['nullable', 'image', 'max:4096'],
        ]);

        $slugBase = $data['slug'] ?? $data['title'];
        $slug = $this->generateUniqueSlug($slugBase);

        $post = new BlogPost();
        $post->title = $data['title'];
        $post->slug = $slug;
        $post->excerpt = $data['excerpt'] ?? null;
        $post->content = $data['content'];
        $post->seo_title = $data['seo_title'] ?? null;
        $post->seo_description = $data['seo_description'] ?? null;
        $post->status = $data['status'];

        if ($request->hasFile('featured_image')) {
            $post->featured_image = $request->file('featured_image')->store('blog', 'public');
        }

        $post->save();

        return response()->json([
            'message' => 'Blog post created successfully.',
            'post' => $this->transformPost($post, true),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::query()->find($id);
        if (!$post) {
            return response()->json(['message' => 'Blog post not found.'], 404);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published'],
            'featured_image' => ['nullable', 'image', 'max:4096'],
            'remove_featured_image' => ['nullable', 'boolean'],
        ]);

        $slugInput = $data['slug'] ?? $data['title'];
        $slug = $this->generateUniqueSlug($slugInput, $post->id);

        $post->title = $data['title'];
        $post->slug = $slug;
        $post->excerpt = $data['excerpt'] ?? null;
        $post->content = $data['content'];
        $post->seo_title = $data['seo_title'] ?? null;
        $post->seo_description = $data['seo_description'] ?? null;
        $post->status = $data['status'];

        if (!empty($data['remove_featured_image']) && $post->featured_image) {
            $this->deleteStoredImageIfLocal($post->featured_image);
            $post->featured_image = null;
        }

        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                $this->deleteStoredImageIfLocal($post->featured_image);
            }
            $post->featured_image = $request->file('featured_image')->store('blog', 'public');
        }

        $post->save();

        return response()->json([
            'message' => 'Blog post updated successfully.',
            'post' => $this->transformPost($post, true),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $post = BlogPost::query()->find($id);
        if (!$post) {
            return response()->json(['message' => 'Blog post not found.'], 404);
        }

        if ($post->featured_image) {
            $this->deleteStoredImageIfLocal($post->featured_image);
        }

        $post->delete();

        return response()->json(['message' => 'Blog post deleted successfully.']);
    }

    private function generateUniqueSlug(string $input, ?int $ignoreId = null): string
    {
        $base = Str::slug($input);
        if ($base === '') {
            $base = 'blog-post';
        }

        $slug = $base;
        $counter = 2;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        $query = BlogPost::query()->where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }
        return $query->exists();
    }

    private function transformPost(BlogPost $post, bool $withContent): array
    {
        $featuredImageUrl = $post->featured_image
            ? (str_starts_with($post->featured_image, 'http')
                ? $post->featured_image
                : asset('storage/' . ltrim($post->featured_image, '/')))
            : null;

        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
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

    private function deleteStoredImageIfLocal(string $path): void
    {
        if (!str_starts_with($path, 'http')) {
            Storage::disk('public')->delete($path);
        }
    }
}
