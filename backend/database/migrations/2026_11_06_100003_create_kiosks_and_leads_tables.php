<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kiosks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('showroom_id')->constrained()->cascadeOnDelete();
            $table->foreignId('floor_id')->nullable()->constrained('showroom_floors')->nullOnDelete();
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->float('pos_x')->default(0);
            $table->float('pos_y')->default(0);
            $table->float('pos_z')->default(0);
            $table->string('status')->default('online'); // online, offline, maintenance
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });

        Schema::create('kiosk_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kiosk_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();
            $table->json('cars_viewed')->nullable();
            $table->timestamps();
        });

        Schema::create('kiosk_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kiosk_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('action')->default('test_drive'); // test_drive, call_staff
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kiosk_leads');
        Schema::dropIfExists('kiosk_sessions');
        Schema::dropIfExists('kiosks');
    }
};

