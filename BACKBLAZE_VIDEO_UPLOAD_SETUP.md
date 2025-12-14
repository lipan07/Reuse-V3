# Backblaze B2 Video Upload Setup Guide

This guide explains how to set up direct video uploads to Backblaze B2 from the React Native app.

## Overview

The app now uploads videos **directly from React Native** to Backblaze B2 storage. The flow is:

1. App gets Backblaze credentials from backend (once, cached)
2. App authorizes with Backblaze directly
3. App uploads video file directly to Backblaze
4. App gets the file URL
5. App sends the URL with form data when submitting a post

## Frontend Implementation

### 1. Backblaze Service (`service/backblazeService.js`)

The service handles:

- Requesting signed upload URLs from your backend
- Uploading video files directly to Backblaze
- Returning the public video URL

### 2. Video Picker Component

The `VideoPickerComponent` has been updated to:

- Upload videos directly to Backblaze when a video is selected
- Store the video URL in `formData.videoUrl`
- Store the video ID in `formData.videoId`
- Show upload progress

### 3. Form Submission

The form automatically includes `videoUrl` and `videoId` when submitting, as these are part of `formData`.

## Backend Setup Required

### Step 1: Install Backblaze B2 PHP SDK (if not already installed)

```bash
cd Reuse-Backend
composer require league/flysystem-aws-s3-v3 "^3.0"
```

Or use the Backblaze B2 PHP library:

```bash
composer require backblaze/b2-sdk-php
```

### Step 2: Add Backblaze Credentials to `.env`

Add these to your Laravel `.env` file:

```env
BACKBLAZE_ACCOUNT_ID=your_account_id
BACKBLAZE_APPLICATION_KEY=your_application_key
BACKBLAZE_BUCKET_ID=your_bucket_id
BACKBLAZE_BUCKET_NAME=your_bucket_name
```

### Step 3: Backend Controller (Already Created)

The `BackblazeController` has been created at:

- `Reuse-Backend/app/Http/Controllers/BackblazeController.php`

This controller provides Backblaze credentials to authenticated users so they can upload directly from React Native.

### Step 4: Add Route (Already Added)

The route has been added to `Reuse-Backend/routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    // ... existing routes ...
    Route::get('/backblaze/credentials', [BackblazeController::class, 'getCredentials']);
});
```

### Step 5: Add Video Fields to Database

You need to add `video_url` and `video_id` fields to store the Backblaze video URL.

**Create Migration:**

```bash
php artisan make:migration add_video_fields_to_post_houses_apartments_table
```

**Migration Content:**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_houses_apartments', function (Blueprint $table) {
            $table->string('video_url', 500)->nullable()->after('description');
            $table->string('video_id', 100)->nullable()->after('video_url');
        });
    }

    public function down(): void
    {
        Schema::table('post_houses_apartments', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'video_id']);
        });
    }
};
```

### Step 6: Update PostHousesApartment Model

Add `video_url` and `video_id` to the `$fillable` array:

```php
protected $fillable = [
    'post_id',
    'property_type',
    // ... existing fields ...
    'description',
    'video_url',  // Add this
    'video_id',   // Add this
];
```

### Step 7: Update restructureStoreData Method

Update `PostHousesApartment::restructureStoreData()` to handle video fields:

```php
public static function restructureStoreData($data)
{
    $restructuredData = [
        // ... existing fields ...
        'description' => $data['description'] ?? null,
        'video_url' => $data['videoUrl'] ?? null,  // Add this
        'video_id' => $data['videoId'] ?? null,     // Add this
    ];

    return self::updateOrCreate(['post_id' => $data['post_id'] ?? null,], $restructuredData);
}
```

## Testing

1. **Test Video Upload:**

   - Select a video in the form
   - Verify it uploads to Backblaze
   - Check that `videoUrl` and `videoId` are set in formData

2. **Test Form Submission:**
   - Submit the form with a video
   - Verify the video URL is saved in the database
   - Check that the video URL is returned in the API response

## Troubleshooting

### Error: "Failed to get upload URL"

- Check that Backblaze credentials are set in `.env`
- Verify the backend endpoint is accessible
- Check backend logs for detailed error messages

### Error: "Upload failed"

- Check internet connection
- Verify file size is within limits
- Check Backblaze bucket permissions

### Video URL not saving

- Verify the migration ran successfully
- Check that `video_url` and `video_id` are in the model's `$fillable` array
- Verify `restructureStoreData` includes video fields

## Security Notes

- Backblaze credentials should NEVER be exposed in the frontend
- Always use backend-assisted upload (current implementation)
- Consider adding file size limits
- Consider adding file type validation
- Consider adding rate limiting for upload requests
