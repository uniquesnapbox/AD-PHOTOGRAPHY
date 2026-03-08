<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Client extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'folder_id',
        'drive_folder_id',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(ClientApiToken::class);
    }

    public function resolvedDriveFolderId(): ?string
    {
        return $this->drive_folder_id ?: $this->folder_id;
    }
}
