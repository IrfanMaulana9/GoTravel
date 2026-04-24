<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class TravelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->isMethod('patch') || $this->isMethod('put')) {
            // Update: all fields are optional
            return [
                'agent_name' => 'nullable|string|max:100',
                'from_city' => 'nullable|string|max:50',
                'to_city' => 'nullable|string|max:50',
                'depart_time' => 'nullable|date_format:H:i:s',
                'arrival_time' => 'nullable|date_format:H:i:s|after:depart_time',
                'duration' => 'nullable|string|max:20',
                'price' => 'nullable|integer|min:0',
                'seats' => 'nullable|integer|min:1|max:20',
                'type' => 'nullable|in:Shuttle Car,Private Car',
                'rating' => 'nullable|numeric|min:0|max:5',
                'reviews' => 'nullable|integer|min:0',
                'facilities' => 'nullable|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB = 5120KB
                'description' => 'nullable|string',
            ];
        }

        // Create: all required fields
        return [
            'agent_name' => 'nullable|string|max:100', // Will be auto-filled from agent info
            'from_city' => 'required|string|max:50',
            'to_city' => 'required|string|max:50',
            'depart_time' => 'required|date_format:H:i:s',
            'arrival_time' => 'required|date_format:H:i:s|after:depart_time',
            'duration' => 'required|string|max:20',
            'price' => 'required|integer|min:0',
            'seats' => 'required|integer|min:1|max:20',
            'type' => 'required|in:Shuttle Car,Private Car',
            'rating' => 'nullable|numeric|min:0|max:5',
            'reviews' => 'nullable|integer|min:0',
            'facilities' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB = 5120KB
            'description' => 'nullable|string',
        ];
    }

    /**
     * Custom validation messages
     */
    public function messages(): array
    {
        return [
            'arrival_time.after' => 'Waktu kedatangan harus setelah waktu keberangkatan.',
            'type.in' => 'Tipe harus Shuttle Car atau Private Car.',
            'price.min' => 'Harga tidak boleh negatif.',
            'seats.max' => 'Jumlah kursi maksimal 20.',
            'image.image' => 'File harus berupa gambar.',
            'image.mimes' => 'Gambar harus berformat jpeg, png, jpg, atau gif.',
            'image.max' => 'Ukuran gambar maksimal 5MB.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        if ($this->has('facilities') && is_array($this->facilities)) {
            $this->merge([
                'facilities' => json_encode($this->facilities),
            ]);
        }
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
