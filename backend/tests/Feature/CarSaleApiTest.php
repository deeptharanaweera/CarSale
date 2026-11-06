<?php

namespace Tests\Feature;

use Tests\TestCase;

class CarSaleApiTest extends TestCase
{
    public function test_public_cars_endpoint_returns_data(): void
    {
        $response = $this->getJson('/api/v1/cars');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => ['id', 'title', 'price', 'year', 'slug', 'status']
            ]
        ]);
    }

    public function test_kiosk_config_with_token(): void
    {
        $response = $this->withHeaders([
            'X-Kiosk-Token' => 'KIOSK_TOKEN_NYC_01',
        ])->getJson('/api/v1/kiosk/config');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_admin_dashboard_stats(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard/stats');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'overview' => [
                    'total_cars',
                    'available_cars',
                    'inventory_value',
                ],
                'charts',
            ],
        ]);
    }
}

