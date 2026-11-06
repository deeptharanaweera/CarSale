<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('showrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('address');
            $table->string('city')->index();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('phone')->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        Schema::create('showroom_floors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('showroom_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('level')->default(1);
            $table->string('model_url')->nullable(); // GLB 3D floor plan
            $table->string('navmesh_url')->nullable();
            $table->float('scale')->default(1.0);
            $table->timestamps();
        });

        Schema::create('showroom_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('floor_id')->constrained('showroom_floors')->cascadeOnDelete();
            $table->string('label'); // e.g. "Slot A1", "VIP-01"
            $table->float('pos_x')->default(0);
            $table->float('pos_y')->default(0);
            $table->float('pos_z')->default(0);
            $table->float('rotation_y')->default(0);
            $table->string('type')->default('indoor'); // indoor, outdoor, service
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('showroom_slots');
        Schema::dropIfExists('showroom_floors');
        Schema::dropIfExists('showrooms');
    }
};

