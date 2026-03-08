<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $clients = [
            [
                'name' => 'Rahul',
                'email' => 'rahul@adphotography.in',
                'password' => Hash::make('rahul123'),
                'folder_id' => 'GOOGLE_DRIVE_FOLDER_ID_1',
            ],
            [
                'name' => 'Anita',
                'email' => 'anita@adphotography.in',
                'password' => Hash::make('anita123'),
                'folder_id' => 'GOOGLE_DRIVE_FOLDER_ID_2',
            ],
            [
                'name' => 'Rohit',
                'email' => 'rohit@adphotography.in',
                'password' => Hash::make('rohit123'),
                'folder_id' => 'GOOGLE_DRIVE_FOLDER_ID_3',
            ],
        ];

        foreach ($clients as $client) {
            Client::updateOrCreate(['email' => $client['email']], $client);
        }

        Admin::updateOrCreate(
            ['email' => 'admin@adphotography.in'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
            ]
        );
    }
}