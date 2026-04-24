<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete all users first (except keep structure)
        User::query()->delete();

        // Create Admin
        User::create([
            'name' => 'Admin MayTravel',
            'email' => 'admin@maytravel.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'phone' => '081234567890',
        ]);

        // Create Sample Agents
        $agents = [
            [
                'name' => 'Ahmad Wijaya',
                'email' => 'jaya.travel@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '081111111111',
                'business_name' => 'Jaya Travel',
                'business_license' => 'SIUP-001-JKT-2024',
                'business_address' => 'Jl. Sudirman No. 1, Jakarta',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'mitra.jaya@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '082222222222',
                'business_name' => 'Mitra Jaya',
                'business_license' => 'SIUP-002-JKT-2024',
                'business_address' => 'Jl. Thamrin No. 10, Jakarta',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'ekspres.utama@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '083333333333',
                'business_name' => 'Ekspres Utama',
                'business_license' => 'SIUP-003-SBY-2024',
                'business_address' => 'Jl. Diponegoro No. 20, Surabaya',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Rina Wati',
                'email' => 'nyaman.travel@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '084444444444',
                'business_name' => 'Nyaman Travel',
                'business_license' => 'SIUP-004-YGY-2024',
                'business_address' => 'Jl. Malioboro No. 5, Yogyakarta',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Andi Pratama',
                'email' => 'aman.jaya@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '085555555555',
                'business_name' => 'Aman Jaya',
                'business_license' => 'SIUP-005-MDN-2024',
                'business_address' => 'Jl. Gatot Subroto No. 15, Medan',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Dewi Sartika',
                'email' => 'cepat.jaya@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '086666666666',
                'business_name' => 'Cepat Jaya',
                'business_license' => 'SIUP-006-BDG-2024',
                'business_address' => 'Jl. Asia Afrika No. 25, Bandung',
                'verification_status' => 'verified',
            ],
            [
                'name' => 'Agent Pending',
                'email' => 'pending.agent@example.com',
                'password' => Hash::make('password123'),
                'role' => 'agent',
                'phone' => '087777777777',
                'business_name' => 'Pending Travel',
                'business_license' => 'SIUP-007-BDG-2024',
                'business_address' => 'Jl. Contoh No. 30, Bandung',
                'verification_status' => 'pending',
            ],
        ];

        foreach ($agents as $agent) {
            User::updateOrCreate(
                ['email' => $agent['email']],
                $agent
            );
        }

        // Create Sample Users (15 users untuk membuat banyak bookings dan reviews)
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'user@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '088888888888',
                'address' => 'Jl. Contoh User No. 1, Jakarta',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '089999999999',
                'address' => 'Jl. Contoh User No. 2, Bandung',
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111112',
                'address' => 'Jl. Sudirman No. 25, Jakarta',
            ],
            [
                'name' => 'Siti Rahayu',
                'email' => 'siti@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111113',
                'address' => 'Jl. Diponegoro No. 15, Surabaya',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi.user@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111114',
                'address' => 'Jl. Malioboro No. 10, Yogyakarta',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111115',
                'address' => 'Jl. Asia Afrika No. 30, Bandung',
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111116',
                'address' => 'Jl. Gatot Subroto No. 40, Jakarta',
            ],
            [
                'name' => 'Lia Amelia',
                'email' => 'lia@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111117',
                'address' => 'Jl. Merdeka No. 12, Bandung',
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111118',
                'address' => 'Jl. Pemuda No. 8, Surabaya',
            ],
            [
                'name' => 'Nina Kartika',
                'email' => 'nina@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111119',
                'address' => 'Jl. Solo No. 15, Yogyakarta',
            ],
            [
                'name' => 'Agus Setiawan',
                'email' => 'agus@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111120',
                'address' => 'Jl. Ahmad Yani No. 22, Medan',
            ],
            [
                'name' => 'Fitri Handayani',
                'email' => 'fitri@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111121',
                'address' => 'Jl. Veteran No. 18, Jakarta',
            ],
            [
                'name' => 'Doni Saputra',
                'email' => 'doni@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111122',
                'address' => 'Jl. Pahlawan No. 9, Bandung',
            ],
            [
                'name' => 'Maya Sari',
                'email' => 'maya@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111123',
                'address' => 'Jl. Raya No. 33, Surabaya',
            ],
            [
                'name' => 'Hendra Gunawan',
                'email' => 'hendra@example.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'phone' => '081111111124',
                'address' => 'Jl. Proklamasi No. 7, Jakarta',
            ],
        ];

        $agentCount = count($agents);
        $userCount = count($users);

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                $user
            );
        }

        $this->command->info('Data users berhasil di-seed! Total: ' . ($agentCount + $userCount + 1) . ' users (1 admin + ' . $agentCount . ' agents + ' . $userCount . ' users).');
    }
}

