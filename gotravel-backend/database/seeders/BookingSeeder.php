<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Travel;
use App\Models\User;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing bookings first (to avoid foreign key issues)
        Booking::query()->delete();

        // Get users and travels
        $users = User::where('role', 'user')->get();
        $travels = Travel::where('is_active', true)->get();

        if ($users->isEmpty() || $travels->isEmpty()) {
            $this->command->warn('Users atau Travels belum ada. Pastikan UserSeeder dan TravelSeeder sudah dijalankan.');
            return;
        }

        $bookings = [];
        $completedCount = 0;
        $confirmedCount = 0;
        $pendingCount = 0;

        // Create bookings for EACH travel with different statuses
        // Prioritas: buat banyak completed bookings untuk review
        foreach ($travels as $travelIndex => $travel) {
            // Setiap travel akan mendapat 2-4 bookings
            $numBookings = rand(2, 4);
            
            for ($i = 0; $i < $numBookings; $i++) {
                if ($travel->available_seats <= 0) break;

                $user = $users->random();
                $quantity = rand(1, min(2, $travel->available_seats));
                $totalPrice = $travel->price * $quantity;

                // 70% completed, 20% confirmed, 10% pending
                $rand = rand(1, 100);
                if ($rand <= 70) {
                    $status = 'completed';
                    $completedCount++;
                } elseif ($rand <= 90) {
                    $status = 'confirmed';
                    $confirmedCount++;
                } else {
                    $status = 'pending';
                    $pendingCount++;
                }
                
                // Completed bookings = past dates, others = future dates
                if ($status === 'completed') {
                    $travelDate = Carbon::now()->subDays(rand(7, 60))->format('Y-m-d');
                } else {
                    $travelDate = Carbon::now()->addDays(rand(1, 30))->format('Y-m-d');
                }
                
                $booking = Booking::create([
                    'user_id' => $user->id,
                    'travel_id' => $travel->id,
                    'agent_id' => $travel->agent_id,
                    'travel_date' => $travelDate,
                    'quantity' => $quantity,
                    'total_price' => $totalPrice,
                    'status' => $status,
                    'passenger_name' => $user->name,
                    'passenger_phone' => $user->phone ?? '081234567890',
                    'passenger_address' => $user->address ?? 'Alamat penumpang',
                    'pickup_location' => 'Terminal ' . $travel->from_city,
                    'notes' => $status === 'pending' ? 'Menunggu konfirmasi pembayaran' : 'Booking confirmed',
                    'payment_method' => $status === 'pending' ? null : 'Transfer Bank',
                    'payment_status' => $status === 'pending' ? 'pending' : 'paid',
                    'paid_at' => $status === 'pending' ? null : Carbon::now()->subDays(rand(1, 60)),
                ]);

                // Update available seats
                $travel->decrement('available_seats', $quantity);

                $bookings[] = $booking;
            }
        }

        $this->command->info('Data booking berhasil di-seed! Total: ' . count($bookings) . ' bookings');
        $this->command->info('  - Completed: ' . $completedCount);
        $this->command->info('  - Confirmed: ' . $confirmedCount);
        $this->command->info('  - Pending: ' . $pendingCount);
    }
}

