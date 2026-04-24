<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Booking;
use App\Models\Travel;
use App\Models\User;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing reviews first
        Review::query()->delete();

        // Get completed bookings ONLY
        $completedBookings = Booking::where('status', 'completed')
            ->with(['user', 'travel', 'agent'])
            ->get();

        if ($completedBookings->isEmpty()) {
            $this->command->warn('Tidak ada completed bookings. Review hanya bisa dibuat dari completed bookings.');
            $this->command->warn('Jalankan BookingSeeder terlebih dahulu untuk membuat completed bookings.');
            return;
        }

        $reviews = [];
        $ratings = [5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 3, 5, 4, 5, 4]; // Mostly positive ratings (4-5 stars)
        $comments = [
            'Pelayanan sangat baik, sopir ramah dan perjalanan nyaman. Sangat merekomendasikan!',
            'Travel tepat waktu, mobil bersih dan fasilitas lengkap. Puas dengan pelayanannya.',
            'Sangat puas dengan pelayanannya, harga juga terjangkau. Worth it!',
            'Recommended! Travel yang nyaman dan aman. Driver sangat profesional.',
            'Perjalanan lancar, driver profesional dan berpengalaman. Akan booking lagi.',
            'Mobil baru dan bersih, AC dingin, sangat nyaman. Terima kasih!',
            'Harga sesuai dengan pelayanan yang diberikan. Memuaskan!',
            'Sangat membantu untuk perjalanan bisnis. Tepat waktu dan nyaman.',
            'Travel terbaik yang pernah saya gunakan! Highly recommended.',
            'Pelayanan excellent, akan booking lagi next time. Terima kasih!',
            'Perjalanan menyenangkan, sopir ramah dan informatif tentang rute.',
            'Mobil terawat dengan baik, perjalanan smooth tanpa kendala.',
            'Booking mudah, pelayanan cepat, perjalanan nyaman. Perfect!',
            'Driver sangat membantu dengan bagasi. Pelayanan ramah dan profesional.',
            'Fasilitas lengkap, harga terjangkau. Sangat puas!',
        ];

        // Create reviews from ALL completed bookings (80% of them will leave review)
        $bookingsWithReview = $completedBookings->shuffle()->take((int)($completedBookings->count() * 0.8));

        foreach ($bookingsWithReview as $index => $booking) {
            $rating = $ratings[$index % count($ratings)];
            $comment = $comments[$index % count($comments)];

            $review = Review::create([
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'travel_id' => $booking->travel_id,
                'agent_id' => $booking->agent_id,
                'rating' => $rating,
                'comment' => $comment,
            ]);

            $reviews[] = $review;
        }

        // Update all travel ratings
        $travels = Travel::all();
        foreach ($travels as $travel) {
            $travel->updateRating();
        }

        $this->command->info('Data review berhasil di-seed!');
        $this->command->info('  - Total reviews: ' . count($reviews));
        $this->command->info('  - Dari completed bookings: ' . $completedBookings->count());
        $this->command->info('  - Persentase review: ' . round((count($reviews) / $completedBookings->count()) * 100) . '%');
    }
}

