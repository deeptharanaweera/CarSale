<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        Schema::create('car_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('body_type')->index(); // Sedan, SUV, Coupe, Convertible, Electric, Hatchback
            $table->timestamps();
        });

        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('General'); // Safety, Interior, Technology, Performance
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_id')->constrained('car_models')->cascadeOnDelete();
            $table->foreignId('showroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('slot_id')->nullable()->unique()->constrained('showroom_slots')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique()->index();
            $table->integer('year')->index();
            $table->decimal('price', 12, 2)->index();
            $table->integer('mileage')->default(0);
            $table->string('fuel')->default('Petrol'); // Petrol, Diesel, Electric, Hybrid
            $table->string('transmission')->default('Automatic'); // Automatic, Manual, Dual-Clutch
            $table->string('color')->nullable();
            $table->string('vin')->unique()->nullable();
            $table->string('condition')->default('New'); // New, Certified Pre-Owned, Used
            $table->text('description')->nullable();
            $table->string('status')->default('available')->index(); // available, reserved, sold
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('location_updated_at')->nullable();
            $table->timestamps();

            $table->index(['showroom_id', 'status']);
            $table->index(['price', 'year']);
        });

        Schema::create('car_feature', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();
            $table->unique(['car_id', 'feature_id']);
        });

        Schema::create('car_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('type')->default('gallery'); // gallery, 360, interior
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('car_models_3d', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->string('glb_url');
            $table->json('variants')->nullable(); // color variants, rim variants
            $table->json('interior_camera')->nullable(); // target, position
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('car_models_3d');
        Schema::dropIfExists('car_images');
        Schema::dropIfExists('car_feature');
        Schema::dropIfExists('cars');
        Schema::dropIfExists('features');
        Schema::dropIfExists('car_models');
        Schema::dropIfExists('brands');
    }
};

